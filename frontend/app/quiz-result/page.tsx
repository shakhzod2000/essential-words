'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizResultPage() {
  const router = useRouter();
  const [userScore, setUserScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Load results from localStorage
    const savedUserScore = localStorage.getItem('userScore');
    const savedQuestions = localStorage.getItem('questions');
    const savedLanguage = localStorage.getItem('activeLanguage');

    console.log('Quiz Result - localStorage check:');
    console.log('savedQuestions:', savedQuestions);
    console.log('savedUserScore:', savedUserScore);
    console.log('savedLanguage:', savedLanguage);

    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions);
        const score = savedUserScore ? parseInt(savedUserScore) : 0;
        const total = questions.length;
        const percent = Math.round((score / total) * 100);

        console.log('Parsed data:', { score, total, percent });

        setUserScore(score);
        setTotalQuestions(total);
        setPercentage(percent);
        setActiveLanguage(savedLanguage || 'en');

        // Animate progress circle
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress++;
          setProgressValue(currentProgress);
          if (currentProgress >= percent) {
            clearInterval(interval);
          }
        }, 20);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing quiz data:', error);
        router.push('/');
      }
    } else {
      console.log('No questions found in localStorage, redirecting to home');
      router.push('/');
    }
  }, [router]);

  const handleTryAgain = () => {
    // Clear quiz state and scores only
    localStorage.removeItem('userScore');
    localStorage.removeItem('currentQuestionIndex');

    // Clear all saved quiz states
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('quizState_')) {
        localStorage.removeItem(key);
      }
    });

    // Set score back to 0
    localStorage.setItem('userScore', '0');
    localStorage.setItem('currentQuestionIndex', '0');

    // Redirect to quiz page to restart same unit
    router.push('/quiz');
  };

  const handleGoHome = () => {
    // Clear all quiz-related data
    localStorage.removeItem('questions');
    localStorage.removeItem('userScore');
    localStorage.removeItem('currentQuestionIndex');

    // Clear all saved quiz states
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('quizState_')) {
        localStorage.removeItem(key);
      }
    });

    router.push('/');
  };

  const texts = {
    en: {
      title: 'Quiz Result!',
      scoreText: `You got ${userScore} out of ${totalQuestions} questions correct.`,
      goHome: 'Go Home',
      tryAgain: 'Try Again'
    },
    de: {
      title: 'Quiz Ergebnis!',
      scoreText: `Du hast ${userScore} von ${totalQuestions} Fragen richtig beantwortet.`,
      goHome: 'Startseite',
      tryAgain: 'Erneut versuchen'
    }
  };
  const t = texts[activeLanguage as 'en' | 'de'] || texts.en;

  if (totalQuestions === 0) {
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

  return (
    <div className="result-page">
      <main className="main">
        <div className="container">
          <section className="quiz-section active">
            <div className="result-box active">
              <h2>{t.title}</h2>
              <div className="percentage-container">
                <div
                  className="circular-progress"
                  style={{
                    background: `conic-gradient(#5bf846 ${progressValue * 3.6}deg, white 0deg)`
                  }}
                >
                  <span className="progress-value">{progressValue}%</span>
                </div>

                <span className="score-text">{t.scoreText}</span>
              </div>

              <div className="buttons">
                <button className="goHome-btn" onClick={handleGoHome}>
                  {t.goHome}
                </button>
                <button className="tryAgain-btn" onClick={handleTryAgain}>
                  {t.tryAgain}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
