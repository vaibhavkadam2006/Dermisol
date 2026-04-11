import { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/analysisEngine';
import { generateAnalysisFromImage } from '@/lib/analysisEngine';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export function useSkinAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = useCallback(
    async (imageElement: HTMLImageElement, landmarks: NormalizedLandmark[] | null) => {
      setIsAnalyzing(true);
      // Simulate async processing (real models would do work here)
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = generateAnalysisFromImage(imageElement.width, imageElement.height, landmarks);
      setAnalysis(result);
      setIsAnalyzing(false);
      return result;
    },
    []
  );

  return { analysis, isAnalyzing, runAnalysis };
}