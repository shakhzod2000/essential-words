import { Star, Lock, Book, Trophy, Dumbbell, BookOpen } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'practice' | 'story' | 'review';
  status: 'locked' | 'current' | 'completed';
  progress: number;
  stars: number;
  totalStars: number;
}

interface LessonCircleProps {
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  onLessonClick: (lesson: Lesson) => void;
}

export function LessonCircle({ lesson, lessonIndex, totalLessons, onLessonClick }: LessonCircleProps) {
  const getLessonTypeName = (type: string): string => {
    const typeNames: { [key: string]: string } = {
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      practice: 'Practice',
      story: 'Story',
      review: 'Unit Review'
    };
    return typeNames[type] || type;
  };

  const getLessonColor = (lesson: Lesson) => {
    if (lesson.status === 'locked') return { bg: 'bg-gray-300', shadow: '#9ca3af', text: 'text-gray-600' };
    if (lesson.status === 'completed') return { bg: 'bg-yellow-400', shadow: '#ca8a04', text: 'text-white' };
    if (lesson.type === 'review') return { bg: 'bg-purple-500', shadow: '#7e22ce', text: 'text-white' };
    if (lesson.type === 'story') return { bg: 'bg-pink-500', shadow: '#be185d', text: 'text-white' };
    if (lesson.type === 'grammar') return { bg: 'bg-blue-500', shadow: '#1d4ed8', text: 'text-white' };
    if (lesson.type === 'practice') return { bg: 'bg-orange-500', shadow: '#c2410c', text: 'text-white' };
    return { bg: 'bg-green-500', shadow: '#15803d', text: 'text-white' };
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.status === 'locked') return <Lock className="w-8 h-8" />;
    if (lesson.type === 'review') return <Trophy className="w-8 h-8" />;
    if (lesson.type === 'story') return <BookOpen className="w-8 h-8" />;
    if (lesson.type === 'vocabulary') return <Star className="w-8 h-8" />;
    if (lesson.type === 'grammar') return <Book className="w-8 h-8" />;
    if (lesson.type === 'practice') return <Dumbbell className="w-8 h-8" />;
    return <Star className="w-8 h-8" />;
  };

  const renderStars = (earned: number, total: number) => {
    return (
      <div className="flex gap-0.5 justify-center mt-2">
        {[...Array(total)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < earned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  let offsetClass = 'translate-x-0';
  if (lessonIndex === 0 || lessonIndex === totalLessons - 1) {
    offsetClass = 'translate-x-0';
  } else {
    offsetClass = lessonIndex % 2 === 1 ? '-translate-x-16' : 'translate-x-16';
  }

  const colors = getLessonColor(lesson);
  const isLocked = lesson.status === 'locked';

  return (
    <div className="relative mb-2">
      {lessonIndex < totalLessons - 1 && (
        <div className="absolute top-20 left-1/2 h-4 w-0.5 bg-transparent z-0 -translate-x-1/2" />
      )}

      <div className={`relative z-10 transition-transform ${offsetClass}`}>
        <button
          onClick={() => !isLocked && onLessonClick(lesson)}
          disabled={isLocked}
          className="flex flex-col items-center group"
        >
          <div className="relative">
            <svg className="w-24 h-28 -rotate-90">
              <defs>
                <filter id={`shadow-${lesson.id}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feOffset result="offOut" in="SourceGraphic" dx="0" dy="6" />
                  <feColorMatrix result="matrixOut" in="offOut" type="matrix"
                    values="0 0 0 0 0.13
                            0 0 0 0 0.50
                            0 0 0 0 0.24
                            0 0 0 0.3 0" />
                  <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="0" />
                  <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                </filter>
              </defs>
              <ellipse cx="48" cy="56" rx="44" ry="50" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              {lesson.progress > 0 && (
                <ellipse
                  cx="48"
                  cy="56"
                  rx="44"
                  ry="50"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="6"
                  strokeDasharray={`${(lesson.progress / 100) * 295} 295`}
                  strokeLinecap="round"
                  filter={`url(#shadow-${lesson.id})`}
                />
              )}
            </svg>

            <div
              className={`absolute top-5 left-2 right-2 bottom-5 flex items-center justify-center transition-all ${colors.bg} ${colors.text} ${
                isLocked
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer group-hover:scale-95 active:scale-90 active:translate-y-1'
              }`}
              style={{
                borderRadius: '50%',
                boxShadow: isLocked ? 'none' : `0 6px 0 ${colors.shadow}`,
              }}
            >
              {getLessonIcon(lesson)}
            </div>
          </div>

          <p className="mt-2 font-bold text-sm text-gray-700 text-center max-w-[100px]">
            {getLessonTypeName(lesson.type)}
          </p>

          {lesson.status !== 'locked' && renderStars(lesson.stars, lesson.totalStars)}
        </button>
      </div>
    </div>
  );
}
