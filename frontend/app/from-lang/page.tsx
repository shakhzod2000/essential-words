'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '/images/fahne-usa.jpg' },
  { code: 'de', name: 'German', flag: '/images/fahne_deutschland.jpg' },
  { code: 'uz', name: 'Uzbek', flag: '/images/fahne-usbekistan.jpg' },
];

export default function FromLanguagePage() {
  const router = useRouter();
  const [targetLanguage, setTargetLanguage] = useState('');

  useEffect(() => {
    const target = localStorage.getItem('targetLanguage');
    if (!target) {
      router.push('/target-lang');
      return;
    }
    setTargetLanguage(target);
  }, [router]);

  const handleLanguageSelect = (langCode: string) => {
    localStorage.setItem('fromLanguage', langCode);
    router.push('/learning-path');
  };

  const getAvailableLanguages = () => {
    return AVAILABLE_LANGUAGES.filter(lang => lang.code !== targetLanguage);
  };

  if (!targetLanguage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            I speak...
          </h1>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {getAvailableLanguages().map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 overflow-hidden"
            >
              {/* Flag Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={language.flag}
                  alt={language.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Language Name - Duolingo Style */}
              <div className="p-4 border-t-2 border-gray-200 bg-white">
                <p className="text-center text-lg font-bold text-gray-700">
                  {language.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/target-lang')}
            className="text-blue-600 hover:text-blue-700 font-bold text-lg"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
