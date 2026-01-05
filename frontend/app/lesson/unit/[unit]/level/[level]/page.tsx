// frontend/app/lesson/unit/[unit]/level/[level]
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Volume2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { HoverWord } from '@/components/lesson/HoverWord';

interface WordTranslation {
  translation: string;
  partOfSpeech?: string;
}

interface Question {
  id: string;
  type: 'translate' | 'fill_blank' | 'listen_type' | 'speak' | 'match_pairs' | 'select_word';
  taskInstruction: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  audio?: string;
  image?: string;
  explanation?: string;
  vocabularyWord?: string | null;
  wordTranslations?: { [word: string]: WordTranslation };
}

interface AnsweredQuestion {
  questionId: string;
  wasCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export default function LessonPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLessonQuestions();
  }, []);

  // Load session state after questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      loadSessionState();
    }
  }, [questions]);

  // Save session state whenever it changes
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      saveSessionState();
    }
  }, [currentQuestionIndex, score, hearts, answeredQuestions, showResult, isCorrect, correctAnswer, explanation, questions, loading]);

  const saveSessionState = () => {
    const lessonId = localStorage.getItem('currentLesson');
    if (!lessonId) return;

    const sessionKey = `lesson_${lessonId}_session`;
    const sessionData = {
      currentQuestionIndex,
      score,
      hearts,
      answeredQuestions,
      showResult,
      isCorrect,
      correctAnswer,
      explanation,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
  };

  const loadSessionState = () => {
    const lessonId = localStorage.getItem('currentLesson');
    if (!lessonId) return;

    const sessionKey = `lesson_${lessonId}_session`;
    const savedData = sessionStorage.getItem(sessionKey);

    if (savedData) {
      try {
        const {
          currentQuestionIndex: savedIndex,
          score: savedScore,
          hearts: savedHearts,
          answeredQuestions: savedAnswered,
          showResult: savedShowResult,
          isCorrect: savedIsCorrect,
          correctAnswer: savedCorrectAnswer,
          explanation: savedExplanation,
          timestamp
        } = JSON.parse(savedData);

        // Only restore if session is less than 1 hour old
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - timestamp < ONE_HOUR) {
          setCurrentQuestionIndex(savedIndex);
          setScore(savedScore);
          setHearts(savedHearts);
          setAnsweredQuestions(savedAnswered || []);
          setShowResult(savedShowResult || false);
          setIsCorrect(savedIsCorrect || false);
          setCorrectAnswer(savedCorrectAnswer || '');
          setExplanation(savedExplanation || '');
        } else {
          // Clear old session
          sessionStorage.removeItem(sessionKey);
        }
      } catch (err) {
        console.error('Error loading session:', err);
      }
    }
  };

  const fetchLessonQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get lesson ID from localStorage (set by learning path page)
      const lessonId = localStorage.getItem('currentLesson');

      if (!lessonId) {
        setError('No lesson selected');
        setLoading(false);
        return;
      }

      // Fetch questions for this lesson
      const apiQuestions = await api.getLessonQuestions(parseInt(lessonId));

      if (apiQuestions.length === 0) {
        setError('No questions found for this lesson');
        setLoading(false);
        return;
      }

      // Transform API questions to component format
      const transformedQuestions: Question[] = apiQuestions.map((q) => ({
        id: q.id.toString(),
        type: q.question_type as Question['type'],
        taskInstruction: q.task_instruction || '',
        prompt: q.prompt,
        correctAnswer: q.correct_answer || '', // Get from API
        options: q.options?.map((opt) => opt.text),
        audio: q.audio || undefined,
        image: q.image || undefined,
        explanation: q.explanation || '',
        vocabularyWord: q.vocabulary_word || null,
      }));

      setQuestions(transformedQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = showResult
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : (currentQuestionIndex / questions.length) * 100;
  const totalQuestions = questions.length;

  // Check if current question was already answered
  const isAlreadyAnswered = currentQuestion && answeredQuestions.some(a => a.questionId === currentQuestion.id);

  // Client-side answer validation
  const checkAnswer = (userAns: string, correctAns: string): boolean => {
    // Normalize both answers: trim and lowercase for comparison
    const normalizedUser = userAns.trim().toLowerCase();
    const normalizedCorrect = correctAns.trim().toLowerCase();
    return normalizedUser === normalizedCorrect;
  };

  const handleCheck = () => {
    if (!currentQuestion || isAlreadyAnswered) return;

    // Get the user's answer based on question type
    let answer = '';
    const hasOptions = currentQuestion.options && currentQuestion.options.length > 0;

    switch (currentQuestion.type) {
      case 'select_word':
        answer = hasOptions ? (selectedOption || '') : userAnswer.trim();
        break;
      case 'fill_blank':
        answer = hasOptions ? (selectedOption || '') : userAnswer.trim();
        break;
      case 'translate':
        answer = hasOptions ? (selectedOption || '') : userAnswer.trim();
        break;
      case 'listen_type':
        answer = userAnswer.trim();
        break;
      case 'match_pairs':
        answer = Object.entries(matchedPairs).map(([k, v]) => `${k}-${v}`).join(',');
        break;
    }

    // Check answer client-side
    const isAnswerCorrect = checkAnswer(answer, currentQuestion.correctAnswer);

    setIsCorrect(isAnswerCorrect);
    setCorrectAnswer(currentQuestion.correctAnswer);
    setExplanation(currentQuestion.explanation || '');
    setShowResult(true);

    // Track answered question with feedback
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      wasCorrect: isAnswerCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation || ''
    }]);

    if (isAnswerCorrect) {
      setScore(score + 1);
    } else {
      // Only decrement hearts on wrong answer, not skip
      const newHearts = hearts - 1;
      setHearts(newHearts);

      // Show modal if hearts reach 0
      if (newHearts <= 0) {
        setShowHeartsModal(true);
      }
    }

    // Submit to backend asynchronously to record the answer (don't wait for response)
    api.submitAnswer(parseInt(currentQuestion.id), answer).catch(err => {
      console.error('Error recording answer:', err);
    });
  };

  const handleSkip = () => {
    if (!currentQuestion || isAlreadyAnswered) return;

    // Use the correct answer from the question
    setIsCorrect(false);
    setCorrectAnswer(currentQuestion.correctAnswer);
    setExplanation(currentQuestion.explanation || '');
    setShowResult(true);

    // Track answered question (skipped counts as wrong but doesn't decrement hearts)
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      wasCorrect: false,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation || ''
    }]);

    // Submit to backend asynchronously to record the skip
    api.submitAnswer(parseInt(currentQuestion.id), '').catch(err => {
      console.error('Error recording skip:', err);
    });
  };

  const handleContinue = async () => {
    // Don't allow continue if hearts are 0 (should show modal instead)
    if (hearts <= 0 && !showHeartsModal) {
      setShowHeartsModal(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setMatchedPairs({});
      setShowResult(false);
      setCorrectAnswer('');
      setExplanation('');
    } else {
      // Lesson complete - save results
      const accuracy = Math.round((score / totalQuestions) * 100);
      const starsEarned = accuracy >= 90 ? 5 : accuracy >= 70 ? 4 : accuracy >= 50 ? 3 : accuracy >= 30 ? 2 : 1;
      const xpEarned = score * 10;

      const lessonId = localStorage.getItem('currentLesson');

      // Submit lesson completion to backend
      try {
        if (lessonId) {
          await api.completeLessonProgress(parseInt(lessonId), {
            stars_earned: starsEarned,
            questions_completed: totalQuestions,
            questions_correct: score,
            xp_earned: xpEarned
          });
        }
      } catch (err) {
        console.error('Error saving lesson progress:', err);
      }

      const resultData = {
        score,
        totalQuestions,
        accuracy,
        xpEarned,
        starsEarned,
      };

      localStorage.setItem('lessonResult', JSON.stringify(resultData));

      // Clear session state when lesson is completed
      if (lessonId) {
        sessionStorage.removeItem(`lesson_${lessonId}_session`);
      }

      router.push('/lesson-result');
    }
  };

  const handleStartOver = () => {
    const lessonId = localStorage.getItem('currentLesson');
    if (lessonId) {
      sessionStorage.removeItem(`lesson_${lessonId}_session`);
    }
    // Reset all state
    setCurrentQuestionIndex(0);
    setScore(0);
    setHearts(5);
    setAnsweredQuestions([]);
    setShowResult(false);
    setShowHeartsModal(false);
    setUserAnswer('');
    setSelectedOption(null);
    setMatchedPairs({});
    setCorrectAnswer('');
    setExplanation('');
  };

  const handleGoBack = () => {
    const lessonId = localStorage.getItem('currentLesson');
    if (lessonId) {
      sessionStorage.removeItem(`lesson_${lessonId}_session`);
    }
    router.push('/learning-path');
  };

  const handleExit = () => {
    router.push('/learning-path');
  };

  // Helper to highlight vocabulary word in prompt with hover translations
  const highlightVocabulary = (text: string, vocabWord: string | null | undefined) => {
    if (!vocabWord) {
      // No vocab word to highlight, just wrap with translations
      return wrapWordsWithTranslations(text);
    }

    const regex = new RegExp(`\\b${vocabWord}\\b`, 'gi');
    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {wrapWordsWithTranslations(part)}
            {matches[i] && (
              <span className="font-bold" style={{ color: '#CE82FF' }}>
                {matches[i]}
              </span>
            )}
          </span>
        ))}
      </>
    );
  };

  // Helper function to wrap words with hover translations
  const wrapWordsWithTranslations = (text: string) => {
    const wordTranslations = currentQuestion?.wordTranslations;

    if (!text || !wordTranslations) {
      return <span>{text}</span>;
    }

    // Split text into words and punctuation, preserving both
    const tokens = text.split(/(\s+|[.,!?;:"()]+)/);

    return (
      <>
        {tokens.map((token, idx) => {
          // Check if token is whitespace or punctuation
          if (/^\s+$/.test(token) || /^[.,!?;:"()]+$/.test(token)) {
            return <span key={idx}>{token}</span>;
          }

          // Clean the word (remove leading/trailing punctuation for lookup)
          const cleanWord = token.replace(/^[.,!?;:"()]+|[.,!?;:"()]+$/g, '').toLowerCase();
          const translation = wordTranslations[cleanWord];

          return (
            <HoverWord
              key={idx}
              word={token}
              translation={translation?.translation}
              partOfSpeech={translation?.partOfSpeech}
            />
          );
        })}
      </>
    );
  };

  // Render prompt with inline blank input for fill_blank questions
  const renderPromptWithBlank = (prompt: string) => {
    // Look for underscores (any amount: _, __, ____, etc.) or {blank} in the prompt
    // Using a simpler regex that catches any sequence of underscores
    const blankPattern = /_+|\{blank\}/gi;

    if (!blankPattern.test(prompt)) {
      // No blank found, add input at the end
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {wrapWordsWithTranslations(prompt)}
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => !showResult && !isAlreadyAnswered && setUserAnswer(e.target.value)}
            disabled={showResult || isAlreadyAnswered}
            className={`inline-block border-b-2 border-gray-400 bg-transparent focus:border-blue-500 focus:outline-none px-1 py-0 text-2xl font-bold min-w-[60px] text-left ${showResult ? (isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700') : ''
              }`}
            style={{ width: `${Math.max(60, (userAnswer.length || correctAnswer.length) * 11)}px` }}
          />
        </div>
      );
    }

    // Reset regex index for split (important when using 'g' flag)
    const splitPattern = /_+|\{blank\}/gi;
    const parts = prompt.split(splitPattern);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {parts.map((part, index) => (
          <span key={index}>
            {wrapWordsWithTranslations(part)}
            {index < parts.length - 1 && (
              <input
                ref={index === 0 ? inputRef : null}
                type="text"
                value={userAnswer}
                onChange={(e) => !showResult && !isAlreadyAnswered && setUserAnswer(e.target.value)}
                disabled={showResult || isAlreadyAnswered}
                className={`inline-block border-b-2 border-gray-400 bg-transparent focus:border-blue-500 focus:outline-none px-1 py-0 text-2xl font-bold min-w-[60px] text-left ${showResult ? (isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700') : ''
                  }`}
                style={{ width: `${Math.max(60, (userAnswer.length || correctAnswer.length) * 11)}px` }}
              />
            )}
          </span>
        ))}
      </div>
    );
  };

  const playAudio = (url: string | undefined) => {
    if (!url) return;
    // Prepend /media if not present and if it's a relative path
    const audioUrl = url.startsWith('http') || url.startsWith('/media') ? url : `/media/${url}`;
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("Audio play failed", e));
  };

  const renderQuestion = () => {
    // Check if question has options to display
    const hasOptions = currentQuestion.options && currentQuestion.options.length > 0;

    // For fill_blank, show sentence with inline input, and options below if available
    if (currentQuestion.type === 'fill_blank') {
      return (
        <div className="space-y-6">
          <p className="text-black text-2xl font-bold">{currentQuestion.taskInstruction}</p>
          <div className="text-2xl font-normal text-gray-900 leading-relaxed">
            {renderPromptWithBlank(currentQuestion.prompt)}
          </div>
          {hasOptions && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    if (!showResult && !isAlreadyAnswered) {
                      setUserAnswer(option);
                      setSelectedOption(option);
                    }
                  }}
                  disabled={showResult || isAlreadyAnswered}
                  className={`
                    p-3 rounded-2xl border-2 border-b-4 font-semibold text-base transition-all
                    ${selectedOption === option || userAnswer === option ? 'border-blue-500 bg-blue-50 active:border-b-2' : 'border-gray-300 hover:bg-gray-50 active:border-b-2'}
                    ${showResult && option === correctAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${showResult && (selectedOption === option || userAnswer === option) && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                    ${showResult || isAlreadyAnswered ? 'cursor-default' : 'cursor-pointer hover:brightness-95'}
                  `}
                  style={{
                    boxShadow: showResult ? 'none' : '0 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // For select_word, show options if available, otherwise show input
    if (currentQuestion.type === 'select_word') {
      return (
        <div className="space-y-6">
          <p className="text-black text-2xl font-bold">{currentQuestion.taskInstruction}</p>
          <h2 className="text-xl font-normal text-gray-900">
            {highlightVocabulary(currentQuestion.prompt, currentQuestion.vocabularyWord)}
          </h2>
          {hasOptions ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => !showResult && !isAlreadyAnswered && setSelectedOption(option)}
                  disabled={showResult || isAlreadyAnswered}
                  className={`
                    p-3 rounded-2xl border-2 border-b-4 font-semibold text-base text-left transition-all
                    ${selectedOption === option ? 'border-blue-500 bg-blue-50 active:border-b-2' : 'border-gray-300 hover:bg-gray-50 active:border-b-2'}
                    ${showResult && option === correctAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${showResult && selectedOption === option && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                    ${showResult || isAlreadyAnswered ? 'cursor-default' : 'cursor-pointer hover:brightness-95'}
                  `}
                  style={{
                    boxShadow: showResult ? 'none' : '0 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => !showResult && !isAlreadyAnswered && setUserAnswer(e.target.value)}
              disabled={showResult || isAlreadyAnswered}
              placeholder="Type your answer..."
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          )}
        </div>
      );
    }

    switch (currentQuestion.type) {
      case 'translate':
        return (
          <div className="space-y-6">
            <p className="text-black text-2xl font-bold">{currentQuestion.taskInstruction}</p>
            <h2 className="text-xl font-normal text-gray-900">
              {highlightVocabulary(currentQuestion.prompt, currentQuestion.vocabularyWord)}
            </h2>
            {hasOptions ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => !showResult && !isAlreadyAnswered && setSelectedOption(option)}
                    disabled={showResult || isAlreadyAnswered}
                    className={`
                      p-3 rounded-2xl border-2 border-b-4 font-semibold text-base text-left transition-all
                      ${selectedOption === option ? 'border-blue-500 bg-blue-50 active:border-b-2' : 'border-gray-300 hover:bg-gray-50 active:border-b-2'}
                      ${showResult && option === correctAnswer ? 'border-green-500 bg-green-50' : ''}
                      ${showResult && selectedOption === option && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                      ${showResult || isAlreadyAnswered ? 'cursor-default' : 'cursor-pointer hover:brightness-95'}
                    `}
                    style={{
                      boxShadow: showResult ? 'none' : '0 4px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => !showResult && !isAlreadyAnswered && setUserAnswer(e.target.value)}
                disabled={showResult || isAlreadyAnswered}
                placeholder="Type your answer..."
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            )}
          </div>
        );

      case 'listen_type':
        return (
          <div className="space-y-6">
            <p className="text-black text-2xl font-bold">{currentQuestion.taskInstruction}</p>
            <h2 className="text-xl font-normal text-gray-900">
              {highlightVocabulary(currentQuestion.prompt, currentQuestion.vocabularyWord)}
            </h2>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => playAudio(currentQuestion.audio)}
                className="w-24 h-24 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-12 h-12 text-white" />
              </button>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => !showResult && !isAlreadyAnswered && setUserAnswer(e.target.value)}
              disabled={showResult || isAlreadyAnswered}
              placeholder="Type what you hear..."
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>
        );

      case 'match_pairs':
        return (
          <div className="space-y-6">
            <p className="text-gray-600 text-xl font-bold">{currentQuestion.taskInstruction}</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {highlightVocabulary(currentQuestion.prompt, currentQuestion.vocabularyWord)}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={option}
                  onClick={() => {
                    if (!showResult && !isAlreadyAnswered) {
                      // Simple mock matching logic
                      const newPairs = { ...matchedPairs };
                      if (index % 2 === 0) {
                        newPairs[option] = currentQuestion.options![index + 1];
                      }
                      setMatchedPairs(newPairs);
                    }
                  }}
                  disabled={showResult || isAlreadyAnswered}
                  className={`
                    p-5 rounded-2xl border-2 border-b-4 font-semibold text-lg transition-all
                    ${Object.keys(matchedPairs).includes(option) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${showResult || isAlreadyAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 active:border-b-2'}
                  `}
                  style={{
                    boxShadow: showResult ? 'none' : '0 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Question type not implemented</div>;
    }
  };

  const canCheck = () => {
    if (!currentQuestion || isAlreadyAnswered) return false;

    const hasOptions = currentQuestion.options && currentQuestion.options.length > 0;

    switch (currentQuestion.type) {
      case 'select_word':
      case 'fill_blank':
      case 'translate':
        return hasOptions ? selectedOption !== null : userAnswer.trim() !== '';
      case 'listen_type':
        return userAnswer.trim() !== '';
      case 'match_pairs':
        return Object.keys(matchedPairs).length > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Lesson</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/learning-path')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Back to Learning Path
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No questions available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header with Progress */}
        <div className="border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleExit}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
              <div className="flex-1 mx-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <span className="font-bold text-red-500">{hearts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full">
            {renderQuestion()}
          </div>
        </div>

        {/* Bottom Feedback & Action Bar - Duolingo Style */}
        <div className={`border-t-2 ${showResult
          ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          : 'border-gray-200 bg-white'
          }`}>
          <div className="max-w-4xl mx-auto px-6 py-8">
            {showResult ? (
              <div className="flex items-center justify-between gap-6">
                {/* Left: Feedback */}
                <div className="flex items-center gap-4 flex-1">
                  {isCorrect ? (
                    <>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-700">Excellent!</p>
                        {explanation && (
                          <p className="text-green-600 mt-1">{explanation}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        ✗
                      </div>
                      <div className="text-red-700">
                        <p className="text-xl font-bold mb-1">Correct answer:</p>
                        <p className="text-lg font-semibold">{correctAnswer}</p>
                        {explanation && (
                          <p className="text-base mt-2 font-normal">{explanation}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Continue Button */}
                <button
                  onClick={handleContinue}
                  className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all flex-shrink-0 border-2 border-b-4 active:border-b-2 ${isCorrect
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-700'
                    : 'bg-red-500 hover:bg-red-600 text-white border-red-700'
                    }`}
                  style={{
                    boxShadow: isCorrect ? '0 4px 0 #15803d' : '0 4px 0 #991b1b'
                  }}
                >
                  CONTINUE
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  disabled={isAlreadyAnswered}
                  className="px-8 py-4 rounded-2xl font-bold text-lg transition-all border-2 border-b-4 border-gray-300 text-gray-700 hover:bg-gray-100 flex-shrink-0 active:border-b-2 disabled:opacity-50"
                  style={{
                    boxShadow: '0 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  SKIP
                </button>

                {/* Check Button */}
                <button
                  onClick={handleCheck}
                  disabled={!canCheck() || isAlreadyAnswered}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 border-b-4 ${canCheck() && !isAlreadyAnswered
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-700 active:border-b-2'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                    }`}
                  style={{
                    boxShadow: canCheck() && !isAlreadyAnswered ? '0 4px 0 #15803d' : '0 4px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  CHECK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Out of Hearts Modal */}
      {showHeartsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Out of Hearts!</h2>
              <p className="text-gray-600 mb-8 text-lg">
                You've used all your hearts. You can start over or go back to the learning path.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleStartOver}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all border-2 border-b-4 border-green-700 active:border-b-2"
                  style={{
                    boxShadow: '0 4px 0 #15803d'
                  }}
                >
                  START OVER
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-bold text-lg transition-all border-2 border-b-4 border-gray-400 active:border-b-2"
                  style={{
                    boxShadow: '0 4px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  GO BACK TO LEARNING PATH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
