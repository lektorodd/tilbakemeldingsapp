'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScoringGuideProps {
  variant?: 'button' | 'inline' | 'compact';
}

export default function ScoringGuide({ variant = 'button' }: ScoringGuideProps) {
  const { t } = useLanguage();
  const [showGuide, setShowGuide] = useState(false);

  const scores = [0, 1, 2, 3, 4, 5, 6];

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'bg-success text-white';
    if (score >= 3) return 'bg-warning text-white';
    return 'bg-danger text-white';
  };

  if (variant === 'inline') {
    return (
      <div className="bg-info-bg border border-info rounded-lg p-4">
        <h3 className="font-semibold text-info mb-3 flex items-center gap-2">
          <HelpCircle size={20} />
          {t('dashboard.scoringGuide')}
        </h3>
        <div className="space-y-2">
          {scores.map(score => (
            <div key={score} className="flex gap-2 items-start text-sm">
              <span className={`px-2 py-1 rounded font-bold min-w-[32px] text-center ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-text-primary flex-1">
                {t(`dashboard.score${score}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGuide(!showGuide)}
        className={variant === 'compact'
          ? 'w-9 h-9 flex items-center justify-center rounded-lg bg-info-bg text-info hover:bg-surface-alt transition'
          : 'inline-flex items-center gap-1 px-3 py-1.5 bg-info-bg text-info rounded-lg hover:bg-surface-alt transition text-sm font-medium'
        }
        title={t('dashboard.scoringGuide')}
      >
        <HelpCircle size={16} />
        {variant !== 'compact' && t('dashboard.scoringGuide')}
      </button>

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
                <HelpCircle size={24} className="text-info" />
                {t('dashboard.scoringGuide')}
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 hover:bg-surface-alt rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {scores.map(score => (
                <div key={score} className="flex gap-3 items-start p-3 border border-border rounded-lg hover:bg-background transition">
                  <span className={`px-3 py-2 rounded-lg font-bold text-lg min-w-[48px] text-center ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <div className="flex-1">
                    <p className="text-text-primary">
                      {t(`dashboard.score${score}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
