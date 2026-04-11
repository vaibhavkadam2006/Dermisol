'use client';

import { useRef } from 'react';

interface AnalysisControlsProps {
  onImageUpload: (file: File) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasImage: boolean;
  onSave: (stage: 'now' | 'short' | 'long') => void;
  onReset: () => void;
}

export function AnalysisControls({ onImageUpload, onAnalyze, isAnalyzing, hasImage, onSave, onReset }: AnalysisControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow"
      >
        📸 Upload Photo
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <button
        onClick={onAnalyze}
        disabled={!hasImage || isAnalyzing}
        className={`px-5 py-2 rounded-full text-sm font-medium shadow ${
          hasImage && !isAnalyzing
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? '🔬 Analyzing...' : '🔍 Run Analysis'}
      </button>
      <button
        onClick={() => onSave('now')}
        disabled={!hasImage}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow disabled:opacity-50"
      >
        💾 Save as NOW
      </button>
      <button
        onClick={() => onSave('short')}
        disabled={!hasImage}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow disabled:opacity-50"
      >
        📈 Save as Short Term
      </button>
      <button
        onClick={() => onSave('long')}
        disabled={!hasImage}
        className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow disabled:opacity-50"
      >
        🏆 Save as Long Term
      </button>
      <button
        onClick={onReset}
        className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow"
      >
        ⟳ Reset All
      </button>
    </div>
  );
}