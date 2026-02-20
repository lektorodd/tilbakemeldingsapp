'use client';

import React from 'react';
import { CourseStudent, CourseTest, Task, Subtask } from '@/types';
import { getStudentFeedback, calculateStudentScore } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle } from 'lucide-react';

interface ProgressGridProps {
    courseId: string;
    test: CourseTest;
    students: CourseStudent[];
    selectedStudentId?: string;
    onSelectStudent: (student: CourseStudent) => void;
}

interface TaskSlot {
    taskId: string;
    subtaskId: string | undefined;
    label: string;
}

const MAX_POINTS = 6; // per slot

export default function ProgressGrid({
    courseId,
    test,
    students,
    selectedStudentId,
    onSelectStudent,
}: ProgressGridProps) {
    const { t } = useLanguage();

    if (students.length === 0 || test.tasks.length === 0) return null;

    // Build flat task/subtask slots for columns
    const slots: TaskSlot[] = [];
    for (const task of test.tasks) {
        if (task.hasSubtasks && task.subtasks.length > 0) {
            for (const st of task.subtasks) {
                slots.push({ taskId: task.id, subtaskId: st.id, label: `${task.label}${st.label}` });
            }
        } else {
            slots.push({ taskId: task.id, subtaskId: undefined, label: task.label });
        }
    }

    return (
        <div className="bg-surface rounded-lg shadow-sm border border-border mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">{t('test.progressGrid')}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-surface-alt">
                            <th className="text-left px-3 py-2 text-text-secondary font-medium whitespace-nowrap min-w-[120px]">
                                {t('test.student')}
                            </th>
                            {slots.map((slot, i) => (
                                <th
                                    key={i}
                                    className="text-center px-1.5 py-2 text-text-secondary font-medium whitespace-nowrap"
                                    title={slot.label}
                                >
                                    {slot.label}
                                </th>
                            ))}
                            <th className="text-center px-3 py-2 text-text-secondary font-medium whitespace-nowrap">
                                {t('test.total')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            const feedback = getStudentFeedback(courseId, test.id, student.id);
                            const isAbsent = !!feedback?.absent;
                            const isCompleted = !!feedback?.completedDate;
                            const totalScore = feedback
                                ? calculateStudentScore(test.tasks, feedback.taskFeedbacks)
                                : 0;
                            const isSelected = student.id === selectedStudentId;

                            return (
                                <tr
                                    key={student.id}
                                    className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-surface-alt ${isSelected ? 'bg-rose-50 hover:bg-rose-100' : ''
                                        } ${isAbsent ? 'opacity-50' : ''}`}
                                    onClick={() => onSelectStudent(student)}
                                >
                                    <td className="px-3 py-1.5 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`font-medium ${isAbsent ? 'line-through text-text-disabled' : isSelected ? 'text-brand' : 'text-text-primary'}`}>
                                                {student.name}
                                            </span>
                                            {isAbsent && <span className="text-[10px] bg-surface-alt text-text-disabled px-1.5 py-0.5 rounded">{t('test.absent')}</span>}
                                            {isCompleted && !isAbsent && <CheckCircle size={12} className="text-success flex-shrink-0" />}
                                        </div>
                                    </td>
                                    {isAbsent ? (
                                        <td colSpan={slots.length} className="text-center px-1 py-1">
                                            <span className="text-[10px] text-text-disabled italic">{t('test.absent')}</span>
                                        </td>
                                    ) : (
                                        slots.map((slot, i) => {
                                            const fb = feedback?.taskFeedbacks.find(
                                                f => f.taskId === slot.taskId && f.subtaskId === slot.subtaskId
                                            );
                                            const points = fb?.points ?? null;
                                            const hasComment = !!fb?.comment?.trim();
                                            const isGraded = points !== null || hasComment;
                                            const displayPoints = points ?? 0;

                                            // Color based on score (0-6 scale)
                                            let cellColor = 'bg-surface-alt text-text-disabled'; // not graded
                                            if (isGraded) {
                                                const ratio = displayPoints / MAX_POINTS;
                                                if (ratio >= 0.83) cellColor = 'bg-emerald-100 text-emerald-700';       // 5-6
                                                else if (ratio >= 0.5) cellColor = 'bg-amber-100 text-amber-700';        // 3-4
                                                else if (ratio > 0) cellColor = 'bg-danger-bg text-danger';               // 1-2
                                                else cellColor = hasComment ? 'bg-info-bg text-info' : 'bg-danger-bg text-danger'; // 0
                                            }

                                            return (
                                                <td key={i} className="text-center px-1 py-1">
                                                    <div
                                                        className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-semibold ${cellColor}`}
                                                        title={`${slot.label}: ${displayPoints}/${MAX_POINTS}${hasComment ? ' 💬' : ''}`}
                                                    >
                                                        {isGraded ? displayPoints : '·'}
                                                    </div>
                                                </td>
                                            );
                                        })
                                    )}
                                    <td className="text-center px-3 py-1.5">
                                        <span className={`font-semibold tabular-nums ${isAbsent ? 'text-text-disabled' : 'text-text-primary'}`}>
                                            {isAbsent ? '—' : totalScore}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
