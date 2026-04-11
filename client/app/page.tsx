// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { StageCard } from "@/components/StageCard";
// import { AnalysisControls } from "@/components/AnalysisControls";
// import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
// import { useSkinAnalysis } from "@/hooks/useSkinAnalysis";
// import type { AnalysisResult } from "@/lib/analysisEngine";

// interface StoredData {
//   imageDataURL: string;
//   analysis: AnalysisResult;
//   landmarks: any;
// }

// export default function Home() {
//   const { detectLandmarks, loading: faceLoading } = useFaceLandmarker();
//   const { analysis, isAnalyzing, runAnalysis } = useSkinAnalysis();

//   const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
//     null,
//   );
//   const [currentLandmarks, setCurrentLandmarks] = useState<any>(null);
//   const [stages, setStages] = useState({
//     now: {
//       image: null as HTMLImageElement | null,
//       analysis: null as AnalysisResult | null,
//       landmarks: null as any,
//     },
//     short: {
//       image: null as HTMLImageElement | null,
//       analysis: null as AnalysisResult | null,
//       landmarks: null as any,
//     },
//     long: {
//       image: null as HTMLImageElement | null,
//       analysis: null as AnalysisResult | null,
//       landmarks: null as any,
//     },
//   });

//   // Load stored stages from localStorage on mount
//   useEffect(() => {
//     const loadStage = async (
//       key: string,
//     ): Promise<{
//       image: HTMLImageElement | null;
//       analysis: any;
//       landmarks: any;
//     }> => {
//       const raw = localStorage.getItem(key);
//       if (!raw) return { image: null, analysis: null, landmarks: null };
//       try {
//         const data: StoredData = JSON.parse(raw);
//         const img = new Image();
//         const imgPromise = new Promise<HTMLImageElement>((resolve) => {
//           img.onload = () => resolve(img);
//           img.src = data.imageDataURL;
//         });
//         const imageEl = await imgPromise;
//         return {
//           image: imageEl,
//           analysis: data.analysis,
//           landmarks: data.landmarks,
//         };
//       } catch {
//         return { image: null, analysis: null, landmarks: null };
//       }
//     };

//     Promise.all([
//       loadStage("dermi_now"),
//       loadStage("dermi_short"),
//       loadStage("dermi_long"),
//     ]).then(([now, short, long]) => {
//       setStages({ now, short, long });
//     });
//   }, []);

//   const handleImageUpload = useCallback(
//     (file: File) => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const img = new Image();
//         img.onload = () => {
//           // Small delay to ensure the image is fully ready for MediaPipe
//           setTimeout(() => {
//             setCurrentImage(img);
//             setCurrentLandmarks(null);
//             if (detectLandmarks) {
//               const lm = detectLandmarks(img);
//               setCurrentLandmarks(lm);
//             }
//           }, 50);
//         };
//         img.src = e.target?.result as string;
//       };
//       reader.readAsDataURL(file);
//     },
//     [detectLandmarks],
//   );

//   const handleAnalyze = useCallback(async () => {
//     if (!currentImage) return;
//     const landmarks = detectLandmarks ? detectLandmarks(currentImage) : null;
//     setCurrentLandmarks(landmarks);
//     await runAnalysis(currentImage, landmarks);
//   }, [currentImage, detectLandmarks, runAnalysis]);

//   const handleSave = useCallback(
//     (stage: "now" | "short" | "long") => {
//       if (!currentImage || !analysis) {
//         alert("Please upload and run analysis first");
//         return;
//       }
//       // Save image as dataURL
//       const canvas = document.createElement("canvas");
//       canvas.width = currentImage.width;
//       canvas.height = currentImage.height;
//       const ctx = canvas.getContext("2d");
//       ctx?.drawImage(currentImage, 0, 0);
//       const imageDataURL = canvas.toDataURL("image/png");
//       const storedData: StoredData = {
//         imageDataURL,
//         analysis,
//         landmarks: currentLandmarks,
//       };
//       const key =
//         stage === "now"
//           ? "dermi_now"
//           : stage === "short"
//             ? "dermi_short"
//             : "dermi_long";
//       localStorage.setItem(key, JSON.stringify(storedData));
//       setStages((prev) => ({
//         ...prev,
//         [stage]: { image: currentImage, analysis, landmarks: currentLandmarks },
//       }));
//       alert(`Saved to ${stage.toUpperCase()} stage`);
//     },
//     [currentImage, analysis, currentLandmarks],
//   );

