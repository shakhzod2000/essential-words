'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Star as StarIcon } from 'lucide-react';

export default function LessonResultPage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [bounceCount, setBounceCount] = useState(0);

  useEffect(() => {
    // Get results from localStorage
    const resultData = localStorage.getItem('lessonResult');

    if (!resultData) {
      router.push('/learning-path');
      return;
    }

    const result = JSON.parse(resultData);
    setScore(result.score);
    setTotalQuestions(result.totalQuestions);
    setAccuracy(result.accuracy);
    setXpEarned(result.xpEarned);
    setStarsEarned(result.starsEarned);

    // Animate accuracy from 0 to actual value
    let current = 0;
    const target = result.accuracy;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedAccuracy(target);
        clearInterval(timer);
      } else {
        setAnimatedAccuracy(Math.round(current));
      }
    }, stepDuration);

    // Trophy bounce animation (3 times only)
    const bounceInterval = setInterval(() => {
      setBounceCount(prev => {
        if (prev >= 3) {
          clearInterval(bounceInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(bounceInterval);
    };
  }, [router]);

  const handleContinue = () => {
    localStorage.removeItem('lessonResult');
    router.push('/learning-path');
  };

  // Calculate circle progress
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDashoffset = circumference - (animatedAccuracy / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl ${
              bounceCount < 3 ? 'animate-bounce' : ''
            }`}
          >
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">
          Lesson Complete!
        </h1>
        <p className="text-center text-gray-600 text-base mb-5">
          Great job! Keep up the excellent work!
        </p>

        {/* Results Card */}
        <div className="bg-white rounded-3xl shadow-xl p-5 mb-4">
          {/* Circular Accuracy Progress */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />
                {/* Animated progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-100 ease-out"
                />
              </svg>
              {/* Accuracy percentage in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{animatedAccuracy}%</p>
                  <p className="text-xs text-gray-500 uppercase">Accuracy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-6 h-6 ${
                  i < starsEarned ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="space-y-2.5">
            {/* Correct Answers */}
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl">
              <div>
                <p className="text-xs text-green-600 font-medium uppercase">Correct Answers</p>
                <p className="text-xl font-bold text-green-700">
                  {score}/{totalQuestions}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>

            {/* XP Earned */}
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-xl">
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">XP Earned</p>
                <p className="text-xl font-bold text-purple-700">+{xpEarned}</p>
              </div>
              <div className="text-3xl">💎</div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
