'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import SyncStatusIndicator from './SyncStatusIndicator';
import DarkModeToggle from './DarkModeToggle';
import { GraduationCap, HelpCircle, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePreferences } from '@/contexts/PreferencesContext';



export default function Navbar() {
  const { t } = useLanguage();
  const { showLabels, showCategories, setShowLabels, setShowCategories } = usePreferences();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/courses';

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

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

          {/* Right side - Sync + Dark Mode + Settings + Help + Language */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SyncStatusIndicator />
            <DarkModeToggle />

            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-brand hover:bg-surface-alt transition-colors"
                title={t('preferences.settings')}
                aria-label={t('preferences.settings')}
              >
                <Settings size={18} />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 py-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-text-disabled uppercase tracking-wide">
                    {t('preferences.settings')}
                  </div>

                  <label className="flex items-center justify-between px-3 py-2 hover:bg-surface-alt cursor-pointer transition">
                    <div>
                      <div className="text-sm text-text-primary">{t('preferences.showLabels')}</div>
                      <div className="text-xs text-text-secondary">{t('preferences.showLabelsHelp')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus ml-3 shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between px-3 py-2 hover:bg-surface-alt cursor-pointer transition">
                    <div>
                      <div className="text-sm text-text-primary">{t('preferences.showCategories')}</div>
                      <div className="text-xs text-text-secondary">{t('preferences.showCategoriesHelp')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showCategories}
                      onChange={(e) => setShowCategories(e.target.checked)}
                      className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus ml-3 shrink-0"
                    />
                  </label>
                </div>
              )}
            </div>

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
