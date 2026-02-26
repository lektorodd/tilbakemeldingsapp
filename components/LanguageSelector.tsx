'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en' as const, label: 'EN' },
  { code: 'nb' as const, label: 'NB' },
  { code: 'nn' as const, label: 'NN' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface-alt rounded-lg p-0.5 border border-border">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${language === code
              ? 'bg-brand text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          aria-current={language === code ? 'true' : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
