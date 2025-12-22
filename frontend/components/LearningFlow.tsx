'use client';

import { useState } from 'react';
import LanguageSelection from './LanguageSelection';
import LearningModeSelection from './LearningModeSelection';
import LearningPath from './LearningPath';
import LevelAssessment from './LevelAssessment';
import { useRouter } from 'next/navigation';

type FlowStep = 'language-selection' | 'mode-selection' | 'learning-path' | 'level-assessment';

interface LearningFlowProps {
  onClose: () => void;
}

export default function LearningFlow({ onClose }: LearningFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FlowStep>('language-selection');
  const [fromLanguage, setFromLanguage] = useState('');
  const [toLanguage, setToLanguage] = useState('');

  const handleLanguagesSelected = (from: string, to: string) => {
    setFromLanguage(from);
    setToLanguage(to);
    setCurrentStep('mode-selection');
  };

  const handleModeSelected = (mode: 'scratch' | 'test') => {
    if (mode === 'scratch') {
      setCurrentStep('learning-path');
    } else {
      setCurrentStep('level-assessment');
    }
  };

  const handleAssessmentComplete = (level: string, score: number) => {
    // Save the assessment results
    localStorage.setItem('userLevel', level);
    localStorage.setItem('assessmentScore', score.toString());

    // Navigate to learning path
    setCurrentStep('learning-path');
  };

  const handleStartLesson = (unitId: string, lessonId: string) => {
    // Save the current lesson info
    localStorage.setItem('currentUnit', unitId);
    localStorage.setItem('currentLesson', lessonId);
    localStorage.setItem('fromLanguage', fromLanguage);
    localStorage.setItem('toLanguage', toLanguage);

    // Navigate to the quiz/lesson page
    router.push('/quiz');
  };

  const handleBackToLanguageSelection = () => {
    setCurrentStep('language-selection');
    setFromLanguage('');
    setToLanguage('');
  };

  const handleBackToModeSelection = () => {
    setCurrentStep('mode-selection');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {currentStep === 'language-selection' && (
        <LanguageSelection onLanguagesSelected={handleLanguagesSelected} />
      )}

      {currentStep === 'mode-selection' && (
        <LearningModeSelection
          fromLanguage={fromLanguage}
          toLanguage={toLanguage}
          onModeSelected={handleModeSelected}
          onBack={handleBackToLanguageSelection}
        />
      )}

      {currentStep === 'learning-path' && (
        <LearningPath
          fromLanguage={fromLanguage}
          toLanguage={toLanguage}
          onStartLesson={handleStartLesson}
        />
      )}

      {currentStep === 'level-assessment' && (
        <LevelAssessment
          fromLanguage={fromLanguage}
          toLanguage={toLanguage}
          onComplete={handleAssessmentComplete}
          onBack={handleBackToModeSelection}
        />
      )}
    </div>
  );
}
