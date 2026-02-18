'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, CourseTest, TaskFeedback, FeedbackSnippet } from '@/types';
import { loadCourse, updateStudentFeedback } from '@/utils/storage';
import { TaskSlot } from '@/hooks/useGradingShortcuts';
import { useGradingShortcuts } from '@/hooks/useGradingShortcuts';
import TaskSidebar from '@/components/TaskSidebar';
import TaskStudentList from '@/components/TaskStudentList';
import SnippetSidebar from '@/components/SnippetSidebar';
import GradingProgressBar from '@/components/GradingProgressBar';
import { ArrowLeft, BarChart3, Users, PanelRightOpen, PanelRightClose, Keyboard, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import { addGlobalSnippet, deleteGlobalSnippet, getAllSnippetsForTest } from '@/utils/snippetStorage';


function getTaskSlotKey(slot: TaskSlot): string {
  return `${slot.taskId}-${slot.subtaskId || 'main'}`;
}

// Build flat list of all task/subtask slots from task config
function buildTaskSlots(tasks: CourseTest['tasks']): Array<{ slot: TaskSlot; label: string }> {
  const result: Array<{ slot: TaskSlot; label: string }> = [];
  tasks.forEach(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        result.push({
          slot: { taskId: task.id, subtaskId: subtask.id },
          label: `${task.label}${subtask.label}`,
        });
      });
    } else {
      result.push({
        slot: { taskId: task.id, subtaskId: undefined },
        label: task.label,
      });
    }
  });
  return result;
}

