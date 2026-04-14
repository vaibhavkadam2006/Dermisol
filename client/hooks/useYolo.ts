import { useState, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
}

// MediaPipe indices that form the outer silhouette of the face
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 
  379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 
  234, 127, 162, 21, 54, 103, 67, 109
];

// Ray-casting algorithm to check if a point is inside a polygon
function isPointInPolygon(point: {x: number, y: number}, polygon: {x: number, y: number}[]) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

export function useYolo() {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const loadedModel = await tf.loadGraphModel('/best_web_model/model.json');
        setModel(loadedModel);
        console.log("YOLO Model loaded successfully.");
      } catch (err) {
        console.error("Failed to load YOLO model:", err);
      } finally {
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const detectAcne = useCallback(async (
    image: HTMLImageElement, 
    landmarks: { x: number; y: number }[] | null
  ): Promise<BoundingBox[]> => {
    if (!model) return [];

    // --- 1. PREPROCESSING: CROP TO FACE (High Res ROI) ---
    let cropX = 0, cropY = 0, cropW = image.width, cropH = image.height;
    
    if (landmarks && landmarks.length > 0) {
      const xs = landmarks.map(l => l.x);
      const ys = landmarks.map(l => l.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      // Add 10% padding so we don't cut off acne on the jawline
      const w = maxX - minX;
      const h = maxY - minY;
      const paddingX = w * 0.1;
      const paddingY = h * 0.1;

      cropX = Math.max(0, minX - paddingX);
      cropY = Math.max(0, minY - paddingY);
      cropW = Math.min(image.width - cropX, w + paddingX * 2);
      cropH = Math.min(image.height - cropY, h + paddingY * 2);
    }

    // Extract the cropped face to an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // --- 2. LETTERBOXING THE CROPPED FACE ---
    const targetSize = 1024;
    const scale = Math.min(targetSize / cropW, targetSize / cropH);
    const newW = Math.round(cropW * scale);
    const newH = Math.round(cropH * scale);
    
    const padTop = Math.floor((targetSize - newH) / 2);
    const padBottom = targetSize - newH - padTop;
    const padLeft = Math.floor((targetSize - newW) / 2);
    const padRight = targetSize - newW - padLeft;

    const tensor = tf.tidy(() => {
      const imgTensor = tf.browser.fromPixels(canvas); // Pass the cropped canvas!
      const resizedTensor = tf.image.resizeBilinear(imgTensor, [newH, newW]);
      const paddedTensor = tf.pad(resizedTensor, [[padTop, padBottom], [padLeft, padRight], [0, 0]]);
      return paddedTensor.expandDims(0).toFloat().div(255.0);
    });

    // --- 3. RUN INFERENCE ---
    const predictions = await model.executeAsync(tensor) as tf.Tensor;
    
    // --- 4. PARSE & NMS ---
    const { boxesTensor, scoresTensor, nmsBoxes } = tf.tidy(() => {
      const transRes = predictions.transpose([0, 2, 1]); 
      const bTensor = transRes.slice([0, 0, 0], [1, -1, 4]).squeeze() as tf.Tensor2D; 
      const sTensor = transRes.slice([0, 0, 4], [1, -1, 1]).squeeze() as tf.Tensor1D; 

      const cx = bTensor.slice([0, 0], [-1, 1]);
      const cy = bTensor.slice([0, 1], [-1, 1]);
      const w = bTensor.slice([0, 2], [-1, 1]);
      const h = bTensor.slice([0, 3], [-1, 1]);

      const halfW = w.div(2);
      const halfH = h.div(2);

      const nBoxes = tf.concat([cy.sub(halfH), cx.sub(halfW), cy.add(halfH), cx.add(halfW)], 1) as tf.Tensor2D;
      return { boxesTensor: bTensor, scoresTensor: sTensor, nmsBoxes: nBoxes };
    });

    const nmsIndices = await tf.image.nonMaxSuppressionAsync(
      nmsBoxes, scoresTensor, 150, 0.30, 0.01 // Adjusted thresholds for better recall
    );

    const boxesArray = await boxesTensor.array() as number[][];
    const scoresArray = await scoresTensor.array() as number[];
    const indicesArray = await nmsIndices.array();

    // --- 5. TRANSLATE & FILTER RESULTS ---
    const results: BoundingBox[] = [];
    const facePolygon = landmarks ? FACE_OVAL_INDICES.map(idx => landmarks[idx]) : null;
    
    for (let i = 0; i < indicesArray.length; i++) {
      const idx = indicesArray[i];
      let [x_center, y_center, width, height] = boxesArray[idx];
      
      // Remove padding and scale back to the *cropped* canvas size
      x_center = (x_center - padLeft) / scale;
      y_center = (y_center - padTop) / scale;
      width = width / scale;
      height = height / scale;

      // Translate back to the *original full image* coordinates
      const finalX = x_center + cropX;
      const finalY = y_center + cropY;

      // --- POST-PROCESSING MASK ---
      // If we have landmarks, strictly enforce that the acne is inside the face shape
      if (facePolygon) {
        const isInsideFace = isPointInPolygon({ x: finalX, y: finalY }, facePolygon);
        if (!isInsideFace) continue; // Skip this box, it's not on the face!
      }

      results.push({
        x: finalX - width / 2,
        y: finalY - height / 2,
        w: width,
        h: height,
        score: scoresArray[idx]
      });
    }

    tf.dispose([tensor, predictions, boxesTensor, scoresTensor, nmsBoxes, nmsIndices]);
    return results;
  }, [model]);

  return { model, isModelLoading, detectAcne };
}