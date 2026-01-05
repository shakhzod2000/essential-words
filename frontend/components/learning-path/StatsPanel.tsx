'use client';

interface StatsPanelProps {
  targetLanguage: string;
  languageName: string;
  streak: number;
  hearts: number;
  totalXP: number;
}

export function StatsPanel({ targetLanguage, languageName, streak, hearts, totalXP }: StatsPanelProps) {
  return (
    <div className="border-l border-gray-200 flex-shrink-0 w-24 lg:w-80 p-4 lg:p-6 transition-all duration-300">
      {/* Language */}
      <div className="mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-3 lg:p-4">
          <p className="text-xs text-gray-500 mb-2 hidden lg:block">Learning</p>
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img
                src={`/images/fahne-${targetLanguage === 'en' ? 'usa' : targetLanguage === 'de' ? 'deutschland' : 'usbekistan'}.jpg`}
                alt={languageName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden lg:inline">
              {languageName}
            </span>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 lg:p-6 border-2 border-orange-200">
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:justify-between">
            <div className="text-center lg:text-left hidden lg:block">
              <p className="text-sm text-orange-600 font-medium uppercase">Streak</p>
              <p className="text-3xl font-bold text-orange-600">{streak}</p>
              <p className="text-xs text-orange-500">days</p>
            </div>
            <div className="text-4xl lg:text-6xl">🔥</div>
            <p className="text-2xl font-bold text-orange-600 lg:hidden">{streak}</p>
          </div>
        </div>
      </div>

      {/* Hearts */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4 lg:p-6 border-2 border-red-200">
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:justify-between">
            <div className="text-center lg:text-left hidden lg:block">
              <p className="text-sm text-red-600 font-medium uppercase">Hearts</p>
              <p className="text-3xl font-bold text-red-600">{hearts}</p>
              <p className="text-xs text-red-500">remaining</p>
            </div>
            <div className="text-4xl lg:text-6xl">❤️</div>
            <p className="text-2xl font-bold text-red-600 lg:hidden">{hearts}</p>
          </div>
        </div>
      </div>

      {/* XP */}
      <div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 lg:p-6 border-2 border-blue-200">
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:justify-between">
            <div className="text-center lg:text-left hidden lg:block">
              <p className="text-sm text-blue-600 font-medium uppercase">Total XP</p>
              <p className="text-3xl font-bold text-blue-600">{totalXP}</p>
              <p className="text-xs text-blue-500">experience points</p>
            </div>
            <div className="text-4xl lg:text-6xl">💎</div>
            <p className="text-2xl font-bold text-blue-600 lg:hidden">{totalXP}</p>
          </div>
        </div>
      </div>
    </div>
  );
}