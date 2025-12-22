'use client';

import { useState } from 'react';
import { Globe, ChevronRight } from 'lucide-react';

interface LanguageSelectionProps {
  onLanguagesSelected: (fromLang: string, toLang: string) => void;
}

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

export default function LanguageSelection({ onLanguagesSelected }: LanguageSelectionProps) {
  const [step, setStep] = useState<'from' | 'to'>('from');
  const [fromLanguage, setFromLanguage] = useState<string>('');
  const [toLanguage, setToLanguage] = useState<string>('');

  const handleFromLanguageSelect = (langCode: string) => {
    setFromLanguage(langCode);
    setStep('to');
  };

  const handleToLanguageSelect = (langCode: string) => {
    setToLanguage(langCode);
    onLanguagesSelected(fromLanguage, langCode);
  };

  const getAvailableToLanguages = () => {
    return AVAILABLE_LANGUAGES.filter(lang => lang.code !== fromLanguage);
  };

  const selectedFromLang = AVAILABLE_LANGUAGES.find(lang => lang.code === fromLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 'from' ? 'bg-blue-600' : 'bg-green-600'} text-white font-bold text-sm`}>
            1
          </div>
          <div className={`h-1 w-16 ${step === 'to' ? 'bg-green-600' : 'bg-gray-300'} transition-colors`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 'to' ? 'bg-blue-600' : 'bg-gray-300'} text-white font-bold text-sm transition-colors`}>
            2
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-blue-600" />
          </div>
          {step === 'from' ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                I want to learn...
              </h1>
              <p className="text-xl text-gray-600">
                Choose the language you want to learn
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                I speak...
              </h1>
              <p className="text-xl text-gray-600">
                Choose your native language
              </p>
            </>
          )}
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {(step === 'from' ? AVAILABLE_LANGUAGES : getAvailableToLanguages()).map((language) => (
            <button
              key={language.code}
              onClick={() => step === 'from' ? handleFromLanguageSelect(language.code) : handleToLanguageSelect(language.code)}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-600 transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={language.flag}
                  alt={language.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{language.name}</h3>
                <div className="flex items-center text-white/90">
                  <span className="text-sm font-medium">Select</span>
                  <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back button for step 2 */}
        {step === 'to' && (
          <div className="text-center mt-8">
            <button
              onClick={() => setStep('from')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Selected languages display */}
        {step === 'to' && selectedFromLang && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Learning: <span className="font-semibold text-gray-900">{selectedFromLang.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
