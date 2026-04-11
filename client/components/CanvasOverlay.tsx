'use client';

import { useEffect, useRef } from 'react';
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh'; // optional, but we'll define our own

// Predefined connections for MediaPipe Face Mesh (468 landmarks)
// This is a subset of the full tesselation; the complete list has ~1000 connections.
// For brevity, we use a compact set that still shows the face structure.
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
}

export function CanvasOverlay({ image, landmarks }: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw connections (mesh)
    ctx.beginPath();
    ctx.strokeStyle = '#00e0ff';
    ctx.lineWidth = 1.2;
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

    // Draw landmark points
    ctx.fillStyle = '#ffd966';
    for (const pt of landmarks) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [image, landmarks]);

  if (!image) return <div className="bg-gray-100 rounded-2xl flex items-center justify-center h-80">No image</div>;

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-2xl shadow-md"
      style={{ maxWidth: '100%', aspectRatio: 'auto' }}
    />
  );
}