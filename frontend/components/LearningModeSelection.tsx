'use client';

import { BookOpen, Target, Sparkles, ChevronRight } from 'lucide-react';

interface LearningModeSelectionProps {
  fromLanguage: string;
  toLanguage: string;
  onModeSelected: (mode: 'scratch' | 'test') => void;
  onBack: () => void;
}

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  de: 'German',
  uz: 'Uzbek',
};

export default function LearningModeSelection({
  fromLanguage,
  toLanguage,
  onModeSelected,
  onBack,
}: LearningModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Learning {LANGUAGE_NAMES[toLanguage]} from {LANGUAGE_NAMES[fromLanguage]}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600">
            How would you like to start your journey?
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {/* Start from Scratch */}
          <button
            onClick={() => onModeSelected('scratch')}
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-600 transform hover:-translate-y-2 text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start from Scratch</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Perfect for beginners! We'll guide you through a structured learning path, starting with the basics and gradually building your vocabulary.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <span>Begin your journey</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Structured path</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Step by step</span>
                </div>
              </div>
            </div>
          </button>

          {/* Take Level Test */}
          <button
            onClick={() => onModeSelected('test')}
            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-600 transform hover:-translate-y-2 text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Identify My Level</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Already know some words? Take a quick assessment test to determine your current level and start learning from where you are.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <span>Take the test</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>5-10 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Personalized start</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
          >
            ← Change languages
          </button>
        </div>
      </div>
    </div>
  );
}
