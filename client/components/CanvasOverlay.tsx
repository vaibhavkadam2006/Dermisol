'use client';

import { useEffect, useRef } from 'react';

// MediaPipe Face Mesh Connections
const FACE_CONNECTIONS = [
  // Lips
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 320],
  [320, 307], [307, 375], [375, 321], [321, 308], [308, 324], [324, 318], [318, 402], [402, 317],
  [317, 14], [14, 87], [87, 178], [178, 88], [88, 95],
  // Left eye
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133],
  [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  // Right eye
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390], [390, 249], [249, 263],
  [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
  // Face oval
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
  [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
  [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54],
  [54, 103], [103, 67], [67, 109], [109, 10],
  // Eyebrows
  [46, 53], [53, 52], [52, 65], [65, 55], [55, 70], [70, 63], [63, 105], [105, 66], [66, 107],
  [276, 283], [283, 282], [282, 295], [295, 285], [285, 300], [300, 293], [293, 334], [334, 296], [296, 336],
  // Nose
  [1, 2], [2, 98], [98, 327], [327, 326], [326, 2],
];

interface CanvasOverlayProps {
  image: HTMLImageElement | null;
  landmarks: { x: number; y: number }[] | null;
  boxes?: { x: number; y: number; w: number; h: number; score: number }[];
}

// Helper to color-code based on confidence
function getColorForScore(score: number) {
  if (score > 0.40) return '#ef4444'; // Bright Red (High Confidence)
  if (score > 0.20) return '#f97316'; // Orange (Medium Confidence)
  return '#eab308';                   // Yellow (Low Confidence/Suspicious)
}

export function CanvasOverlay({ image, landmarks, boxes }: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // 1. Draw Face Mesh Connections (Subtle)
    if (landmarks && landmarks.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 224, 255, 0.25)'; // Highly transparent to not distract
      ctx.lineWidth = 1;
      for (const [start, end] of FACE_CONNECTIONS) {
        const p1 = landmarks[start];
        const p2 = landmarks[end];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // 2. Draw YOLO Bounding Boxes
    if (boxes && boxes.length > 0) {
      for (const box of boxes) {
        const boxColor = 'yellow';

        // Draw the box with thin border
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x, box.y, box.w, box.h);
      }
    }
  }, [image, landmarks, boxes]);

  if (!image) return <div className="bg-slate-100 rounded-2xl flex items-center justify-center h-full w-full text-slate-400 font-medium border-2 border-dashed border-slate-300">No image uploaded</div>;

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-xl shadow-inner border border-slate-200"
      style={{ maxWidth: '100%', aspectRatio: 'auto' }}
    />
  );
}