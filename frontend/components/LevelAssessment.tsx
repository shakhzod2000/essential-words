'use client';

import { useState, useEffect } from 'react';
import { Check, X, Volume2 } from 'lucide-react';

interface LevelAssessmentProps {
  fromLanguage: string;
  toLanguage: string;
  onComplete: (level: string, score: number) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  word: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
}

// Mock questions - will be replaced with API data
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    word: 'Hello',
    options: ['Hallo', 'Tschüss', 'Danke', 'Bitte'],
    correctAnswer: 'Hallo',
    difficulty: 1,
  },
  {
    id: 'q2',
    word: 'Thank you',
    options: ['Bitte', 'Danke', 'Guten Tag', 'Auf Wiedersehen'],
    correctAnswer: 'Danke',
    difficulty: 1,
  },
  {
    id: 'q3',
    word: 'Good morning',
    options: ['Guten Abend', 'Guten Tag', 'Guten Morgen', 'Gute Nacht'],
    correctAnswer: 'Guten Morgen',
    difficulty: 2,
  },
  {
    id: 'q4',
    word: 'Water',
    options: ['Wasser', 'Brot', 'Milch', 'Kaffee'],
    correctAnswer: 'Wasser',
    difficulty: 2,
  },
  {
    id: 'q5',
    word: 'Beautiful',
    options: ['Hässlich', 'Schön', 'Groß', 'Klein'],
    correctAnswer: 'Schön',
    difficulty: 3,
  },
  {
    id: 'q6',
    word: 'Understand',
    options: ['Verstehen', 'Sprechen', 'Hören', 'Sehen'],
    correctAnswer: 'Verstehen',
    difficulty: 3,
  },
  {
    id: 'q7',
    word: 'Necessary',
    options: ['Notwendig', 'Möglich', 'Wichtig', 'Einfach'],
    correctAnswer: 'Notwendig',
    difficulty: 4,
  },
  {
    id: 'q8',
    word: 'Achievement',
    options: ['Leistung', 'Erfolg', 'Versuch', 'Ergebnis'],
    correctAnswer: 'Leistung',
    difficulty: 4,
  },
];

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  de: 'German',
  uz: 'Uzbek',
};

export default function LevelAssessment({ fromLanguage, toLanguage, onComplete, onBack }: LevelAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100;
  const totalQuestions = MOCK_QUESTIONS.length;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (correct) {
      setScore(score + 1);
    }

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Test complete
        const finalScore = correct ? score + 1 : score;
        const percentage = (finalScore / MOCK_QUESTIONS.length) * 100;
        let level = 'beginner';

        if (percentage >= 75) level = 'advanced';
        else if (percentage >= 50) level = 'intermediate';
        else level = 'beginner';

        setTimeout(() => onComplete(level, finalScore), 1500);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              × Exit
            </button>
            <span className="text-sm font-semibold text-gray-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {/* Question Header */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 mb-2">
                Translate to {LANGUAGE_NAMES[toLanguage]}
              </p>
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {currentQuestion.word}
                </h2>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Volume2 className="w-6 h-6 text-blue-600" />
                </button>
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrectOption;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`
                      w-full p-5 rounded-2xl border-2 text-left font-semibold text-lg
                      transition-all duration-300 relative
                      ${!showResult ? 'border-gray-300 hover:border-blue-600 hover:bg-blue-50' : ''}
                      ${showCorrect ? 'border-green-600 bg-green-50' : ''}
                      ${showIncorrect ? 'border-red-600 bg-red-50' : ''}
                      ${showResult ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`
                        ${showCorrect ? 'text-green-700' : ''}
                        ${showIncorrect ? 'text-red-700' : ''}
                        ${!showResult ? 'text-gray-900' : ''}
                      `}>
                        {option}
                      </span>
                      {showCorrect && (
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {showIncorrect && (
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <X className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result Message */}
            {showResult && (
              <div className={`
                mt-6 p-4 rounded-xl text-center font-semibold
                ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
              `}>
                {isCorrect ? '✓ Correct!' : `✗ The correct answer is "${currentQuestion.correctAnswer}"`}
              </div>
            )}
          </div>

          {/* Score Indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-md">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="text-xl font-bold text-blue-600">{score}</span>
              <span className="text-sm text-gray-400">/ {totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
