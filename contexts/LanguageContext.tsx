'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'nb' | 'nn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nb'); // Default to Norwegian Bokmål

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored && (stored === 'en' || stored === 'nb' || stored === 'nn')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translations = getTranslations(language);
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation loader
function getTranslations(lang: Language) {
  const translations = {
    en: require('@/locales/en.json'),
    nb: require('@/locales/nb.json'),
    nn: require('@/locales/nn.json'),
  };
  return translations[lang] || translations.nb;
}
