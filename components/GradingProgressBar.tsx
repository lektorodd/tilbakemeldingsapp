'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface GradingProgressBarProps {
  completedCount: number;
  totalCount: number;
  absentCount?: number;
}

export default function GradingProgressBar({ completedCount, totalCount, absentCount = 0 }: GradingProgressBarProps) {
  const { t } = useLanguage();

  const effectiveTotal = totalCount - absentCount;

  if (effectiveTotal <= 0 && absentCount === 0) return null;

  const percentage = effectiveTotal > 0 ? Math.round((completedCount / effectiveTotal) * 100) : 0;

  return (
    <div className="bg-surface rounded-lg shadow-sm p-4 mb-6 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">
          {t('test.gradingProgress')}
        </span>
        <div className="flex items-center gap-3">
          {absentCount > 0 && (
            <span className="text-xs text-text-disabled">
              {t('test.absentCount').replace('{count}', absentCount.toString())}
            </span>
          )}
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {completedCount} / {effectiveTotal} ({percentage}%)
          </span>
        </div>
      </div>
      <div className="w-full bg-surface-alt rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${percentage === 100
            ? 'bg-success'
            : percentage >= 50
              ? 'bg-brand'
              : 'bg-amber-500'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage === 100 && (
        <p className="text-xs text-success mt-1 font-medium">
          {t('test.allStudentsGraded')}
        </p>
      )}
    </div>
  );
}

