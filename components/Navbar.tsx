'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';
import SyncStatusIndicator from './SyncStatusIndicator';
import DarkModeToggle from './DarkModeToggle';
import { GraduationCap, HelpCircle, Github } from 'lucide-react';
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
          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              className="flex items-center gap-2 text-text-primary hover:text-brand transition-colors"
            >
              <GraduationCap size={20} />
              <span className="font-display font-semibold text-lg">{t('common.appName')}</span>
            </Link>
          </div>

          {/* Right side - Sync + Dark Mode + GitHub + Help + Language */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SyncStatusIndicator />
            <DarkModeToggle />
            <a
              href="https://github.com/lektorodd/tilbakemeldingsapp"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                const url = 'https://github.com/lektorodd/tilbakemeldingsapp';
                // In Tauri, window.open may not work, so also try location-based approach
                const w = window.open(url, '_blank');
                if (!w) {
                  // Fallback: use fetch to trigger server-side open
                  fetch(`/api/open-url?url=${encodeURIComponent(url)}`).catch(() => { });
                }
              }}
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
