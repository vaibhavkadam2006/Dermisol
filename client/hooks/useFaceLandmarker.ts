// import { useEffect, useState, useCallback } from 'react';
// import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';

// export function useFaceLandmarker() {
//   const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     const init = async () => {
//       try {
//         const filesetResolver = await FilesetResolver.forVisionTasks(
//           'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
//         );
//         const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
//           baseOptions: {
//             modelAssetPath:
//               'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
//             delegate: 'CPU',
//           },
//           outputFaceBlendshapes: false,
//           outputFacialTransformationMatrixes: false,
//           numFaces: 1,
//           runningMode: 'IMAGE',
//         });
//         if (mounted) {
//           setLandmarker(faceLandmarker);
//           setLoading(false);
//         }
//       } catch (err) {
//         if (mounted) {
//           setError(err instanceof Error ? err.message : 'Failed to load face landmarker');
//           setLoading(false);
//         }
//       }
//     };
//     init();
//     return () => {
//       mounted = false;
//       if (landmarker) landmarker.close();
//     };
//   }, []);

//   const detectLandmarks = useCallback(
//   (imageElement: HTMLImageElement): NormalizedLandmark[] | null => {
//     if (!landmarker) return null;
//     // Ensure image has valid dimensions
//     if (imageElement.width === 0 || imageElement.height === 0) {
//       console.warn('Image not loaded (zero dimensions)');
//       return null;
//     }
//     try {
//       const results = landmarker.detect(imageElement);
//       return results.faceLandmarks && results.faceLandmarks.length > 0 ? results.faceLandmarks[0] : null;
//     } catch (err) {
//       console.error('Face detection failed:', err);  // 👈 Now you'll see the real error
//       return null;
//     }
//   },
//   [landmarker]
// );

//   return { landmarker, loading, error, detectLandmarks };
// }

import { useEffect, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';

export function useFaceLandmarker() {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          numFaces: 1,
          runningMode: 'IMAGE',
        });
        if (mounted) {
          setLandmarker(faceLandmarker);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load face landmarker');
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      mounted = false;
      if (landmarker) landmarker.close();
    };
  }, []);

  const detectLandmarks = useCallback(
    (imageElement: HTMLImageElement): NormalizedLandmark[] | null => {
      if (!landmarker) return null;
      if (imageElement.width === 0 || imageElement.height === 0) {
        console.warn('Image not loaded (zero dimensions)');
        return null;
      }
      try {
        const results = landmarker.detect(imageElement);
        return results.faceLandmarks && results.faceLandmarks.length > 0 ? results.faceLandmarks[0] : null;
      } catch (err) {
        console.error('Face detection error:', err);
        return null;
      }
    },
    [landmarker]
  );

  return { landmarker, loading, error, detectLandmarks };
}