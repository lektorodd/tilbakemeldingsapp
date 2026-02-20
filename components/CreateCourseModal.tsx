'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateCourseModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateCourseModal({ onClose, onCreate }: CreateCourseModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full border border-border">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.createCourseTitle')}</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('course.courseNameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary bg-surface"
              placeholder={t('home.courseNamePlaceholder')}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('course.courseDescriptionLabel')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary bg-surface"
              placeholder={t('course.courseDescriptionPlaceholder')}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-border transition-colors font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onCreate(name, description)}
            className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
          >
            {t('course.createCourseButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
