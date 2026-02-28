'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, CourseProject, ProjectFeedbackData, ClassroomObservation } from '@/types';
import {
    loadCourse,
    updateProjectFeedback,
    getProjectFeedback,
    calculateProjectScore,
    flushPendingSave,
} from '@/utils/storage';
import { ArrowLeft, Check, Save, ChevronLeft, ChevronRight, Undo2, Eye, Star, Wrench, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import ProjectFeedbackForm from '@/components/ProjectFeedbackForm';
import RadarChart from '@/components/RadarChart';

const OBS_EMOJI: Record<string, string> = { positive: '🌟', constructive: '🔧', note: '📝' };

export default function ProjectAssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = params.courseId as string;
    const projectId = params.projectId as string;
    const { t } = useLanguage();
    const { toast, confirm } = useNotification();

    const [course, setCourse] = useState<Course | null>(null);
    const [project, setProject] = useState<CourseProject | null>(null);
    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
    const [feedback, setFeedback] = useState<ProjectFeedbackData | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load data
    const loadData = () => {
        const courseData = loadCourse(courseId);
        if (!courseData) {
            toast(t('common.error'), 'error');
            router.push('/courses');
            return;
        }
        setCourse(courseData);

        const projectData = courseData.projects?.find(p => p.id === projectId);
        if (!projectData) {
            toast(t('common.error'), 'error');
            router.push(`/course/${courseId}`);
            return;
        }
        setProject(projectData);

        // Check for student query param
        const studentParam = searchParams.get('student');
        if (studentParam && courseData.students.length > 0) {
            const idx = courseData.students.findIndex(s => s.id === studentParam);
            if (idx >= 0) setCurrentStudentIndex(idx);
        }
    };

    useEffect(() => {
        loadData();
        return () => flushPendingSave();
    }, [courseId, projectId]);

    // Load feedback when student changes
    useEffect(() => {
        if (!course || !project || course.students.length === 0) return;
        const student = course.students[currentStudentIndex];
        if (!student) return;

        const existingFeedback = getProjectFeedback(courseId, projectId, student.id);
        if (existingFeedback) {
            setFeedback(existingFeedback);
        } else {
            setFeedback({
                studentId: student.id,
                criterionScores: project.criteria.map(c => ({
                    criterionId: c.id,
                    points: 0,
                    comment: '',
                    images: [],
                })),
                videoComment: '',
                reflectionComment: '',
            });
        }
        setHasUnsavedChanges(false);
    }, [currentStudentIndex, course, project]);

    const handleFeedbackChange = (updatedFeedback: ProjectFeedbackData) => {
        setFeedback(updatedFeedback);
        setHasUnsavedChanges(true);

        // Auto-save via debounced storage
        if (course && course.students[currentStudentIndex]) {
            updateProjectFeedback(courseId, projectId, course.students[currentStudentIndex].id, updatedFeedback);
        }
    };

    const handleSave = () => {
        if (!feedback || !course) return;
        const student = course.students[currentStudentIndex];
        if (!student) return;

        const score = calculateProjectScore(feedback);
        updateProjectFeedback(courseId, projectId, student.id, { ...feedback, score });
        flushPendingSave();
        setHasUnsavedChanges(false);
        toast(t('project.saved'), 'success');
        loadData();
    };

    const handleMarkComplete = () => {
        if (!feedback || !course) return;
        const student = course.students[currentStudentIndex];
        if (!student) return;

        const score = calculateProjectScore(feedback);
        updateProjectFeedback(courseId, projectId, student.id, {
            ...feedback,
            score,
            completedDate: new Date().toISOString(),
        });
        flushPendingSave();
        setHasUnsavedChanges(false);
        toast(t('project.markedComplete'), 'success');
        loadData();
    };

    const handleUnmarkComplete = async () => {
        if (!feedback || !course) return;
        const confirmed = await confirm(t('project.unmarkCompleteConfirm'));
        if (!confirmed) return;

        const student = course.students[currentStudentIndex];
        if (!student) return;

        updateProjectFeedback(courseId, projectId, student.id, {
            ...feedback,
            completedDate: undefined,
        });
        flushPendingSave();
        setHasUnsavedChanges(false);
        toast(t('project.unmarkedComplete'), 'success');
        loadData();
    };

    const isStudentCompleted = (studentId: string): boolean => {
        const fb = project?.studentFeedbacks.find(f => f.studentId === studentId);
        return !!fb?.completedDate;
    };

    if (!course || !project) {
        return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
    }

    const currentStudent = course.students[currentStudentIndex];
    const radarData = feedback?.criterionScores.map(cs => {
        const def = project.criteria.find(c => c.id === cs.criterionId);
        return {
            label: def?.name || cs.criterionId,
            value: cs.points,
        };
    }) || [];

    // Get observations linked to this project for the current student
    const projectObservations: ClassroomObservation[] = currentStudent
        ? (course.observations || [])
            .filter(o => o.projectId === projectId && o.studentId === currentStudent.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];

    return (
        <main className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <nav className="flex items-center gap-1.5 text-sm text-text-secondary mb-2" aria-label="Breadcrumb">
                        <Link href="/courses" className="hover:text-brand transition-colors">{t('common.appName')}</Link>
                        <span className="text-text-disabled">/</span>
                        <Link href={`/course/${courseId}`} className="hover:text-brand transition-colors">{course.name}</Link>
                        <span className="text-text-disabled">/</span>
                        <span className="text-text-primary font-medium">{project.name}</span>
                    </nav>
                    <h1 className="text-3xl font-display font-bold text-text-primary">{project.name}</h1>
                    {project.description && <p className="text-text-secondary">{project.description}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Student Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface rounded-lg shadow-sm p-4 sticky top-4">
                            <h3 className="font-semibold text-text-primary mb-3">{t('course.students')}</h3>
                            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                                {course.students.map((student, index) => {
                                    const completed = isStudentCompleted(student.id);
                                    return (
                                        <button
                                            key={student.id}
                                            onClick={() => {
                                                if (hasUnsavedChanges) handleSave();
                                                setCurrentStudentIndex(index);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${index === currentStudentIndex
                                                ? 'bg-amber-100 text-amber-800 font-medium border border-amber-300'
                                                : 'hover:bg-background text-text-secondary'
                                                }`}
                                        >
                                            <span className="truncate">{student.name}</span>
                                            {completed && <Check size={14} className="text-success flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Prev/Next */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                <button
                                    onClick={() => {
                                        if (hasUnsavedChanges) handleSave();
                                        setCurrentStudentIndex(Math.max(0, currentStudentIndex - 1));
                                    }}
                                    disabled={currentStudentIndex === 0}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition disabled:opacity-30 text-sm"
                                >
                                    <ChevronLeft size={16} />
                                    {t('common.previous')}
                                </button>
                                <button
                                    onClick={() => {
                                        if (hasUnsavedChanges) handleSave();
                                        setCurrentStudentIndex(Math.min(course.students.length - 1, currentStudentIndex + 1));
                                    }}
                                    disabled={currentStudentIndex === course.students.length - 1}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition disabled:opacity-30 text-sm"
                                >
                                    {t('common.next')}
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Radar Chart */}
                            {radarData.length >= 3 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <RadarChart
                                        genericData={radarData}
                                        width={250}
                                        height={220}
                                        color="rgba(217, 119, 6, 0.2)"
                                    />
                                </div>
                            )}

                            {/* Process Timeline — observations linked to this project */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-semibold text-text-primary text-sm flex items-center gap-1.5 mb-2">
                                    <Eye size={14} className="text-emerald-600" />
                                    {t('project.processTimeline')}
                                </h4>
                                {projectObservations.length === 0 ? (
                                    <p className="text-xs text-text-disabled">{t('project.noProcessObservations')}</p>
                                ) : (
                                    <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                                        {projectObservations.map(obs => (
                                            <div key={obs.id} className="text-xs border border-border rounded-lg p-2 bg-background">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span>{OBS_EMOJI[obs.type] || '📝'}</span>
                                                    <span className="text-text-disabled">
                                                        {new Date(obs.date).toLocaleDateString('nb-NO')}
                                                    </span>
                                                </div>
                                                <p className="text-text-secondary leading-relaxed">{obs.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {currentStudent && feedback && (
                            <>
                                <ProjectFeedbackForm
                                    feedback={feedback}
                                    criteria={project.criteria}
                                    onFeedbackChange={handleFeedbackChange}
                                    studentName={currentStudent.name}
                                />

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-3 flex-wrap">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                                    >
                                        <Save size={18} />
                                        {t('common.save')}
                                    </button>

                                    {feedback.completedDate ? (
                                        <button
                                            onClick={handleUnmarkComplete}
                                            className="flex items-center gap-2 px-4 py-2 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition-colors"
                                        >
                                            <Undo2 size={18} />
                                            {t('project.unmarkComplete')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleMarkComplete}
                                            className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            <Check size={18} />
                                            {t('project.markComplete')}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