//   const handleReset = () => {
//     localStorage.removeItem("dermi_now");
//     localStorage.removeItem("dermi_short");
//     localStorage.removeItem("dermi_long");
//     window.location.reload();
//   };

//   return (
//     <main className="max-w-7xl mx-auto px-4 py-6">
//       <div className="text-center mb-6">
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
//           DermiScan AI
//         </h1>
//         <p className="text-slate-500 mt-1">
//           Non-diagnostic skin health analysis with facial overlays
//         </p>
//         <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mt-4 text-sm text-amber-800 rounded max-w-2xl mx-auto">
//           ⚠️ For research &amp; educational use only. Not a medical diagnosis.
//         </div>
//       </div>

//       <AnalysisControls
//         onImageUpload={handleImageUpload}
//         onAnalyze={handleAnalyze}
//         isAnalyzing={isAnalyzing}
//         hasImage={!!currentImage}
//         onSave={handleSave}
//         onReset={handleReset}
//       />

//       {faceLoading && (
//         <div className="text-center text-sm text-slate-400">
//           Loading face detector...
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//         <StageCard
//           title="📌 NOW"
//           subtitle="Current condition"
//           titleColor="text-blue-800"
//           image={stages.now.image}
//           analysis={stages.now.analysis}
//           landmarks={stages.now.landmarks}
//         />
//         <StageCard
//           title="📈 SHORT TERM"
//           subtitle="Texture improvement"
//           titleColor="text-emerald-800"
//           image={stages.short.image}
//           analysis={stages.short.analysis}
//           landmarks={stages.short.landmarks}
//         />
//         <StageCard
//           title="🏆 LONG TERM"
//           subtitle="Cleared, even skin"
//           titleColor="text-amber-800"
//           image={stages.long.image}
//           analysis={stages.long.analysis}
//           landmarks={stages.long.landmarks}
//         />
//       </div>
//     </main>
//   );
// }

'use client';

import { useState, useCallback } from 'react';
import { CanvasOverlay } from '@/components/CanvasOverlay';
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker';
import { extractFaceMesh } from '@/lib/analysisEngine';

export default function Home() {
  const { detectLandmarks, loading: faceLoading, error: faceError } = useFaceLandmarker();
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [meshLandmarks, setMeshLandmarks] = useState<{ x: number; y: number }[] | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        setMeshLandmarks(null); // clear previous mesh
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDetectMesh = useCallback(async () => {
    if (!currentImage || !detectLandmarks) return;
    setIsDetecting(true);
    // Small delay to ensure image is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    const rawLandmarks = detectLandmarks(currentImage);
    if (rawLandmarks) {
      const mesh = extractFaceMesh(currentImage.width, currentImage.height, rawLandmarks);
      setMeshLandmarks(mesh.landmarks);
    } else {
      alert('No face detected. Please use a clear, front-facing photo.');
      setMeshLandmarks(null);
    }
    setIsDetecting(false);
  }, [currentImage, detectLandmarks]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Face Mesh Tester</h1>
      <p className="text-center text-slate-500 mb-6">Upload a photo to see MediaPipe face landmarks</p>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full cursor-pointer">
          📸 Upload Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </label>
        <button
          onClick={handleDetectMesh}
          disabled={!currentImage || isDetecting || faceLoading}
          className={`px-5 py-2 rounded-full ${
            currentImage && !isDetecting && !faceLoading
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isDetecting ? '🔬 Detecting...' : '🔍 Detect Face Mesh'}
        </button>
      </div>

      {faceLoading && <div className="text-center text-slate-500">Loading face detector...</div>}
      {faceError && <div className="text-center text-red-600">Error: {faceError}</div>}

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <CanvasOverlay image={currentImage} landmarks={meshLandmarks} />
      </div>

      {meshLandmarks && (
        <div className="text-center text-green-600 mt-4">
          ✅ Face mesh detected with {meshLandmarks.length} landmarks
        </div>
      )}
    </main>
  );
}