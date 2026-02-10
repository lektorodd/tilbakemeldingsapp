'use client';

import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';

interface LabelManagerProps {
  labels: string[];
  onLabelsChange: (labels: string[]) => void;
}

export default function LabelManager({ labels, onLabelsChange }: LabelManagerProps) {
  const { t } = useLanguage();
  const { toast, confirm } = useNotification();
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;

    const trimmed = newLabel.trim().toLowerCase();
    if (labels.includes(trimmed)) {
      toast(t('course.labelAlreadyExists'), 'warning');
      return;
    }

    onLabelsChange([...labels, trimmed]);
    setNewLabel('');
    setShowAddLabel(false);
  };

  const handleRemoveLabel = async (label: string) => {
    if (await confirm(t('course.removeLabelConfirm').replace('{label}', label))) {
      onLabelsChange(labels.filter(l => l !== label));
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-brand" />
          <h3 className="text-lg font-semibold text-text-primary">{t('course.courseLabels')}</h3>
        </div>
        <button
          onClick={() => setShowAddLabel(!showAddLabel)}
          className="flex items-center gap-1 px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
        >
          <Plus size={16} />
          {t('course.addLabelButton')}
        </button>
      </div>

      {showAddLabel && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
            className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-text-primary"
            placeholder={t('course.labelPlaceholder')}
            autoFocus
          />
          <button
            onClick={handleAddLabel}
            className="px-3 py-1.5 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition-colors text-sm"
          >
            {t('course.addButton')}
          </button>
          <button
            onClick={() => {
              setShowAddLabel(false);
              setNewLabel('');
            }}
            className="px-3 py-1.5 bg-gray-300 text-text-secondary rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            {t('course.cancelButton')}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-sm text-text-disabled">{t('course.noLabelsYet')}</p>
        ) : (
          labels.map(label => (
            <div
              key={label}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              <span>{label}</span>
              <button
                onClick={() => handleRemoveLabel(label)}
                className="hover:bg-purple-200 rounded-full p-0.5 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-text-secondary mt-3">
        {t('course.labelsHelpText')}
      </p>
    </div>
  );
}
