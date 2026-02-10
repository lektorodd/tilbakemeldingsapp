'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface GradingProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export default function GradingProgressBar({ completedCount, totalCount }: GradingProgressBarProps) {
  const { t } = useLanguage();

  if (totalCount === 0) return null;

  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-surface rounded-lg shadow-sm p-4 mb-6 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">
          {t('test.gradingProgress')}
        </span>
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {completedCount} / {totalCount} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            percentage === 100
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
