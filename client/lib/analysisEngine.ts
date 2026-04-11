// import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// export interface Lesion {
//   id: number;
//   x: number;
//   y: number;
//   w: number;
//   h: number;
//   type: 'comedonal' | 'inflammatory' | 'other';
//   color: 'green' | 'red' | 'blue';
// }

// export interface DarkSpot {
//   cx: number;
//   cy: number;
//   rx: number;
//   ry: number;
// }

// export interface AnalysisResult {
//   severity: 'Clear' | 'Mild' | 'Moderate' | 'Severe';
//   lesionCount: number;
//   countCategory: string;
//   lesions: Lesion[];
//   hyperpigmentation: {
//     coveragePercent: number;
//     coverageText: string;
//     darkSpots: DarkSpot[];
//   };
//   zonePolygons: {
//     forehead: { x: number; y: number }[];
//     leftCheek: { x: number; y: number }[];
//     rightCheek: { x: number; y: number }[];
//     nose: { x: number; y: number }[];
//     chin: { x: number; y: number }[];
//   };
//   affectedZones: string[];
//   faceLandmarks: { x: number; y: number }[];
// }

// // Deterministic pseudo‑random generator (seeded by image dimensions)
// function seededRandom(seed: number, min: number, max: number) {
//   const x = Math.sin(seed) * 10000;
//   const r = x - Math.floor(x);
//   return min + r * (max - min);
// }

// export function generateAnalysisFromImage(
//   imgWidth: number,
//   imgHeight: number,
//   landmarks: NormalizedLandmark[] | null
// ): AnalysisResult {
//   const hasLandmarks = landmarks && landmarks.length > 0;
//   const seedBase = imgWidth * 131 + imgHeight * 253;
//   let seed = seedBase;

//   const rand = (min: number, max: number) => {
//     seed = (seed * 9301 + 49297) % 233280;
//     const rnd = seed / 233280;
//     return min + rnd * (max - min);
//   };

//   // Lesion count
//   let lesionCount = Math.floor(rand(0, 18));
//   let countCategory = '';
//   if (lesionCount <= 2) countCategory = '0-2';
//   else if (lesionCount <= 5) countCategory = '3-5';
//   else if (lesionCount <= 10) countCategory = '5-10';
//   else countCategory = '11-15+';

//   let severity: AnalysisResult['severity'] = 'Clear';
//   if (lesionCount > 10) severity = 'Severe';
//   else if (lesionCount > 5) severity = 'Moderate';
//   else if (lesionCount > 2) severity = 'Mild';

//   // Face bounding box (if landmarks exist, use them; else fallback)
//   let minX = 0, maxX = imgWidth, minY = 0, maxY = imgHeight;
//   if (hasLandmarks && landmarks) {
//     const xs = landmarks.map(l => l.x * imgWidth);
//     const ys = landmarks.map(l => l.y * imgHeight);
//     minX = Math.min(...xs);
//     maxX = Math.max(...xs);
//     minY = Math.min(...ys);
//     maxY = Math.max(...ys);
//   } else {
//     minX = imgWidth * 0.2;
//     maxX = imgWidth * 0.8;
//     minY = imgHeight * 0.2;
//     maxY = imgHeight * 0.8;
//   }

//   const types: Array<'comedonal' | 'inflammatory' | 'other'> = ['comedonal', 'inflammatory', 'other'];
//   const colors = { comedonal: 'green', inflammatory: 'red', other: 'blue' } as const;

//   // Generate lesions
//   const lesions: Lesion[] = [];
//   for (let i = 0; i < lesionCount; i++) {
//     const type = types[Math.floor(rand(0, 3))];
//     const w = (maxX - minX) * 0.08;
//     const h = (maxY - minY) * 0.08;
//     const x = minX + rand(0, maxX - minX - w);
//     const y = minY + rand(0, maxY - minY - h);
//     lesions.push({
//       id: i + 1,
//       x,
//       y,
//       w,
//       h,
//       type,
//       color: colors[type],
//     });
//   }

//   // Hyperpigmentation
//   const coveragePercent = Math.floor(rand(0, 42));
//   let coverageText = '0-10%';
//   if (coveragePercent > 10 && coveragePercent <= 20) coverageText = '10-20%';
//   else if (coveragePercent > 20 && coveragePercent <= 30) coverageText = '20-30%';
//   else if (coveragePercent > 30) coverageText = '30+%';

//   const darkSpots: DarkSpot[] = [];
//   const spotCount = Math.floor(rand(1, 6));
//   for (let s = 0; s < spotCount; s++) {
//     darkSpots.push({
//       cx: rand(minX, maxX),
//       cy: rand(minY, maxY),
//       rx: rand(15, 50),
//       ry: rand(15, 45),
//     });
//   }

//   // Zone polygons (using MediaPipe landmark indices if available)
//   let foreheadPoly: { x: number; y: number }[] = [];
//   let leftCheekPoly: { x: number; y: number }[] = [];
//   let rightCheekPoly: { x: number; y: number }[] = [];
//   let nosePoly: { x: number; y: number }[] = [];
//   let chinPoly: { x: number; y: number }[] = [];

//   if (hasLandmarks && landmarks) {
//     const points = landmarks.map(l => ({ x: l.x * imgWidth, y: l.y * imgHeight }));
//     const foreheadIdx = [10, 338, 297, 332, 284, 251, 389, 54, 103, 67, 109];
//     const leftCheekIdx = [234, 93, 132, 58, 172, 136, 150, 176, 149];
//     const rightCheekIdx = [454, 323, 361, 288, 397, 376, 378, 400, 365];
//     const noseIdx = [1, 2, 4, 5, 6, 168, 195, 197];
//     const chinIdx = [152, 148, 176, 150, 149, 136, 205, 425, 411];

//     foreheadPoly = foreheadIdx.map(i => points[i]).filter(p => p);
//     leftCheekPoly = leftCheekIdx.map(i => points[i]).filter(p => p);
//     rightCheekPoly = rightCheekIdx.map(i => points[i]).filter(p => p);
//     nosePoly = noseIdx.map(i => points[i]).filter(p => p);
//     chinPoly = chinIdx.map(i => points[i]).filter(p => p);
//   }

//   const affectedZones: string[] = [];
//   if (lesions.length > 3) affectedZones.push('forehead', 'cheeks');
//   if (darkSpots.length > 2) affectedZones.push('chin/jawline');
//   if (Math.random() > 0.6) affectedZones.push('nose');

//   return {
//     severity,
//     lesionCount,
//     countCategory,
//     lesions,
//     hyperpigmentation: { coveragePercent, coverageText, darkSpots },
//     zonePolygons: {
//       forehead: foreheadPoly,
//       leftCheek: leftCheekPoly,
//       rightCheek: rightCheekPoly,
//       nose: nosePoly,
//       chin: chinPoly,
//     },
//     affectedZones: [...new Set(affectedZones)],
//     faceLandmarks: hasLandmarks ? landmarks.map(l => ({ x: l.x * imgWidth, y: l.y * imgHeight })) : [],
//   };
// }

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FaceMeshResult {
  landmarks: { x: number; y: number }[] | null;
}

export function extractFaceMesh(
  imgWidth: number,
  imgHeight: number,
  landmarks: NormalizedLandmark[] | null
): FaceMeshResult {
  if (!landmarks) return { landmarks: null };
  const points = landmarks.map(l => ({ x: l.x * imgWidth, y: l.y * imgHeight }));
  return { landmarks: points };
}