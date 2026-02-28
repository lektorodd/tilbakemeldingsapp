'use client';

import React, { useRef } from 'react';
import { ProjectFeedbackData, ProjectCriterionDef, ProjectCriterionScore } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImagePlus, X } from 'lucide-react';

interface ProjectFeedbackFormProps {
    feedback: ProjectFeedbackData;
    criteria: ProjectCriterionDef[];
    onFeedbackChange: (feedback: ProjectFeedbackData) => void;
    studentName?: string;
}

export default function ProjectFeedbackForm({
    feedback,
    criteria,
    onFeedbackChange,
    studentName,
}: ProjectFeedbackFormProps) {
    const { t } = useLanguage();

    // Calculate score from criteria (0-60 scale) using weighted average
    const calculateScore = () => {
        if (feedback.criterionScores.length === 0) return 0;
        let totalWeighted = 0;
        let totalWeight = 0;
        feedback.criterionScores.forEach(cs => {
            const w = cs.weight ?? 1;
            totalWeighted += cs.points * w;
            totalWeight += w;
        });
        if (totalWeight === 0) return 0;
        const averagePoints = totalWeighted / totalWeight;
        return Math.round(averagePoints * 10);
    };

    const getCriterion = (criterionId: string): ProjectCriterionScore => {
        const existing = feedback.criterionScores.find(cs => cs.criterionId === criterionId);
        return existing || { criterionId, points: 0, comment: '', images: [] };
    };

    const updateCriterion = (criterionId: string, updates: Partial<ProjectCriterionScore>) => {
        const existingIndex = feedback.criterionScores.findIndex(cs => cs.criterionId === criterionId);

        let newScores: ProjectCriterionScore[];
        if (existingIndex >= 0) {
            newScores = [...feedback.criterionScores];
            newScores[existingIndex] = { ...newScores[existingIndex], ...updates };
        } else {
            newScores = [
                ...feedback.criterionScores,
                { criterionId, points: 0, comment: '', images: [], ...updates },
            ];
        }

        onFeedbackChange({
            ...feedback,
            criterionScores: newScores,
            score: calculateScore(),
        });
    };

    const handleImageUpload = async (criterionId: string, file: File) => {
        const maxWidth = 800;
        const maxHeight = 600;
        const quality = 0.7;

        return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const criterion = getCriterion(criterionId);
                    const currentImages = criterion.images || [];
                    updateCriterion(criterionId, { images: [...currentImages, dataUrl] });
                    resolve();
                };
                img.src = e.target!.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (criterionId: string, imageIndex: number) => {
        const criterion = getCriterion(criterionId);
        const newImages = (criterion.images || []).filter((_, i) => i !== imageIndex);
        updateCriterion(criterionId, { images: newImages });
    };

    const score = calculateScore();

    return (
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
            <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-text-primary">
                    {t('project.assessment')}
                    {studentName && <span className="text-amber-600"> - {studentName}</span>}
                </h2>
                <p className="text-sm text-text-secondary mt-1">{t('project.assessmentSubtitle')}</p>

                {/* Score Display */}
                <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{t('project.calculatedScore')}:</span>
                        <span className="text-3xl font-display font-bold text-amber-700">{score} / 60</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{t('project.scoreExplanation')}</p>
                </div>
            </div>

            {/* Assessment Criteria */}
            <div className="space-y-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                    {t('project.criteriaTitle')}
                </h3>

                {criteria.map((criterionDef) => {
                    const criterion = getCriterion(criterionDef.id);

                    return (
                        <div key={criterionDef.id} className="border border-border rounded-lg p-4 bg-surface-alt">
                            <div className="mb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-text-primary">{criterionDef.name}</h4>
                                        {criterionDef.description && (
                                            <p className="text-sm text-text-secondary mt-1">{criterionDef.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <div className="flex items-center gap-1">
                                            <label className="text-xs text-text-disabled" title={t('project.weightTooltip')}>{t('project.weight')}:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={criterion.weight ?? 1}
                                                onChange={(e) => updateCriterion(criterionDef.id, { weight: Math.max(1, Number(e.target.value) || 1) })}
                                                className="w-12 px-1 py-0.5 border border-border rounded text-center text-xs focus:outline-none focus:ring-1 focus:ring-focus text-text-primary bg-surface"
                                            />
                                        </div>
                                        <label className="text-sm text-text-secondary">{t('project.points')}:</label>
                                        <div className="flex gap-1">
                                            {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => updateCriterion(criterionDef.id, { points: p })}
                                                    className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all ${criterion.points === p
                                                        ? 'bg-amber-600 text-white shadow-md scale-110'
                                                        : 'bg-surface border border-border text-text-secondary hover:bg-amber-50 hover:border-amber-400'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm text-text-secondary">/ 6</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    {t('project.criterionComment')}
                                </label>
                                <textarea
                                    value={criterion.comment}
                                    onChange={(e) => updateCriterion(criterionDef.id, { comment: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-sm text-text-primary"
                                    placeholder={t('project.criterionCommentPlaceholder')}
                                />
                            </div>

                            {/* Image Attachments */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm font-medium text-text-secondary">
                                        {t('project.screenshots')}
                                    </label>
                                    <ImageUploadButton
                                        onUpload={(file) => handleImageUpload(criterionDef.id, file)}
                                    />
                                </div>
                                {criterion.images && criterion.images.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {criterion.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    className="w-32 h-24 object-cover rounded-lg border border-border cursor-pointer hover:border-amber-400 transition"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                                <button
                                                    onClick={() => removeImage(criterionDef.id, idx)}
                                                    className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* General Comment */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('project.generalComment')}
                </label>
                <textarea
                    value={feedback.generalComment}
                    onChange={(e) => onFeedbackChange({ ...feedback, generalComment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                    placeholder={t('project.generalCommentPlaceholder')}
                />
            </div>

            {/* Completion Status */}
            {feedback.completedDate && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-800">
                        {t('project.completedOn')}: {new Date(feedback.completedDate).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
}

// Image upload button component
function ImageUploadButton({ onUpload }: { onUpload: (file: File) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        onUpload(file);
                        e.target.value = '';
                    }
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-surface border border-border rounded-lg hover:bg-amber-50 hover:border-amber-400 transition text-text-secondary"
            >
                <ImagePlus size={14} />
                {t('project.addScreenshot')}
            </button>
        </>
    );
}