export default function TaskGradingPage() {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<CourseTest | null>(null);
  const [activeTaskSlot, setActiveTaskSlot] = useState<TaskSlot>({ taskId: '', subtaskId: undefined });
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showSnippetSidebar, setShowSnippetSidebar] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [snippetFilter, setSnippetFilter] = useState<'all' | 'standard' | 'encouragement' | 'error' | 'custom'>('all');
  const [allSnippets, setAllSnippets] = useState<FeedbackSnippet[]>([]);

  // In-memory feedback state: Map<studentId, TaskFeedback[]>
  const [feedbackState, setFeedbackState] = useState<Map<string, TaskFeedback[]>>(new Map());

  const subtaskTextareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Load data
  useEffect(() => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      toast(t('course.courseNotFound'), 'error');
      router.push('/courses');
      return;
    }

    const loadedTest = loadedCourse.tests.find(t => t.id === testId);
    if (!loadedTest) {
      toast(t('test.testNotFound'), 'error');
      router.push(`/course/${courseId}`);
      return;
    }

    setCourse(loadedCourse);
    setTest(loadedTest);

    // Build initial feedback state from test data
    const fbMap = new Map<string, TaskFeedback[]>();
    loadedCourse.students.forEach(student => {
      const studentFb = loadedTest.studentFeedbacks.find(f => f.studentId === student.id);
      fbMap.set(student.id, studentFb?.taskFeedbacks || []);
    });
    setFeedbackState(fbMap);

    // Set initial active task from query param or first task
    const taskSlots = buildTaskSlots(loadedTest.tasks);
    const taskParam = searchParams.get('task');
    if (taskParam && taskSlots.length > 0) {
      const matchedSlot = taskSlots.find(s => s.label === taskParam);
      if (matchedSlot) {
        setActiveTaskSlot(matchedSlot.slot);
      } else {
        setActiveTaskSlot(taskSlots[0].slot);
      }
    } else if (taskSlots.length > 0) {
      setActiveTaskSlot(taskSlots[0].slot);
    }

    // Load snippets
    setAllSnippets(getAllSnippetsForTest(loadedTest.snippets || []));
  }, [courseId, testId]);

  const students = course?.students || [];
  const taskSlots = useMemo(() => test ? buildTaskSlots(test.tasks) : [], [test]);

  // Build feedback map for current task
  const currentTaskFeedbackMap = useMemo(() => {
    const map = new Map<string, TaskFeedback>();
    students.forEach(student => {
      const feedbacks = feedbackState.get(student.id) || [];
      const fb = feedbacks.find(
        f => f.taskId === activeTaskSlot.taskId &&
          (activeTaskSlot.subtaskId ? f.subtaskId === activeTaskSlot.subtaskId : !f.subtaskId)
      );
      map.set(student.id, fb || {
        taskId: activeTaskSlot.taskId,
        subtaskId: activeTaskSlot.subtaskId,
        points: null,
        comment: '',
      });
    });
    return map;
  }, [students, feedbackState, activeTaskSlot]);

  // Completed students set
  const completedStudents = useMemo(() => {
    const set = new Set<string>();
    if (!test) return set;
    test.studentFeedbacks.forEach(fb => {
      if (fb.completedDate) set.add(fb.studentId);
    });
    return set;
  }, [test]);

  // Task sidebar stats
  const taskStats = useMemo(() => {
    const stats = new Map<string, { avgScore: number; gradedCount: number; totalStudents: number }>();
    taskSlots.forEach(({ slot }) => {
      const key = getTaskSlotKey(slot);
      let totalPoints = 0;
      let gradedCount = 0;

      students.forEach(student => {
        const feedbacks = feedbackState.get(student.id) || [];
        const fb = feedbacks.find(
          f => f.taskId === slot.taskId &&
            (slot.subtaskId ? f.subtaskId === slot.subtaskId : !f.subtaskId)
        );
        if (fb) {
          totalPoints += fb.points ?? 0;
          if (fb.points !== null || fb.comment.trim().length > 0) {
            gradedCount++;
          }
        }
      });

      stats.set(key, {
        avgScore: students.length > 0 ? totalPoints / students.length : 0,
        gradedCount,
        totalStudents: students.length,
      });
    });
    return stats;
  }, [taskSlots, students, feedbackState]);

  // Current active task label
  const activeTaskLabel = useMemo(() => {
    const slot = taskSlots.find(s =>
      s.slot.taskId === activeTaskSlot.taskId && s.slot.subtaskId === activeTaskSlot.subtaskId
    );
    return slot?.label || '';
  }, [taskSlots, activeTaskSlot]);

  // Handle feedback update
  const handleUpdateFeedback = useCallback((studentId: string, updates: Partial<TaskFeedback>) => {
    setFeedbackState(prev => {
      const newMap = new Map(prev);
      const feedbacks = [...(newMap.get(studentId) || [])];

      const idx = feedbacks.findIndex(
        f => f.taskId === activeTaskSlot.taskId &&
          (activeTaskSlot.subtaskId ? f.subtaskId === activeTaskSlot.subtaskId : !f.subtaskId)
      );

      const existing = idx >= 0 ? feedbacks[idx] : {
        taskId: activeTaskSlot.taskId,
        subtaskId: activeTaskSlot.subtaskId,
        points: null,
        comment: '',
      };

      const updated = { ...existing, ...updates };

      if (idx >= 0) {
        feedbacks[idx] = updated;
      } else {
        feedbacks.push(updated);
      }

      newMap.set(studentId, feedbacks);

      // Persist to storage
      updateStudentFeedback(courseId, testId, studentId, {
        taskFeedbacks: feedbacks,
      });

      return newMap;
    });

    // Auto-advance after setting points (not when typing comment)
    if (autoAdvance && 'points' in updates && !('comment' in updates)) {
      setActiveStudentIndex(prev => Math.min(prev + 1, students.length - 1));
    }
  }, [activeTaskSlot, courseId, testId, autoAdvance, students.length]);

  // Keyboard shortcut handlers
  const currentSlotIndex = taskSlots.findIndex(
    s => s.slot.taskId === activeTaskSlot.taskId && s.slot.subtaskId === activeTaskSlot.subtaskId
  );

  const handleNextTask = useCallback(() => {
    if (currentSlotIndex < taskSlots.length - 1) {
      setActiveTaskSlot(taskSlots[currentSlotIndex + 1].slot);
      setActiveStudentIndex(0);
    }
  }, [currentSlotIndex, taskSlots]);

  const handlePrevTask = useCallback(() => {
    if (currentSlotIndex > 0) {
      setActiveTaskSlot(taskSlots[currentSlotIndex - 1].slot);
      setActiveStudentIndex(0);
    }
  }, [currentSlotIndex, taskSlots]);

  const handleNextStudent = useCallback(() => {
    setActiveStudentIndex(prev => Math.min(prev + 1, students.length - 1));
  }, [students.length]);

  const handlePrevStudent = useCallback(() => {
    setActiveStudentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSetPoints = useCallback((points: number) => {
    if (students.length === 0) return;
    const student = students[activeStudentIndex];
    if (!student) return;
    handleUpdateFeedback(student.id, { points });
  }, [students, activeStudentIndex, handleUpdateFeedback]);

  const handleFocusComment = useCallback(() => {
    if (students.length === 0) return;
    const student = students[activeStudentIndex];
    if (!student) return;
    const textarea = subtaskTextareaRefs.current.get(student.id);
    if (textarea) textarea.focus();
  }, [students, activeStudentIndex]);

  const handleFocusPoints = useCallback(() => {
    // Blur any focused textarea
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
  }, []);

  useGradingShortcuts({
    onSetPoints: handleSetPoints,
    onNextStudent: handleNextStudent,
    onPreviousStudent: handlePrevStudent,
    onNextTask: handleNextTask,
    onPreviousTask: handlePrevTask,
    onFocusComment: handleFocusComment,
    onFocusPoints: handleFocusPoints,
    enabled: true,
  });

  // Snippet handlers
  const handleInsertSnippet = useCallback((text: string) => {
    if (students.length === 0) return;
    const student = students[activeStudentIndex];
    if (!student) return;
    const textarea = subtaskTextareaRefs.current.get(student.id);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentFb = currentTaskFeedbackMap.get(student.id);
    const currentComment = currentFb?.comment || '';
    const newComment = currentComment.substring(0, start) + text + currentComment.substring(end);
    handleUpdateFeedback(student.id, { comment: newComment });

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    });
  }, [students, activeStudentIndex, currentTaskFeedbackMap, handleUpdateFeedback]);

  const handleAddSnippet = useCallback((text: string, category?: FeedbackSnippet['category']) => {
    addGlobalSnippet(text, category);
    setAllSnippets(getAllSnippetsForTest(test?.snippets || []));
  }, [test]);

  const handleDeleteSnippet = useCallback((id: string) => {
    deleteGlobalSnippet(id);
    setAllSnippets(getAllSnippetsForTest(test?.snippets || []));
  }, [test]);

  // Grading progress
  const completedCount = test?.studentFeedbacks.filter(f => f.completedDate).length || 0;
  const totalCount = students.length;

  if (!course || !test) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link
                href={`/course/${courseId}/test/${testId}`}
                className="inline-flex items-center gap-2 text-brand hover:text-brand-hover mb-1 text-sm"
              >
                <ArrowLeft size={16} />
                {t('test.backToTest')}
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-display font-bold text-text-primary">
                  {t('test.taskGrading')}
                </h1>
                <span className="text-text-secondary">— {test.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/course/${courseId}/test/${testId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-alt transition"
                title={t('test.backToStudentGrading')}
              >
                <Users size={16} />
                {t('test.backToStudentGrading')}
              </Link>
              <Link
                href={`/course/${courseId}/test/${testId}/analytics`}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                title={t('test.taskAnalyticsTitle')}
              >
                <BarChart3 size={16} />
                {t('test.taskAnalyticsTitle')}
              </Link>
              <button
                onClick={() => setShowSnippetSidebar(!showSnippetSidebar)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-surface-alt transition"
                title={showSnippetSidebar ? t('test.hideSnippets') : t('test.showSnippets')}
              >
                {showSnippetSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
              <button
                onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-surface-alt transition"
                title={t('test.keyboardShortcuts')}
              >
                <Keyboard size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <GradingProgressBar completedCount={completedCount} totalCount={totalCount} />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <Zap size={14} />
                {t('test.autoAdvance')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      {showShortcutsHelp && (
        <div className="bg-surface border-b border-border px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">0-6</kbd> {t('test.shortcutSetPoints')}</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Shift+Tab</kbd> {t('test.shortcutNextTask')}/{t('test.shortcutPrevTask')}</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Alt+↓</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Alt+↑</kbd> {t('test.shortcutNextStudent')}/{t('test.shortcutPrevStudent')}</div>
              <div><kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> {t('test.shortcutFocusComment')} · <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Esc</kbd> {t('test.shortcutFocusPoints')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex h-[calc(100vh-160px)]">
        {/* Left sidebar - Task list */}
        <div className="w-64 border-r border-border bg-surface shrink-0 overflow-hidden">
          <TaskSidebar
            tasks={test.tasks}
            activeTaskSlot={activeTaskSlot}
            onSelectTask={(slot) => {
              setActiveTaskSlot(slot);
              setActiveStudentIndex(0);
            }}
            taskStats={taskStats}
            hasTwoParts={test.hasTwoParts}
          />
        </div>

        {/* Center - Student grading list */}
        <div className="flex-1 overflow-y-auto p-6">
          <TaskStudentList
            students={students}
            taskLabel={activeTaskLabel}
            taskId={activeTaskSlot.taskId}
            subtaskId={activeTaskSlot.subtaskId}
            feedbackMap={currentTaskFeedbackMap}
            completedStudents={completedStudents}
            activeStudentIndex={activeStudentIndex}
            onUpdateFeedback={handleUpdateFeedback}
            onSetActiveStudent={setActiveStudentIndex}
            textareaRefs={subtaskTextareaRefs}
          />
        </div>

        {/* Right sidebar - Snippets */}
        {showSnippetSidebar && (
          <div className="w-72 border-l border-border bg-surface shrink-0 overflow-y-auto">
            <SnippetSidebar
              snippets={allSnippets}
              activeSubtask={activeTaskSlot.taskId ? { taskId: activeTaskSlot.taskId, subtaskId: activeTaskSlot.subtaskId } : null}
              snippetFilter={snippetFilter}
              onFilterChange={setSnippetFilter}
              onInsertSnippet={handleInsertSnippet}
              onAddSnippet={handleAddSnippet}
              onDeleteSnippet={handleDeleteSnippet}
            />
          </div>
        )}
      </div>
    </main>
  );
}
