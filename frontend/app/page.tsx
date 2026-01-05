'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import WordRotation from '@/components/WordRotation';
import { BookOpen, Brain, Target, Zap, Award, Users, ChevronRight } from 'lucide-react';

type Language = 'en' | 'de' | null;
type Book = 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showBookPopup, setShowBookPopup] = useState(false);
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>(null);
  const [selectedBook, setSelectedBook] = useState<Book>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('activeLanguage') as Language;
    if (savedLanguage) setActiveLanguage(savedLanguage);

    const unitPopupStatus = localStorage.getItem('unitPopupStatus');
    const savedBook = localStorage.getItem('book') as Book;

    if (unitPopupStatus === '1' && savedBook) {
      setSelectedBook(savedBook);
      setShowUnitPopup(true);
      localStorage.removeItem('unitPopupStatus');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleGetStarted = () => {
    router.push('/target-lang');
  };

  const handleLanguageSelect = (language: Language) => {
    setActiveLanguage(language);
    localStorage.setItem('activeLanguage', language!);
    setShowLanguagePopup(false);
    setShowBookPopup(true);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    localStorage.setItem('book', book!);

    if (book === 'E5' || book === 'E6') {
      setShowErrorPopup(true);
      return;
    }

    setShowBookPopup(false);
    setShowUnitPopup(true);
  };

  const handleUnitSelect = async (unitNumber: number) => {
    localStorage.setItem('unit', unitNumber.toString());

    try {
      const booksResponse = await axios.get(`${API_URL}/lms/books/`);
      const books = booksResponse.data.results || booksResponse.data;

      const book = books.find((b: any) =>
        b.title === selectedBook &&
        b.language_code.toLowerCase() === activeLanguage?.toLowerCase()
      );

      if (!book) {
        alert('Book not found. Please try again.');
        return;
      }

      const response = await axios.get(`${API_URL}/lms/questions/`, {
        params: {
          book: book.id,
          unit: unitNumber,
          for_quiz: 'true'
        }
      });

      const questions = response.data.results || response.data;

      if (!questions || questions.length === 0) {
        alert('No questions found for this unit.');
        return;
      }

      localStorage.setItem('questions', JSON.stringify(questions));
      localStorage.setItem('currUnit', unitNumber.toString());
      localStorage.setItem('bookId', book.id.toString());

      router.push('/quiz');
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Error loading quiz. Please try again.');
    }
  };

  const texts = {
    en: {
      bookPopupTitle: "Select desired book to practise",
      unitPopupTitle: "Choose the unit",
      back: "Back",
      notAvailable: "Not available yet"
    },
    de: {
      bookPopupTitle: "Wähle gewünschtes Buch zu üben",
      unitPopupTitle: "Wähle eine Lektion",
      back: "Zurück",
      notAvailable: "Noch nicht verfügbar"
    }
  };

  const currentTexts = activeLanguage ? texts[activeLanguage] : texts.en;

  const handleLogout = async () => {
    await logout();
    setShowProfileDropdown(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Modern Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Essential Words</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border-2 border-gray-200 hover:border-blue-400 transition-colors overflow-hidden">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                    <button
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profile
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`${(showLanguagePopup || showBookPopup || showUnitPopup) ? 'filter blur-sm pointer-events-none' : ''}`}>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Master vocabulary 3x faster
              </div>

              {/* Word Rotation */}
              <div className="mb-6">
                <WordRotation
                  words={[
                    'Transform Your Vocabulary Journey',
                    'Ingliz tilini osonlik bilan o\'rganing',
                    'Lernen Sie Deutsch spielerisch'
                  ]}
                  interval={3000}
                />
              </div>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Learn new words effortlessly through engaging interactive quizzes, personalized learning paths, and scientifically-proven spaced repetition techniques.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Start Learning Free
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-6">No credit card required • 7-day free trial</p>
            </div>

            {/* Stats Section */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-green-50 to-blue-100 rounded-3xl transform -rotate-1"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                    <div className="text-gray-600">Active Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">50M+</div>
                    <div className="text-gray-600">Words Learned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">4.9/5</div>
                    <div className="text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to Excel
              </h2>
              <p className="text-xl text-gray-600">
                Powerful features designed to accelerate your vocabulary mastery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Adaptive Learning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI-powered system adapts to your learning pace and focuses on words you need to practice most.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Quizzes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Engage with dynamic quizzes featuring multiple choice, fill-in-the-blank, and context-based questions.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Spaced Repetition</h3>
                <p className="text-gray-600 leading-relaxed">
                  Scientifically proven method that helps you remember words longer by reviewing them at optimal intervals.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your improvement with detailed analytics, streaks, and achievement badges to stay motivated.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Curated Word Lists</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access thousands of professionally curated word lists organized by topics, difficulty, and exam prep.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Challenges</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join group challenges, compete on leaderboards, and learn together with a supportive community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Start your vocabulary journey in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Path</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Select from pre-made word lists or create your own. Set your daily learning goals and preferred difficulty level.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Learn & Practice</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Complete interactive quizzes daily. Our adaptive algorithm personalizes your learning experience in real-time.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Master & Achieve</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Watch your vocabulary grow. Earn achievements, maintain streaks, and see measurable improvements in your language skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="/images/Coliseum.jpg"
                  alt="Coliseum"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">About the Founder</h2>
                <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <p>
                    This platform was born from a simple realization: vocabulary is the cornerstone of language learning.
                    When I was learning English, the book "Essential 4000 Words" became my trusted companion, helping me
                    build a strong foundation and improve my overall language skills.
                  </p>
                  <p>
                    Later, when learning German, I couldn't find a similar resource. That's when I decided to create
                    Essential Words—a platform where learners can master essential vocabulary through interactive quizzes
                    and engaging exercises, following the proven methodology of the "Essential 4000 Words" book.
                  </p>
                  <p className="italic text-gray-700 font-medium">
                    I hope this website will help you achieve your language-learning goals, just as the original book helped me.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span className="text-white font-bold">Essential Words</span>
              </div>
              <p className="text-sm">© 2024-2025 Essential Words. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Existing Popups - Kept unchanged */}
      {showLanguagePopup && (
        <div className="popup-info active">
          <h2>Which language do you want to learn?</h2>
          <div className="languages-btn">
            <button
              className="info-btn german-btn"
              onClick={() => handleLanguageSelect('de')}
            />
            <button
              className="info-btn english-btn"
              onClick={() => handleLanguageSelect('en')}
            />
          </div>
          <div className="btn-group">
            <button className="exit-btn" onClick={() => setShowLanguagePopup(false)}>
              Exit
            </button>
          </div>
        </div>
      )}

      {showBookPopup && (
        <div className="essentials-popup active">
          <h2>{currentTexts.bookPopupTitle}</h2>
          <div className="essentials-btn">
            {(['E1', 'E2', 'E3', 'E4'] as const).map((book) => (
              <button
                key={book}
                className="essential"
                onClick={() => handleBookSelect(book)}
              >
                {book}
              </button>
            ))}
          </div>
          <div className="btn-group">
            <button className="backToLang-btn" onClick={() => {
              setShowBookPopup(false);
              setShowLanguagePopup(true);
            }}>
              {currentTexts.back}
            </button>
          </div>
        </div>
      )}

      {showUnitPopup && (
        <div className="unit-popup active">
          <h2>{currentTexts.unitPopupTitle}</h2>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="unit-list">
              {Array.from({ length: 5 }, (_, j) => {
                const unitNumber = i * 5 + j + 1;
                return (
                  <button
                    key={unitNumber}
                    className="unit"
                    onClick={() => handleUnitSelect(unitNumber)}
                  >
                    {unitNumber}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="btn-group2">
            <button className="backToEss-btn" onClick={() => {
              setShowUnitPopup(false);
              setShowBookPopup(true);
            }}>
              {currentTexts.back}
            </button>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="error-popup active">
          <h2>{currentTexts.notAvailable}</h2>
          <button className="OK-btn" onClick={() => setShowErrorPopup(false)}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}
