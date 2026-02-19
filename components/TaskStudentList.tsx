'use client';

import { useEffect, useRef } from 'react';
import { CourseStudent, TaskFeedback } from '@/types';
import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskStudentListProps {
  students: CourseStudent[];
  taskLabel: string;
  taskId: string;
  subtaskId?: string;
  feedbackMap: Map<string, TaskFeedback>;
  completedStudents: Set<string>;
  activeStudentIndex: number;
  onUpdateFeedback: (studentId: string, updates: Partial<TaskFeedback>) => void;
  onSetActiveStudent: (index: number) => void;
  textareaRefs: React.MutableRefObject<Map<string, HTMLTextAreaElement>>;
}

export default function TaskStudentList({
  students,
  taskLabel,
  taskId,
  subtaskId,
  feedbackMap,
  completedStudents,
  activeStudentIndex,
  onUpdateFeedback,
  onSetActiveStudent,
  textareaRefs,
}: TaskStudentListProps) {
  const { t } = useLanguage();
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll active row into view
  useEffect(() => {
    const activeRow = rowRefs.current.get(activeStudentIndex);
    if (activeRow) {
      activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeStudentIndex]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {t('test.task')} {taskLabel}
        </h3>
        <span className="text-sm text-text-secondary">
          {students.length} {t('test.students').toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {students.map((student, index) => {
          const feedback = feedbackMap.get(student.id) || {
            taskId,
            subtaskId,
            points: null,
            comment: '',
          };
          const isActive = index === activeStudentIndex;
          const isCompleted = completedStudents.has(student.id);

          return (
            <div
              key={student.id}
              ref={(el) => {
                if (el) rowRefs.current.set(index, el);
              }}
              onClick={() => onSetActiveStudent(index)}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${isActive
                ? 'border-brand bg-primary-50 ring-2 ring-brand/30'
                : 'border-border bg-surface-alt hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle size={16} className="text-success" />
                    ) : (
                      <Circle size={16} className="text-text-disabled" />
                    )}
                    <span className="font-medium text-text-primary">{student.name}</span>
                  </div>
                  {student.studentNumber && (
                    <span className="text-xs text-text-secondary">#{student.studentNumber}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-text-secondary">
                  {feedback.points ?? 0} / 6
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetActiveStudent(index);
                          onUpdateFeedback(student.id, { points: p });
                        }}
                        className={`w-9 h-9 rounded-lg font-semibold transition-all ${feedback.points === p
                          ? 'bg-brand text-white shadow-md scale-110'
                          : 'bg-surface border border-border text-text-secondary hover:bg-primary-50 hover:border-brand'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('test.commentLabel')}
                </label>
                <textarea
                  ref={(el) => {
                    if (el) textareaRefs.current.set(student.id, el);
                  }}
                  value={feedback.comment}
                  onChange={(e) => onUpdateFeedback(student.id, { comment: e.target.value })}
                  onFocus={() => onSetActiveStudent(index)}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                  placeholder={t('test.commentPlaceholder1')}
                />
              </div>
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 text-text-disabled">
          {t('test.noStudentsInCourse')}
        </div>
      )}
    </div>
  );
}
