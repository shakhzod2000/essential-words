'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState('en');

  useEffect(() => {
    // Load questions from localStorage
    const savedQuestions = localStorage.getItem('questions');
    const savedLanguage = localStorage.getItem('activeLanguage');
    const savedUserScore = localStorage.getItem('userScore');
    const savedQuestionIndex = localStorage.getItem('currentQuestionIndex');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
      setActiveLanguage(savedLanguage || 'en');
      setUserScore(savedUserScore ? parseInt(savedUserScore) : 0);

      // Restore question index and state
      const questionIndex = savedQuestionIndex ? parseInt(savedQuestionIndex) : 0;
      setCurrentQuestionIndex(questionIndex);

      // Save the current index if it wasn't saved before
      if (!savedQuestionIndex) {
        localStorage.setItem('currentQuestionIndex', '0');
      }

      // Restore the state of the current question if it was answered
      const savedQuizState = localStorage.getItem(`quizState_${questionIndex}`);
      if (savedQuizState) {
        const quizState = JSON.parse(savedQuizState);
        setSelectedAnswer(quizState.selectedAnswer);
        setIsChecked(quizState.isChecked);
        setIsCorrect(quizState.isCorrect);
        setCorrectAnswer(quizState.correctAnswer);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleOptionSelect = (optionText: string) => {
    if (isChecked) return; // Can't change answer after checking
    setSelectedAnswer(optionText);
  };

  const handleCheck = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];

    try {
      // Call backend to check the answer
      console.log('Checking answer for question ID:', currentQuestion.id);
      console.log('Selected answer:', selectedAnswer);

      const response = await axios.post(
        `${API_URL}/lms/questions/${currentQuestion.id}/check_answer/`,
        { answer: selectedAnswer }
      );

      console.log('Response:', response.data);
      const { is_correct, correct_answer } = response.data;

      setIsCorrect(is_correct);
      setCorrectAnswer(correct_answer);
      setIsChecked(true);

      // Save quiz state for current question
      const quizState = {
        selectedAnswer,
        isChecked: true,
        isCorrect: is_correct,
        correctAnswer: correct_answer,
      };
      localStorage.setItem(`quizState_${currentQuestionIndex}`, JSON.stringify(quizState));

      if (is_correct) {
        const newScore = userScore + 1;
        setUserScore(newScore);
        localStorage.setItem('userScore', newScore.toString());
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      alert('Error checking answer. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Save current question index
      localStorage.setItem('currentQuestionIndex', nextIndex.toString());

      // Check if next question was already answered
      const savedQuizState = localStorage.getItem(`quizState_${nextIndex}`);

      if (savedQuizState) {
        // Restore the saved state for this question
        const quizState = JSON.parse(savedQuizState);
        setSelectedAnswer(quizState.selectedAnswer);
        setIsChecked(quizState.isChecked);
        setIsCorrect(quizState.isCorrect);
        setCorrectAnswer(quizState.correctAnswer);
      } else {
        // Reset state for new question
        setSelectedAnswer(null);
        setIsChecked(false);
        setIsCorrect(false);
        setCorrectAnswer(null);
      }
    } else {
      // Quiz completed - navigate to results
      router.push('/quiz-result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Move to previous question
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // Save current question index
      localStorage.setItem('currentQuestionIndex', prevIndex.toString());

      // Check if previous question was already answered
      const savedQuizState = localStorage.getItem(`quizState_${prevIndex}`);

      if (savedQuizState) {
        // Restore the saved state for this question
        const quizState = JSON.parse(savedQuizState);
        setSelectedAnswer(quizState.selectedAnswer);
        setIsChecked(quizState.isChecked);
        setIsCorrect(quizState.isCorrect);
        setCorrectAnswer(quizState.correctAnswer);
      } else {
        // Reset state for previous question
        setSelectedAnswer(null);
        setIsChecked(false);
        setIsCorrect(false);
        setCorrectAnswer(null);
      }
    }
  };

  const handlePronunciation = async (accent: 'british' | 'american') => {
    const word = currentQuestion.text;
    const book = localStorage.getItem('book');
    const unit = localStorage.getItem('unit');

    if (word && book && unit) {
      try {
        const response = await axios.get(
          `${API_URL}/lms/pronunciation/?word=${encodeURIComponent(word)}&accent=${encodeURIComponent(accent)}&book=${encodeURIComponent(book)}&unit=${encodeURIComponent(unit)}`
        );

        if (response.data && response.data.url) {
          const audio = new Audio(response.data.url);
          audio.play();
        }
      } catch (error) {
        console.error('Error fetching pronunciation:', error);
      }
    }
  };

  const handleBackToUnit = () => {
    localStorage.removeItem('questions');
    localStorage.removeItem('userScore');
    localStorage.removeItem('currentQuestionIndex');

    // Clear all saved quiz states
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('quizState_')) {
        localStorage.removeItem(key);
      }
    });

    // Don't remove book and unit - just show unit popup
    localStorage.setItem('unitPopupStatus', '1');
    router.push('/');
  };

  if (questions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0d0e0d'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const texts = {
    en: { back: 'Back', next: 'Next', check: 'Check', of: 'of', questions: 'questions', score: 'Score', units: 'Units', previous: 'Previous' },
    de: { back: 'Zurück', next: 'Weiter', check: 'Prüfen', of: 'von', questions: 'Fragen', score: 'Spielstand', units: 'Einheiten', previous: 'Zurück' }
  };
  const t = texts[activeLanguage as 'en' | 'de'] || texts.en;

  return (
    <div className="quiz-page">
      <main className="main">
        <section className="quiz-section active">
          <div className="quiz-box active">
            {/* Back to Units button at top-left */}
            <button
              className="backToUnit-btn active"
              onClick={handleBackToUnit}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                padding: '8px 16px'
              }}
            >
              <span>←</span>
              <span>{t.units}</span>
            </button>

            <h1>Essential Quiz</h1>

            <div className="quiz-header">
              <span className="question-total">
                {currentQuestionIndex + 1} {t.of} {questions.length} {t.questions}
              </span>
              <span className="header-score">
                {t.score}: {userScore} / {questions.length}
              </span>
            </div>

            <div className="question-line">
              <h2 className="question-text">
                {currentQuestion.text}
              </h2>
              <button
                className="audio"
                data-accent="british"
                onClick={() => handlePronunciation('british')}
              >
                <i className="fas fa-volume-up"></i>
              </button>
              <button
                className="audio"
                data-accent="american"
                onClick={() => handlePronunciation('american')}
              >
                <i className="fas fa-volume-up"></i>
              </button>
            </div>

            <div className="option-list">
              {currentQuestion.options?.sort((a: any, b: any) => a.order - b.order).map((option: any) => {
                const isSelected = selectedAnswer === option.text;
                const isThisCorrect = isChecked && option.text === correctAnswer;
                const isThisWrong = isChecked && isSelected && !isCorrect;

                let className = 'option';
                if (isSelected && !isChecked) className += ' selected';
                if (isThisCorrect) className += ' correct';
                if (isThisWrong) className += ' incorrect';
                if (isChecked) className += ' disabled';

                return (
                  <div
                    key={option.id}
                    className={className}
                    onClick={() => handleOptionSelect(option.text)}
                  >
                    <span>{option.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="quiz-footer">
              <button
                className={`backToUnit-btn ${currentQuestionIndex > 0 ? 'active' : ''}`}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                {t.previous}
              </button>
              {!isChecked ? (
                <button
                  className={`next-btn ${selectedAnswer ? 'active' : ''}`}
                  onClick={handleCheck}
                  disabled={!selectedAnswer}
                >
                  {t.check}
                </button>
              ) : (
                <button className="next-btn active" onClick={handleNext}>
                  {t.next}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
