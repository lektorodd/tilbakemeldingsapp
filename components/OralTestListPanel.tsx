'use client';

import { OralTest } from '@/types';
import { Plus, Trash2, Edit, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface OralTestListPanelProps {
  courseId: string;
  oralTests: OralTest[];
  studentCount: number;
  onAddOralTest: () => void;
  onEditOralTest: (oralTest: OralTest) => void;
  onDeleteOralTest: (oralTestId: string) => void;
}

export default function OralTestListPanel({
  courseId,
  oralTests,
  studentCount,
  onAddOralTest,
  onEditOralTest,
  onDeleteOralTest,
}: OralTestListPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-indigo-600" />
          <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.oralTests')}</h2>
          <span className="text-text-secondary">({oralTests.length})</span>
        </div>
        <button
          onClick={onAddOralTest}
          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={16} />
          {t('common.add')}
        </button>
      </div>

      <div className="space-y-2">
        {oralTests.length === 0 ? (
          <p className="text-sm text-text-disabled text-center py-8">{t('course.noOralTestsYet')}</p>
        ) : (
          [...oralTests]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(oralTest => {
              const completedCount = oralTest.studentAssessments.filter(a => a.completedDate).length;
              return (
                <div
                  key={oralTest.id}
                  className="border border-border rounded-lg p-3 hover:bg-background"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{oralTest.name}</h4>
                      {oralTest.description && (
                        <p className="text-xs text-text-secondary">{oralTest.description}</p>
                      )}
                      {oralTest.topics && oralTest.topics.length > 0 && (
                        <p className="text-xs text-indigo-600 mt-1">
                          {t('course.topics')}: {oralTest.topics.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-text-disabled mt-1">
                        {new Date(oralTest.date).toLocaleDateString('nb-NO', {
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
                        onClick={() => onEditOralTest(oralTest)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteOralTest(oralTest.id)}
                        className="p-1 text-danger hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/course/${courseId}/oral/${oralTest.id}`}
                    className="block text-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <MessageSquare size={14} className="inline mr-1" />
                    {t('course.giveOralAssessment')}
                  </Link>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
