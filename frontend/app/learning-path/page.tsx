// frontend/app/learning-path/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/learning-path/Sidebar';
import { ProgressBar } from '@/components/learning-path/ProgressBar';
import { StatsPanel } from '@/components/learning-path/StatsPanel';
import { LessonCircle } from '@/components/learning-path/LessonCircle';
import { api, UserLanguagePair } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  stars: number;
  totalStars: number;
  type: 'vocabulary' | 'grammar' | 'practice' | 'story' | 'review';
  progress: number; // 0-100 for circular progress
}

interface Unit {
  id: string;
  number: number;
  title: string;
  lessons: Lesson[];
}

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  de: 'German',
  uz: 'Uzbek',
};

export default function LearningPathPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [fromLanguage, setFromLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [activeTab, setActiveTab] = useState<'learn' | 'leaderboards' | 'profile'>('learn');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLangPair, setUserLangPair] = useState<UserLanguagePair | null>(null);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const from = localStorage.getItem('fromLanguage');
    const target = localStorage.getItem('targetLanguage');

    if (!from || !target) {
      router.push('/target-lang');
      return;
    }

    setFromLanguage(from);
    setTargetLanguage(target);

    // Fetch learning path data
    fetchLearningPath();
  }, [router]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's language pairs
      const userLangPairs = await api.getUserLanguagePairs();

      if (userLangPairs.length === 0) {
        setError('No language pair found. Please select a language pair.');
        setLoading(false);
        return;
      }

      // Use the first language pair (or you can filter by from/target language)
      const currentUserLangPair = userLangPairs[0];
      setUserLangPair(currentUserLangPair);

      // Get the learning path
      const learningPathData = await api.getLearningPath(currentUserLangPair.id);

      // Transform API data to match component interface
      const transformedUnits: Unit[] = learningPathData.map((unit) => ({
        id: `unit-${unit.unit_number}`,
        number: unit.unit_number,
        title: unit.title,
        lessons: unit.lessons.map((lesson) => ({
          id: lesson.id.toString(),
          title: lesson.title,
          status: lesson.status,
          stars: lesson.stars_earned,
          totalStars: lesson.total_stars,
          type: lesson.type as 'vocabulary' | 'grammar' | 'practice' | 'story' | 'review',
          progress: lesson.status === 'completed' ? 100 : 0,
        })),
      }));

      setUnits(transformedUnits);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learning path');
      setLoading(false);
    }
  };

  // Intersection Observer to track which unit is currently visible
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const index = unitRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setCurrentUnitIndex(index);
            }
          }
        });
      },
      {
        root: scrollContainer,
        threshold: [0.3, 0.5, 0.7],
        rootMargin: '0px',
      }
    );

    setTimeout(() => {
      unitRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => {
      observer.disconnect();
    };
  }, [units]);

  const handleLessonClick = (lesson: Lesson) => {
    const unitIndex = units.findIndex(u => u.lessons.some(l => l.id === lesson.id));
    const lessonIndex = units[unitIndex]?.lessons.findIndex(l => l.id === lesson.id);

    if (lesson.status === 'locked' || unitIndex === -1 || lessonIndex === -1) return;

    localStorage.setItem('currentLesson', lesson.id);
    router.push(`/lesson/unit/${units[unitIndex].number}/level/${lessonIndex + 1}`);
  };

  if (!fromLanguage || !targetLanguage) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchLearningPath}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onHomeClick={() => router.push('/')}
      />

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white">
        <ProgressBar
          unitNumber={units[currentUnitIndex]?.number || 1}
          essentialNumber={Math.ceil((units[currentUnitIndex]?.number || 1) / 10)}
          progress={userLangPair?.level_progress_percent || 0}
        />

        <div className="py-12 px-8">
          <div className="max-w-2xl mx-auto">
            {units.map((unit, unitIndex) => (
              <div
                key={unit.id}
                className="mb-16"
                ref={(el) => {
                  unitRefs.current[unitIndex] = el;
                }}
              >
                <div className="mb-12 flex justify-center">
                  <div className="inline-block bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg">
                    Unit {unit.number}
                  </div>
                </div>

                <div className="relative flex flex-col items-center">
                  {unit.lessons.map((lesson, lessonIndex) => (
                    <LessonCircle
                      key={lesson.id}
                      lesson={lesson}
                      lessonIndex={lessonIndex}
                      totalLessons={unit.lessons.length}
                      onLessonClick={handleLessonClick}
                    />
                  ))}
                </div>

                {unitIndex < units.length - 1 && (
                  <div className="my-16 border-t-4 border-dashed border-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <StatsPanel
        targetLanguage={targetLanguage}
        languageName={LANGUAGE_NAMES[targetLanguage]}
        streak={userLangPair?.curr_streak || 0}
        hearts={5}
        totalXP={userLangPair?.total_xp || 0}
      />
    </div>
  );
}
