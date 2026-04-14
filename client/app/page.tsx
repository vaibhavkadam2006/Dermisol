'use client';

import { useState, useCallback, useMemo } from 'react';
import { CanvasOverlay } from '@/components/CanvasOverlay';
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker';
import { extractFaceMesh } from '@/lib/analysisEngine';
import { useYolo, BoundingBox } from '@/hooks/useYolo';

export default function Home() {
  const { detectLandmarks, loading: faceLoading, error: faceError } = useFaceLandmarker();
  const { detectAcne, isModelLoading } = useYolo();

  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [meshLandmarks, setMeshLandmarks] = useState<{ x: number; y: number }[] | null>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        setMeshLandmarks(null);
        setBoxes([]);
        setHasRunAnalysis(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!currentImage) return;
    setIsDetecting(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    let currentLandmarks = null;

    if (detectLandmarks) {
      const rawLandmarks = detectLandmarks(currentImage);
      if (rawLandmarks) {
        const mesh = extractFaceMesh(currentImage.width, currentImage.height, rawLandmarks);
        currentLandmarks = mesh.landmarks;
        setMeshLandmarks(currentLandmarks);
      }
    }

    const detectedBoxes = await detectAcne(currentImage, currentLandmarks);
    setBoxes(detectedBoxes);
    
    setHasRunAnalysis(true);
    setIsDetecting(false);
  }, [currentImage, detectLandmarks, detectAcne]);

  // Derived logic for Severity Scoring
  const severity = useMemo(() => {
    const count = boxes.length;
    if (count === 0) return { label: 'Clear', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (count <= 3) return { label: 'Mild', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (count <= 8) return { label: 'Moderate', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Severe', color: 'bg-red-100 text-red-800 border-red-200' };
  }, [boxes]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">DermiScan AI</h1>
        <p className="text-lg text-slate-500">Local, privacy-first clinical skin analysis.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Image & Canvas (Spans 7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-slate-100 relative">
            <CanvasOverlay image={currentImage} landmarks={meshLandmarks} boxes={boxes} />
            
            {/* Absolute positioning for loading overlay */}
            {isDetecting && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center font-semibold text-indigo-600 animate-pulse">
                  Processing Neural Networks...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Controls & Results (Spans 5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Controls Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Analysis Controls</h2>
            
            <div className="flex flex-col gap-3">
              <label className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl cursor-pointer transition-colors border border-slate-300">
                📸 Upload Face Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </label>
              
              <button
                onClick={handleAnalysis}
                disabled={!currentImage || isDetecting || faceLoading || isModelLoading}
                className={`w-full py-3 rounded-xl font-bold shadow-sm transition-all ${
                  currentImage && !isDetecting && !faceLoading && !isModelLoading
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isDetecting ? 'Analyzing...' : 'Run Scan'}
              </button>
            </div>
          </div>

          {/* Results Dashboard (Only shows after analysis runs) */}
          {hasRunAnalysis && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Diagnostics Report</h2>
              
              <div className="space-y-4">
                {/* Severity Badge */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Estimated Severity</span>
                  <span className={`px-4 py-1.5 rounded-full font-bold border ${severity.color}`}>
                    {severity.label}
                  </span>
                </div>

                {/* Data Points */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Lesions Detected</span>
                  <span className="text-xl font-black text-slate-800">{boxes.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Face Map Registered</span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {meshLandmarks ? 'Successful' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}