'use client';

import { CanvasOverlay } from './CanvasOverlay';
import type { AnalysisResult } from '@/lib/analysisEngine';

interface StageCardProps {
  title: string;
  subtitle: string;
  titleColor: string;
  image: HTMLImageElement | null;
  analysis: AnalysisResult | null;
  landmarks: any;
}

export function StageCard({ title, subtitle, titleColor, image, analysis, landmarks }: StageCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 flex flex-col">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${titleColor}`}>{title}</h2>
        <span className="text-xs bg-slate-200 px-3 py-1 rounded-full text-slate-600">{subtitle}</span>
      </div>
      <div className="p-4 bg-slate-50 flex justify-center">
        <CanvasOverlay image={image} analysis={analysis} landmarks={landmarks} />
      </div>
      <div className="p-4 text-sm space-y-2 border-t border-slate-100">
        {analysis ? (
          <>
            <div><span className="font-semibold">Severity:</span> {analysis.severity}</div>
            <div><span className="font-semibold">Lesions:</span> {analysis.lesionCount} ({analysis.countCategory})</div>
            <div><span className="font-semibold">Dark spots:</span> {analysis.hyperpigmentation.coverageText}</div>
            <div><span className="font-semibold">Affected zones:</span> {analysis.affectedZones.join(', ') || 'none'}</div>
          </>
        ) : (
          <div className="text-slate-400 italic">No analysis saved yet</div>
        )}
      </div>
    </div>
  );
}