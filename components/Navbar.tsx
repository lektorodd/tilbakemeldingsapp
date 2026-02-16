'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import SyncStatusIndicator from './SyncStatusIndicator';
import DarkModeToggle from './DarkModeToggle';
import { GraduationCap, HelpCircle, Github } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const APP_VERSION = '0.3.0';

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/courses';

  return (
    <nav className="bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Home + Version */}
          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-text-primary hover:text-brand transition-colors"
            >
              <GraduationCap size={20} />
              <span className="font-display font-semibold text-lg">{t('common.appName')}</span>
            </Link>
            <span className="text-[10px] font-mono text-text-disabled bg-surface-alt px-1.5 py-0.5 rounded hidden sm:inline">
              v{APP_VERSION}
            </span>
          </div>

          {/* Right side - Sync + Dark Mode + GitHub + Help + Language */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SyncStatusIndicator />
            <DarkModeToggle />
            <a
              href="https://github.com/lektorodd/tilbakemeldingsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-brand hover:bg-surface-alt rounded-lg transition-colors"
              title={t('common.github')}
            >
              <Github size={18} />
              <span className="hidden sm:inline text-sm font-medium">{t('common.github')}</span>
            </a>
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
