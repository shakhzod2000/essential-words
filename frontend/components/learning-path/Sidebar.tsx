'use client';

import { Home, Target, Award, User } from 'lucide-react';

interface SidebarProps {
  activeTab: 'learn' | 'leaderboards' | 'profile';
  onTabChange: (tab: 'learn' | 'leaderboards' | 'profile') => void;
  onHomeClick: () => void;
}

export function Sidebar({ activeTab, onTabChange, onHomeClick }: SidebarProps) {
  return (
    <div className="flex w-20 lg:w-64 border-r border-gray-200 flex-col transition-all duration-300">
      <div className="p-4 lg:p-6">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity justify-center lg:justify-start w-full"
        >
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="font-bold text-xl text-gray-900 hidden lg:inline whitespace-nowrap">Essential Words</span>
        </button>

        <nav className="space-y-2">
          <button
            onClick={onHomeClick}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-bold transition-colors text-gray-600 hover:bg-gray-100 justify-center lg:justify-start"
            title="HOME"
          >
            <Home className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline">HOME</span>
          </button>
          <button
            onClick={() => onTabChange('learn')}
            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-bold transition-colors justify-center lg:justify-start ${
              activeTab === 'learn' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="LEARN"
          >
            <Target className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline">LEARN</span>
          </button>
          <button
            onClick={() => onTabChange('leaderboards')}
            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-bold transition-colors justify-center lg:justify-start ${
              activeTab === 'leaderboards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="LEADERBOARDS"
          >
            <Award className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline">LEADERBOARDS</span>
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-bold transition-colors justify-center lg:justify-start ${
              activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="PROFILE"
          >
            <User className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline">PROFILE</span>
          </button>
        </nav>
      </div>
    </div>
  );
}