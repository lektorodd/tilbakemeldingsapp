'use client';

import { CourseStudent } from '@/types';
import { Plus, Trash2, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentRosterPanelProps {
  courseId: string;
  students: CourseStudent[];
  onAddStudent: () => void;
  onBulkAdd: () => void;
  onDeleteStudent: (studentId: string) => void;
}

export default function StudentRosterPanel({
  courseId,
  students,
  onAddStudent,
  onBulkAdd,
  onDeleteStudent,
}: StudentRosterPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-brand" />
          <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.students')}</h2>
          <span className="text-text-secondary">({students.length})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddStudent}
            className="flex items-center gap-1 px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
          >
            <Plus size={16} />
            {t('common.add')}
          </button>
          <button
            onClick={onBulkAdd}
            className="flex items-center gap-1 px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
          >
            <Users size={16} />
            {t('course.bulkAdd')}
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {students.length === 0 ? (
          <p className="text-sm text-text-disabled text-center py-8">{t('course.noStudentsYet')}</p>
        ) : (
          students.map(student => (
            <div
              key={student.id}
              className="flex items-center justify-between border border-border rounded-lg px-3 py-2 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="font-medium text-text-primary text-sm truncate">{student.name}</h4>
                {student.studentNumber && (
                  <span className="text-xs text-text-disabled shrink-0">#{student.studentNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Link
                  href={`/course/${courseId}/student/${student.id}`}
                  className="p-1.5 text-brand hover:bg-surface-alt rounded transition-colors"
                  title={t('test.viewDashboard')}
                >
                  <BarChart3 size={15} />
                </Link>
                <button
                  onClick={() => onDeleteStudent(student.id)}
                  className="p-1.5 text-danger hover:bg-red-50 rounded transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
