'use client';

import { Course } from '@/types';
import { ImportResult } from '@/utils/courseStorage';
import { Plus, RotateCcw, AlertTriangle, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImportModalProps {
  importResult: ImportResult | null;
  importPreview: Course[] | null;
  existingCourses: Course[];
  importMergeMode: 'skip' | 'merge' | 'duplicate';
  onMergeModeChange: (mode: 'skip' | 'merge' | 'duplicate') => void;
  onConfirmImport: () => void;
  onClose: () => void;
}

export default function ImportModal({
  importResult,
  importPreview,
  existingCourses,
  importMergeMode,
  onMergeModeChange,
  onConfirmImport,
  onClose,
}: ImportModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg shadow-xl p-6 max-w-lg w-full border border-border max-h-[80vh] overflow-y-auto">
        {importResult ? (
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('backup.importResults')}</h2>
            <div className="space-y-3 mb-6">
              {importResult.imported > 0 && (
                <div className="flex items-center gap-2 text-success">
                  <Plus size={18} />
                  <span>{t('backup.importedCount').replace('{count}', String(importResult.imported))}</span>
                </div>
              )}
              {importResult.merged > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <RotateCcw size={18} />
                  <span>{t('backup.mergedCount').replace('{count}', String(importResult.merged))}</span>
                </div>
              )}
              {importResult.skippedDuplicates > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <AlertTriangle size={18} />
                  <span>{t('backup.skippedCount').replace('{count}', String(importResult.skippedDuplicates))}</span>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700 mb-1">{t('backup.importErrors')}:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
            >
              {t('common.close')}
            </button>
          </div>
        ) : importPreview ? (
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{t('backup.importPreviewTitle')}</h2>
            <p className="text-sm text-text-secondary mb-4">{t('backup.importPreviewDesc')}</p>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {importPreview.map((course, i) => {
                const feedbackCount = course.tests?.reduce((sum, test) =>
                  sum + (test.studentFeedbacks?.filter(f => f.completedDate)?.length || 0), 0) || 0;
                const existing = existingCourses.find(c =>
                  c.id === course.id || c.name.toLowerCase() === course.name?.toLowerCase()
                );
                return (
                  <div key={i} className={`p-3 rounded-lg border ${existing ? 'border-yellow-300 bg-yellow-50' : 'border-border bg-background'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">{course.name || `Course ${i + 1}`}</span>
                      {existing && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">{t('backup.duplicate')}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {course.students?.length || 0} {t('course.students').toLowerCase()} · {course.tests?.length || 0} {t('course.tests').toLowerCase()} · {feedbackCount} {t('backup.feedbackEntries').toLowerCase()}
                    </p>
                  </div>
                );
              })}
            </div>

            {importPreview.some(c => existingCourses.find(ec => ec.id === c.id || ec.name?.toLowerCase() === c.name?.toLowerCase())) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">{t('backup.duplicateHandling')}</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mergeMode" checked={importMergeMode === 'skip'} onChange={() => onMergeModeChange('skip')} />
                    <span className="text-sm text-text-primary">{t('backup.modeSkip')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mergeMode" checked={importMergeMode === 'merge'} onChange={() => onMergeModeChange('merge')} />
                    <span className="text-sm text-text-primary">{t('backup.modeMerge')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mergeMode" checked={importMergeMode === 'duplicate'} onChange={() => onMergeModeChange('duplicate')} />
                    <span className="text-sm text-text-primary">{t('backup.modeDuplicate')}</span>
                  </label>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">
                <Shield size={14} className="inline mr-1" />
                {t('backup.safetyNote')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onConfirmImport}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                {t('backup.confirmImport')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
