'use client';

import React from 'react';
import { OralFeedbackData, OralFeedbackDimension, OralFeedbackDimensionType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface OralFeedbackFormProps {
  oralFeedback: OralFeedbackData;
  onOralFeedbackChange: (feedback: OralFeedbackData) => void;
  studentName?: string;
}

const DIMENSIONS: OralFeedbackDimensionType[] = [
  'strategy',
  'reasoning',
  'representations',
  'modeling',
  'communication',
  'subject_knowledge'
];

export default function OralFeedbackForm({
  oralFeedback,
  onOralFeedbackChange,
  studentName
}: OralFeedbackFormProps) {
  const { t } = useLanguage();

  // Calculate score from dimensions (0-60 scale)
  const calculateScore = () => {
    if (oralFeedback.dimensions.length === 0) return 0;
    const totalPoints = oralFeedback.dimensions.reduce((sum, dim) => sum + dim.points, 0);
    const averagePoints = totalPoints / oralFeedback.dimensions.length;
    return Math.round(averagePoints * 10);
  };

  const getDimension = (dimensionType: OralFeedbackDimensionType): OralFeedbackDimension => {
    const existing = oralFeedback.dimensions.find(d => d.dimension === dimensionType);
    return existing || { dimension: dimensionType, points: 0, comment: '' };
  };

  const updateDimension = (dimensionType: OralFeedbackDimensionType, updates: Partial<OralFeedbackDimension>) => {
    const existingIndex = oralFeedback.dimensions.findIndex(d => d.dimension === dimensionType);

    let newDimensions: OralFeedbackDimension[];
    if (existingIndex >= 0) {
      newDimensions = [...oralFeedback.dimensions];
      newDimensions[existingIndex] = { ...newDimensions[existingIndex], ...updates };
    } else {
      newDimensions = [...oralFeedback.dimensions, { dimension: dimensionType, points: 0, comment: '', ...updates }];
    }

    onOralFeedbackChange({
      ...oralFeedback,
      dimensions: newDimensions,
      score: calculateScore()
    });
  };

  const updateGeneralField = (field: keyof OralFeedbackData, value: any) => {
    onOralFeedbackChange({
      ...oralFeedback,
      [field]: value
    });
  };

  // Get dimension label and description
  const getDimensionInfo = (dimension: OralFeedbackDimensionType) => {
    return {
      label: t(`oral.dimension.${dimension}.label`),
      description: t(`oral.dimension.${dimension}.description`),
      rubric2: t(`oral.dimension.${dimension}.rubric2`),
      rubric4: t(`oral.dimension.${dimension}.rubric4`),
      rubric6: t(`oral.dimension.${dimension}.rubric6`)
    };
  };

  const score = calculateScore();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {t('oral.title')}
          {studentName && <span className="text-blue-600"> - {studentName}</span>}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{t('oral.subtitle')}</p>

        {/* Score Display */}
        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">{t('oral.calculatedScore')}:</span>
            <span className="text-3xl font-bold text-blue-600">{score} / 60</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{t('oral.scoreExplanation')}</p>
        </div>
      </div>

      {/* Assessment Date and Duration */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('oral.recordedDate')}
          </label>
          <input
            type="date"
            value={oralFeedback.recordedDate || ''}
            onChange={(e) => updateGeneralField('recordedDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('oral.duration')} ({t('oral.minutes')})
          </label>
          <input
            type="number"
            min="0"
            step="5"
            value={oralFeedback.duration || ''}
            onChange={(e) => updateGeneralField('duration', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="15"
          />
        </div>
      </div>

      {/* LK20 Assessment Dimensions */}
      <div className="space-y-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          {t('oral.dimensionsTitle')}
        </h3>

        {DIMENSIONS.map((dimensionType) => {
          const dimension = getDimension(dimensionType);
          const info = getDimensionInfo(dimensionType);

          return (
            <div key={dimensionType} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{info.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <label className="text-sm text-gray-600">{t('oral.points')}:</label>
                    <select
                      value={dimension.points}
                      onChange={(e) => updateDimension(dimensionType, { points: Number(e.target.value) })}
                      className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600">/ 6</span>
                  </div>
                </div>

                {/* Rubric Guide */}
                <details className="mt-2 text-xs text-gray-600">
                  <summary className="cursor-pointer hover:text-blue-600">{t('oral.rubricGuide')}</summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-300">
                    <div><strong>2 {t('oral.points')}:</strong> {info.rubric2}</div>
                    <div><strong>4 {t('oral.points')}:</strong> {info.rubric4}</div>
                    <div><strong>6 {t('oral.points')}:</strong> {info.rubric6}</div>
                  </div>
                </details>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('oral.dimensionComment')}
                </label>
                <textarea
                  value={dimension.comment}
                  onChange={(e) => updateDimension(dimensionType, { comment: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder={t('oral.dimensionCommentPlaceholder')}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* General Observations */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('oral.generalObservations')}
        </label>
        <textarea
          value={oralFeedback.generalObservations}
          onChange={(e) => updateGeneralField('generalObservations', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('oral.generalObservationsPlaceholder')}
        />
      </div>

      {/* Task References */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('oral.taskReferences')}
        </label>
        <input
          type="text"
          value={oralFeedback.taskReferences?.join(', ') || ''}
          onChange={(e) => {
            const refs = e.target.value.split(',').map(r => r.trim()).filter(r => r);
            updateGeneralField('taskReferences', refs.length > 0 ? refs : undefined);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('oral.taskReferencesPlaceholder')}
        />
        <p className="text-xs text-gray-500 mt-1">{t('oral.taskReferencesHelp')}</p>
      </div>

      {/* Completion Status Info */}
      {oralFeedback.completedDate && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            {t('oral.completedOn')}: {new Date(oralFeedback.completedDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
