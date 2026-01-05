'use client';

import { useState } from 'react';

interface HoverWordProps {
  word: string;
  translation?: string | null;
  partOfSpeech?: string;
  className?: string;
}

export function HoverWord({ word, translation, partOfSpeech, className = '' }: HoverWordProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show tooltip if no translation available
  if (!translation) {
    return <span className={className}>{word}</span>;
  }

  return (
    <span className="relative inline-block">
      <span
        className={`cursor-help border-b border-dashed border-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {word}
      </span>

      {showTooltip && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
          <span className="font-semibold">{translation}</span>
          {partOfSpeech && (
            <span className="text-gray-400 text-xs ml-2">({partOfSpeech})</span>
          )}
          {/* Tooltip arrow */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
        </span>
      )}
    </span>
  );
}
