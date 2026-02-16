'use client';

import { BackupEntry } from '@/utils/storage';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BackupPanelProps {
  backups: BackupEntry[];
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
}

export default function BackupPanel({ backups, onRestore, onDelete }: BackupPanelProps) {
  const { t } = useLanguage();

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBackupLabelColor = (label?: string) => {
    switch (label) {
      case 'before-delete': return 'bg-red-100 text-red-700';
      case 'before-import': return 'bg-yellow-100 text-yellow-700';
      case 'before-restore': return 'bg-orange-100 text-orange-700';
      case 'manual': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getBackupLabelText = (label?: string) => {
    switch (label) {
      case 'before-delete': return t('backup.labelBeforeDelete');
      case 'before-import': return t('backup.labelBeforeImport');
      case 'before-restore': return t('backup.labelBeforeRestore');
      case 'manual': return t('backup.labelManual');
      default: return t('backup.labelAuto');
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h4 className="text-sm font-semibold text-text-primary mb-3">
        {t('backup.savedBackups')} ({backups.length})
      </h4>
      {backups.length === 0 ? (
        <p className="text-sm text-text-secondary">{t('backup.noBackups')}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {backups.map(backup => (
            <div key={backup.id} className="flex items-center justify-between bg-background rounded-lg p-3 border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary">
                    {new Date(backup.timestamp).toLocaleString('nb-NO')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBackupLabelColor(backup.label)}`}>
                    {getBackupLabelText(backup.label)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  {backup.courseCount} {t('backup.courses')} · {backup.totalFeedback} {t('backup.feedbackEntries')} · {formatBytes(backup.sizeBytes)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => onRestore(backup.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
                >
                  <RotateCcw size={14} />
                  {t('backup.restore')}
                </button>
                <button
                  onClick={() => onDelete(backup.id)}
                  className="p-1.5 text-danger hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
