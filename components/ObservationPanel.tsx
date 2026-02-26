'use client';

import { useState } from 'react';
import { CourseStudent, ClassroomObservation, ObservationType } from '@/types';
import { Eye, Plus, Trash2, Star, Wrench, StickyNote, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ObservationPanelProps {
    courseId: string;
    students: CourseStudent[];
    observations: ClassroomObservation[];
    availableLabels: string[];
    onAddObservation: (observation: {
        studentId: string;
        text: string;
        type: ObservationType;
        labels?: string[];
        date: string;
    }) => void;
    onDeleteObservation: (observationId: string) => void;
}

const TYPE_CONFIG: Record<ObservationType, { icon: typeof Star; colorClass: string; bgClass: string }> = {
    positive: { icon: Star, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 text-emerald-700' },
    constructive: { icon: Wrench, colorClass: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-700' },
    note: { icon: StickyNote, colorClass: 'text-slate-500', bgClass: 'bg-slate-100 text-slate-600' },
};

export default function ObservationPanel({
    courseId,
    students,
    observations,
    availableLabels,
    onAddObservation,
    onDeleteObservation,
}: ObservationPanelProps) {
    const { t } = useLanguage();

    // Quick-add form state
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [text, setText] = useState('');
    const [type, setType] = useState<ObservationType>('positive');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showLabels, setShowLabels] = useState(false);

    // Filter state
    const [filterStudentId, setFilterStudentId] = useState('');

    const handleSubmit = () => {
        if (!selectedStudentId || !text.trim()) return;

        onAddObservation({
            studentId: selectedStudentId,
            text: text.trim(),
            type,
            labels: selectedLabels.length > 0 ? selectedLabels : undefined,
            date: new Date().toISOString().split('T')[0],
        });

        // Reset form but keep student selected for quick follow-up
        setText('');
        setType('positive');
        setSelectedLabels([]);
        setShowLabels(false);
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    const filteredObservations = filterStudentId
        ? observations.filter(o => o.studentId === filterStudentId)
        : observations;

    const getStudentName = (studentId: string) => {
        return students.find(s => s.id === studentId)?.name || '?';
    };

    return (
        <div className="bg-surface rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Eye size={24} className="text-emerald-600" />
                    <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.observations')}</h2>
                    <span className="text-text-secondary">({observations.length})</span>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                    <Plus size={16} />
                    {t('course.addObservation')}
                </button>
            </div>

            {/* Quick-add form */}
            {showForm && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 mb-4 space-y-3">
                    {/* Student selector */}
                    <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">{t('test.selectStudent')}</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    {/* Observation text */}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder={t('course.observationPlaceholder')}
                    />

                    {/* Type selector */}
                    <div className="flex gap-2">
                        {(Object.keys(TYPE_CONFIG) as ObservationType[]).map(obsType => {
                            const config = TYPE_CONFIG[obsType];
                            const Icon = config.icon;
                            const isSelected = type === obsType;
                            return (
                                <button
                                    key={obsType}
                                    onClick={() => setType(obsType)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                            ? `${config.bgClass} ring-2 ring-offset-1 ring-current`
                                            : 'bg-surface-alt text-text-secondary hover:bg-border'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {t(`course.observationType${obsType.charAt(0).toUpperCase() + obsType.slice(1)}`)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional labels */}
                    {availableLabels.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowLabels(!showLabels)}
                                className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <ChevronDown size={14} className={`transition-transform ${showLabels ? 'rotate-180' : ''}`} />
                                {t('course.themeLabels')} ({selectedLabels.length})
                            </button>
                            {showLabels && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {availableLabels.map(label => (
                                        <button
                                            key={label}
                                            onClick={() => toggleLabel(label)}
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${selectedLabels.includes(label)
                                                    ? 'bg-brand text-white'
                                                    : 'bg-surface-alt text-text-secondary hover:bg-border'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => { setShowForm(false); setText(''); setSelectedStudentId(''); }}
                            className="px-3 py-1.5 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition text-sm"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedStudentId || !text.trim()}
                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {t('common.add')}
                        </button>
                    </div>
                </div>
            )}

            {/* Filter by student */}
            {observations.length > 0 && (
                <div className="mb-3">
                    <select
                        value={filterStudentId}
                        onChange={(e) => setFilterStudentId(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">{t('course.allStudents')}</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Observations list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredObservations.length === 0 ? (
                    <p className="text-sm text-text-disabled text-center py-6">
                        {observations.length === 0 ? t('course.noObservationsYet') : t('course.noObservationsYet')}
                    </p>
                ) : (
                    filteredObservations.slice(0, 15).map(obs => {
                        const config = TYPE_CONFIG[obs.type];
                        const Icon = config.icon;
                        return (
                            <div
                                key={obs.id}
                                className="flex items-start gap-3 border border-border rounded-lg px-3 py-2.5 hover:bg-background transition-colors group"
                            >
                                {/* Type icon */}
                                <div className={`mt-0.5 ${config.colorClass}`}>
                                    <Icon size={16} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-sm text-text-primary">
                                            {getStudentName(obs.studentId)}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.bgClass}`}>
                                            {t(`course.observationType${obs.type.charAt(0).toUpperCase() + obs.type.slice(1)}`)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">{obs.text}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-text-disabled">
                                            {new Date(obs.date).toLocaleDateString('nb-NO')}
                                        </span>
                                        {obs.labels && obs.labels.length > 0 && (
                                            <div className="flex gap-1">
                                                {obs.labels.map(label => (
                                                    <span key={label} className="px-1.5 py-0.5 bg-surface-alt text-text-secondary rounded text-xs">
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => onDeleteObservation(obs.id)}
                                    className="p-1 text-danger hover:bg-danger-bg rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
