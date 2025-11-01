'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import { Home, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/courses';

  return (
    <nav className="bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Home */}
          <div className="flex items-center">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-text-primary hover:text-brand transition-colors"
            >
              <Home size={20} />
              <span className="font-display font-semibold text-lg">{t('common.appName')}</span>
            </Link>
          </div>

          {/* Right side - Help button + Language selector */}
          <div className="flex items-center gap-2">
            <Link
              href="/help"
              className="flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-brand hover:bg-surface-alt rounded-lg transition-colors"
              title={t('help.title')}
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline text-sm font-medium">{t('common.help')}</span>
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
