'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 rounded-md transition-colors ${
          language === 'en'
            ? 'text-brand bg-info-bg font-semibold'
            : 'text-text-disabled hover:text-text-secondary hover:bg-surface-alt'
        }`}
      >
        EN
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => setLanguage('nb')}
        className={`px-2.5 py-1.5 rounded-md transition-colors ${
          language === 'nb'
            ? 'text-brand bg-info-bg font-semibold'
            : 'text-text-disabled hover:text-text-secondary hover:bg-surface-alt'
        }`}
      >
        NB
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => setLanguage('nn')}
        className={`px-2.5 py-1.5 rounded-md transition-colors ${
          language === 'nn'
            ? 'text-brand bg-info-bg font-semibold'
            : 'text-text-disabled hover:text-text-secondary hover:bg-surface-alt'
        }`}
      >
        NN
      </button>
    </div>
  );
}
