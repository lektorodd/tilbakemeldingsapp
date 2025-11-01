'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded transition ${
          language === 'en'
            ? 'text-rose-600 font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLanguage('nb')}
        className={`px-2 py-1 rounded transition ${
          language === 'nb'
            ? 'text-rose-600 font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        NB
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLanguage('nn')}
        className={`px-2 py-1 rounded transition ${
          language === 'nn'
            ? 'text-rose-600 font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        NN
      </button>
    </div>
  );
}
