'use client';

import { useState, useEffect } from 'react';

interface WordRotationProps {
  words: string[];
  interval?: number;
}

export default function WordRotation({ words, interval = 3000 }: WordRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className="relative min-h-[140px] flex items-center justify-center overflow-hidden">
      {words.map((word, index) => (
        <div
          key={index}
          className={`absolute w-full transition-all duration-700 ease-in-out ${
            index === currentIndex
              ? 'translate-y-0 opacity-100'
              : index === (currentIndex - 1 + words.length) % words.length
              ? '-translate-y-full opacity-0'
              : 'translate-y-full opacity-0'
          }`}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight text-center px-4">
            {word}
          </h1>
        </div>
      ))}
    </div>
  );
}
