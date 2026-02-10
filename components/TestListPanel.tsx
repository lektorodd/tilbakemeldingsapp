'use client';

import { CourseTest } from '@/types';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestListPanelProps {
  courseId: string;
  tests: CourseTest[];
  studentCount: number;
  onAddTest: () => void;
  onEditTest: (test: CourseTest) => void;
  onDeleteTest: (testId: string) => void;
}

export default function TestListPanel({
  courseId,
  tests,
  studentCount,
  onAddTest,
  onEditTest,
  onDeleteTest,
}: TestListPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-success" />
          <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.tests')}</h2>
          <span className="text-text-secondary">({tests.length})</span>
        </div>
        <button
          onClick={onAddTest}
          className="flex items-center gap-1 px-3 py-1 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {t('common.add')}
        </button>
      </div>

      <div className="space-y-2">
        {tests.length === 0 ? (
          <p className="text-sm text-text-disabled text-center py-8">{t('course.noTestsYet')}</p>
        ) : (
          [...tests]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(test => {
              const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
              return (
                <div
                  key={test.id}
                  className="border border-border rounded-lg p-3 hover:bg-background"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{test.name}</h4>
                      {test.description && (
                        <p className="text-xs text-text-secondary">{test.description}</p>
                      )}
                      <p className="text-xs text-text-disabled mt-1">
                        {new Date(test.date).toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-brand mt-1">
                        {t('course.completedOf').replace('{completed}', completedCount.toString()).replace('{total}', studentCount.toString())}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditTest(test)}
                        className="p-1 text-brand hover:bg-rose-50 rounded transition"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteTest(test.id)}
                        className="p-1 text-danger hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/course/${courseId}/test/${test.id}`}
                    className="block text-center px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                  >
                    <Edit size={14} className="inline mr-1" />
                    {t('test.giveFeedback')}
                  </Link>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
