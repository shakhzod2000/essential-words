'use client';

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

export default function TargetLanguagePage() {
  const router = useRouter();

  const handleLanguageSelect = (langCode: string) => {
    localStorage.setItem('targetLanguage', langCode);
    router.push('/from-lang');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            I want to learn...
          </h1>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {AVAILABLE_LANGUAGES.map((language) => (
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
      </div>
    </div>
  );
}
