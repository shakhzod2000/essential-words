'use client';

import { useState } from 'react';
import { Lock, CheckCircle, Circle, Star, Trophy, Zap } from 'lucide-react';

interface LearningPathProps {
  fromLanguage: string;
  toLanguage: string;
  onStartLesson: (unitId: string, lessonId: string) => void;
}

interface Lesson {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  stars: number;
  totalStars: number;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Mock data - will be replaced with API data
const MOCK_UNITS: Unit[] = [
  {
    id: 'unit-1',
    title: 'Unit 1: Basics',
    description: 'Learn essential words and phrases',
    lessons: [
      { id: 'lesson-1', title: 'Greetings', status: 'current', stars: 0, totalStars: 3 },
      { id: 'lesson-2', title: 'Common Phrases', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-3', title: 'Numbers', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-4', title: 'Unit Review', status: 'locked', stars: 0, totalStars: 5 },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Daily Life',
    description: 'Words for everyday situations',
    lessons: [
      { id: 'lesson-5', title: 'Food & Drink', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-6', title: 'Family', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-7', title: 'Time & Dates', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-8', title: 'Unit Review', status: 'locked', stars: 0, totalStars: 5 },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3: Intermediate',
    description: 'Build your vocabulary',
    lessons: [
      { id: 'lesson-9', title: 'Travel', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-10', title: 'Work & Study', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-11', title: 'Hobbies', status: 'locked', stars: 0, totalStars: 3 },
      { id: 'lesson-12', title: 'Unit Review', status: 'locked', stars: 0, totalStars: 5 },
    ],
  },
];

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  de: 'German',
  uz: 'Uzbek',
};

export default function LearningPath({ fromLanguage, toLanguage, onStartLesson }: LearningPathProps) {
  const [units] = useState<Unit[]>(MOCK_UNITS);

  const getLessonIcon = (status: Lesson['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  const renderStars = (earned: number, total: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(total)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < earned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Learning {LANGUAGE_NAMES[toLanguage]}
              </h1>
              <p className="text-gray-600">
                From {LANGUAGE_NAMES[fromLanguage]}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-3xl font-bold text-orange-600 mb-1">
                  <Zap className="w-8 h-8" />
                  <span>0</span>
                </div>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-3xl font-bold text-blue-600 mb-1">
                  <Trophy className="w-8 h-8" />
                  <span>0</span>
                </div>
                <p className="text-sm text-gray-600">Total XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="space-y-8">
          {units.map((unit, unitIndex) => (
            <div key={unit.id} className="relative">
              {/* Connection line between units */}
              {unitIndex > 0 && (
                <div className="absolute left-1/2 -top-8 w-1 h-8 bg-gradient-to-b from-blue-200 to-transparent transform -translate-x-1/2"></div>
              )}

              {/* Unit Card */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{unit.title}</h2>
                  <p className="text-gray-600">{unit.description}</p>
                </div>

                {/* Lessons */}
                <div className="space-y-4">
                  {unit.lessons.map((lesson, lessonIndex) => {
                    const isReview = lesson.title.includes('Review');
                    const isLocked = lesson.status === 'locked';
                    const isCurrent = lesson.status === 'current';

                    return (
                      <div key={lesson.id} className="relative">
                        {/* Connection line between lessons */}
                        {lessonIndex > 0 && (
                          <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-gray-200 transform -translate-x-1/2"></div>
                        )}

                        <button
                          onClick={() => !isLocked && onStartLesson(unit.id, lesson.id)}
                          disabled={isLocked}
                          className={`
                            w-full p-6 rounded-2xl border-2 transition-all duration-300
                            ${isCurrent ? 'border-blue-600 bg-blue-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1' : ''}
                            ${lesson.status === 'completed' ? 'border-green-600 bg-green-50 hover:shadow-md' : ''}
                            ${isLocked ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : ''}
                            ${!isLocked && !isCurrent && lesson.status !== 'completed' ? 'hover:border-gray-400' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center
                                ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-blue-700' : ''}
                                ${lesson.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-700' : ''}
                                ${isLocked ? 'bg-gray-300' : ''}
                                ${isReview ? 'bg-gradient-to-br from-purple-500 to-purple-700' : ''}
                              `}>
                                {isReview ? (
                                  <Trophy className="w-8 h-8 text-white" />
                                ) : (
                                  <Circle className={`w-8 h-8 ${isLocked ? 'text-gray-500' : 'text-white'}`} />
                                )}
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{lesson.title}</h3>
                                {renderStars(lesson.stars, lesson.totalStars)}
                              </div>
                            </div>
                            <div>
                              {getLessonIcon(lesson.status)}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Footer */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-2">Keep Going!</h3>
          <p className="text-blue-100">
            Practice daily to maintain your streak and unlock new content
          </p>
        </div>
      </div>
    </div>
  );
}
