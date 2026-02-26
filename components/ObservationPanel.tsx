'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { CourseStudent, ClassroomObservation, ObservationType } from '@/types';
import { Eye, X, Trash2, Star, Wrench, StickyNote, ChevronDown, Search } from 'lucide-react';
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

const TYPE_CONFIG: Record<ObservationType, { icon: typeof Star; colorClass: string; bgClass: string; emoji: string }> = {
    positive: { icon: Star, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 text-emerald-700', emoji: '🌟' },
    constructive: { icon: Wrench, colorClass: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-700', emoji: '🔧' },
    note: { icon: StickyNote, colorClass: 'text-slate-500', bgClass: 'bg-slate-100 text-slate-600', emoji: '📝' },
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

    // Slide-out panel state
    const [isOpen, setIsOpen] = useState(false);

    // Quick-add form state
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [text, setText] = useState('');
    const [type, setType] = useState<ObservationType>('positive');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [showLabels, setShowLabels] = useState(false);

    // Filter state
    const [filterStudentId, setFilterStudentId] = useState('');

    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filtered student list for search
    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const q = studentSearch.toLowerCase();
        return students.filter(s => s.name.toLowerCase().includes(q));
    }, [students, studentSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowStudentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when panel opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const selectStudent = (student: CourseStudent) => {
        setSelectedStudentId(student.id);
        setStudentSearch(student.name);
        setShowStudentDropdown(false);
    };

    const handleSubmit = () => {
        if (!selectedStudentId || !text.trim()) return;

        onAddObservation({
            studentId: selectedStudentId,
            text: text.trim(),
            type,
            labels: selectedLabels.length > 0 ? selectedLabels : undefined,
            date: new Date().toISOString().split('T')[0],
        });

        // Reset text but keep student for quick follow-up
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
        <>
            {/* Floating Action Button — always visible */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                title={t('course.addObservation')}
            >
                <Eye size={20} />
                <span className="font-medium text-sm">{t('course.observations')}</span>
                {observations.length > 0 && (
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {observations.length}
                    </span>
                )}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out panel from right */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 transform transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Eye size={22} className="text-emerald-600" />
                            <h2 className="text-lg font-display font-bold text-text-primary">{t('course.observations')}</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-surface-alt text-text-secondary transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Quick-add form — always visible at top */}
                    <div className="px-5 py-4 border-b border-border bg-emerald-50 space-y-3">
                        {/* Searchable student picker */}
                        <div ref={dropdownRef} className="relative">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => {
                                        setStudentSearch(e.target.value);
                                        setShowStudentDropdown(true);
                                        if (!e.target.value) setSelectedStudentId('');
                                    }}
                                    onFocus={() => setShowStudentDropdown(true)}
                                    placeholder={t('test.selectStudent')}
                                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    autoComplete="off"
                                />
                            </div>
                            {showStudentDropdown && filteredStudents.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                    {filteredStudents.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => selectStudent(s)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors ${s.id === selectedStudentId ? 'bg-emerald-100 font-medium text-emerald-700' : 'text-text-primary'
                                                }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Observation text */}
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            placeholder={t('course.observationPlaceholder')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleSubmit();
                                }
                            }}
                        />

                        {/* Type + labels + submit row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {(Object.keys(TYPE_CONFIG) as ObservationType[]).map(obsType => {
                                const config = TYPE_CONFIG[obsType];
                                const isSelected = type === obsType;
                                return (
                                    <button
                                        key={obsType}
                                        onClick={() => setType(obsType)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isSelected
                                                ? `${config.bgClass} ring-2 ring-offset-1 ring-current`
                                                : 'bg-surface text-text-secondary hover:bg-border'
                                            }`}
                                    >
                                        <span>{config.emoji}</span>
                                        {t(`course.observationType${obsType.charAt(0).toUpperCase() + obsType.slice(1)}`)}
                                    </button>
                                );
                            })}

                            <div className="flex-1" />

                            <button
                                onClick={handleSubmit}
                                disabled={!selectedStudentId || !text.trim()}
                                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {t('common.add')}
                            </button>
                        </div>

                        {/* Optional labels (collapsed) */}
                        {availableLabels.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowLabels(!showLabels)}
                                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <ChevronDown size={14} className={`transition-transform ${showLabels ? 'rotate-180' : ''}`} />
                                    {t('course.themeLabels')} {selectedLabels.length > 0 && `(${selectedLabels.length})`}
                                </button>
                                {showLabels && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {availableLabels.map(label => (
                                            <button
                                                key={label}
                                                onClick={() => toggleLabel(label)}
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${selectedLabels.includes(label)
                                                        ? 'bg-brand text-white'
                                                        : 'bg-surface text-text-secondary hover:bg-border'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter bar */}
                    {observations.length > 0 && (
                        <div className="px-5 py-2 border-b border-border">
                            <select
                                value={filterStudentId}
                                onChange={(e) => setFilterStudentId(e.target.value)}
                                className="w-full px-3 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">{t('course.allStudents')} ({observations.length})</option>
                                {students.map(s => {
                                    const count = observations.filter(o => o.studentId === s.id).length;
                                    return count > 0 ? (
                                        <option key={s.id} value={s.id}>{s.name} ({count})</option>
                                    ) : null;
                                })}
                            </select>
                        </div>
                    )}

                    {/* Observations list — scrollable */}
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                        {filteredObservations.length === 0 ? (
                            <p className="text-sm text-text-disabled text-center py-8">
                                {t('course.noObservationsYet')}
                            </p>
                        ) : (
                            filteredObservations.map(obs => {
                                const config = TYPE_CONFIG[obs.type];
                                return (
                                    <div
                                        key={obs.id}
                                        className="flex items-start gap-2.5 border border-border rounded-lg px-3 py-2.5 hover:bg-background transition-colors group"
                                    >
                                        <span className="text-base mt-0.5">{config.emoji}</span>
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
            </div>
        </>
    );
}
