'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import nb from '@/locales/nb.json';
import nn from '@/locales/nn.json';

type Language = 'en' | 'nb' | 'nn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en,
  nb,
  nn,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nb'); // Default to Norwegian Bokmål
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
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
    const translation = translations[language];
    const keys = key.split('.');
    let value: any = translation;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === 'string' ? value : key;
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

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
