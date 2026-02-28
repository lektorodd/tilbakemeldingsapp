'use client';

import React, { useRef } from 'react';
import { ProjectFeedbackData, ProjectCriterionDef, ProjectCriterionScore } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImagePlus, X, Video, FileText } from 'lucide-react';

interface ProjectFeedbackFormProps {
    feedback: ProjectFeedbackData;
    criteria: ProjectCriterionDef[];
    onFeedbackChange: (feedback: ProjectFeedbackData) => void;
    studentName?: string;
}

type AchievementLevel = 'low' | 'medium' | 'high' | null;

function getAchievementLevel(points: number): AchievementLevel {
    if (points >= 5) return 'high';
    if (points >= 3) return 'medium';
    if (points >= 1) return 'low';
    return null;
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

    const handleLevelClick = (criterionId: string, level: AchievementLevel) => {
        const scoreMap = { low: 2, medium: 4, high: 6 };
        if (level) {
            updateCriterion(criterionId, { points: scoreMap[level] });
        }
    };

    // Check if any criterion has rubric descriptions
    const hasRubrics = criteria.some(c => c.rubricLow || c.rubricMedium || c.rubricHigh);

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

            {/* Criteria Matrix */}
            <div className="space-y-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                    {t('project.criteriaTitle')}
                </h3>

                {/* Rubric Header (only if rubrics defined) */}
                {hasRubrics && (
                    <div className="hidden md:grid md:grid-cols-[1fr,1fr,1fr,1fr] gap-2 text-xs font-semibold text-text-secondary px-4">
                        <div></div>
                        <div className="text-center">{t('project.rubricLow')} (2)</div>
                        <div className="text-center">{t('project.rubricMedium')} (3–4)</div>
                        <div className="text-center">{t('project.rubricHigh')} (5–6)</div>
                    </div>
                )}

                {criteria.map((criterionDef) => {
                    const criterion = getCriterion(criterionDef.id);
                    const currentLevel = getAchievementLevel(criterion.points);
                    const hasThisRubric = criterionDef.rubricLow || criterionDef.rubricMedium || criterionDef.rubricHigh;

                    return (
                        <div key={criterionDef.id} className="border border-border rounded-lg bg-surface-alt overflow-hidden">
                            {/* Criterion Header + Rubric Matrix */}
                            {hasThisRubric ? (
                                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,1fr] gap-0">
                                    {/* Criterion Name Cell */}
                                    <div className="p-4 border-b md:border-b-0 md:border-r border-border">
                                        <h4 className="font-semibold text-text-primary">{criterionDef.name}</h4>
                                        {criterionDef.description && (
                                            <p className="text-xs text-text-secondary mt-1">{criterionDef.description}</p>
                                        )}
                                        {/* Weight + Fine-tune buttons */}
                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
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
                                            <div className="flex gap-0.5">
                                                {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => updateCriterion(criterionDef.id, { points: p })}
                                                        className={`w-6 h-6 rounded text-xs font-semibold transition-all ${criterion.points === p
                                                            ? 'bg-amber-600 text-white shadow-sm scale-110'
                                                            : 'bg-surface border border-border text-text-disabled hover:border-amber-400'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Låg Cell */}
                                    <button
                                        type="button"
                                        onClick={() => handleLevelClick(criterionDef.id, 'low')}
                                        className={`p-3 text-left text-sm border-b md:border-b-0 md:border-r border-border transition-all cursor-pointer hover:bg-red-50 ${currentLevel === 'low'
                                                ? 'bg-red-100 border-l-4 md:border-l-0 md:border-t-4 border-l-red-500 md:border-t-red-500 ring-2 ring-red-300 ring-inset'
                                                : ''
                                            }`}
                                    >
                                        <div className="md:hidden text-xs font-semibold text-red-700 mb-1">{t('project.rubricLow')} (2)</div>
                                        <p className="text-text-secondary text-xs leading-relaxed">{criterionDef.rubricLow || '—'}</p>
                                    </button>

                                    {/* Middels Cell */}
                                    <button
                                        type="button"
                                        onClick={() => handleLevelClick(criterionDef.id, 'medium')}
                                        className={`p-3 text-left text-sm border-b md:border-b-0 md:border-r border-border transition-all cursor-pointer hover:bg-yellow-50 ${currentLevel === 'medium'
                                                ? 'bg-yellow-100 border-l-4 md:border-l-0 md:border-t-4 border-l-yellow-500 md:border-t-yellow-500 ring-2 ring-yellow-300 ring-inset'
                                                : ''
                                            }`}
                                    >
                                        <div className="md:hidden text-xs font-semibold text-yellow-700 mb-1">{t('project.rubricMedium')} (3–4)</div>
                                        <p className="text-text-secondary text-xs leading-relaxed">{criterionDef.rubricMedium || '—'}</p>
                                    </button>

                                    {/* Høg Cell */}
                                    <button
                                        type="button"
                                        onClick={() => handleLevelClick(criterionDef.id, 'high')}
                                        className={`p-3 text-left text-sm transition-all cursor-pointer hover:bg-green-50 ${currentLevel === 'high'
                                                ? 'bg-green-100 border-l-4 md:border-l-0 md:border-t-4 border-l-green-500 md:border-t-green-500 ring-2 ring-green-300 ring-inset'
                                                : ''
                                            }`}
                                    >
                                        <div className="md:hidden text-xs font-semibold text-green-700 mb-1">{t('project.rubricHigh')} (5–6)</div>
                                        <p className="text-text-secondary text-xs leading-relaxed">{criterionDef.rubricHigh || '—'}</p>
                                    </button>
                                </div>
                            ) : (
                                /* Fallback: no rubrics, simple layout like before */
                                <div className="p-4">
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
                            )}

                            {/* Comment + Images (always shown below the matrix/header) */}
                            <div className="p-4 pt-0">
                                {/* Comment */}
                                <div className="mb-3 mt-3">
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
                        </div>
                    );
                })}
            </div>

            {/* Dual Comment Sections */}
            <div className="space-y-4 mb-6">
                {/* Video/Presentation Comment */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <Video size={16} className="text-amber-600" />
                        {t('project.videoComment')}
                    </label>
                    <textarea
                        value={feedback.videoComment}
                        onChange={(e) => onFeedbackChange({ ...feedback, videoComment: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                        placeholder={t('project.videoCommentPlaceholder')}
                    />
                </div>

                {/* Reflection Notes Comment */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1">
                        <FileText size={16} className="text-amber-600" />
                        {t('project.reflectionComment')}
                    </label>
                    <textarea
                        value={feedback.reflectionComment}
                        onChange={(e) => onFeedbackChange({ ...feedback, reflectionComment: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                        placeholder={t('project.reflectionCommentPlaceholder')}
                    />
                </div>
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
