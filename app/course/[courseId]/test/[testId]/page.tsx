'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, CourseTest, CourseStudent, TaskFeedback, TestFeedbackData, FeedbackSnippet } from '@/types';
import { loadCourse, updateCourse, updateTest, updateStudentFeedback, getStudentFeedback, calculateStudentScore } from '@/utils/storage';
import { generateTypstDocument, downloadTypstFile, compileAndDownloadPDF, compileAndGetPDFBlob } from '@/utils/typstExport';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import TaskConfiguration from '@/components/TaskConfiguration';
import SnippetPicker from '@/components/SnippetPicker';
import ScoringGuide from '@/components/ScoringGuide';
import GradingProgressBar from '@/components/GradingProgressBar';
import ProgressGrid from '@/components/ProgressGrid';
import SnippetSidebar from '@/components/SnippetSidebar';
import { useGradingShortcuts, TaskSlot } from '@/hooks/useGradingShortcuts';
import { ArrowLeft, Save, Download, CheckCircle, Circle, FileText, BarChart3, Link2, PanelRightOpen, PanelRightClose, Plus, Trash2, ChevronLeft, ChevronRight, Keyboard, ListChecks, Eye, UserX, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import { loadGlobalSnippets, addGlobalSnippet, deleteGlobalSnippet, getAllSnippetsForTest } from '@/utils/snippetStorage';

export default function TestFeedbackPage() {
  const { t, language } = useLanguage();
  const { toast, confirm } = useNotification();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<CourseTest | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<TestFeedbackData | null>(null);
  const [allSnippets, setAllSnippets] = useState<FeedbackSnippet[]>([]);

  // Snippet sidebar state
  const [showSnippetSidebar, setShowSnippetSidebar] = useState(false);
  const [activeSubtask, setActiveSubtask] = useState<{ taskId: string, subtaskId?: string } | null>(null);
  const [snippetFilter, setSnippetFilter] = useState<'all' | 'standard' | 'encouragement' | 'error' | 'custom' | 'math'>('all');

  // Track unsaved test config changes
  const [hasUnsavedTestConfig, setHasUnsavedTestConfig] = useState(false);

  // Keyboard shortcuts visibility
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // PDF preview state
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfFilename, setPreviewPdfFilename] = useState<string>('');

  // Refs for textareas to handle cursor position
  const generalCommentRef = useRef<HTMLTextAreaElement>(null);
  const individualCommentRef = useRef<HTMLTextAreaElement>(null);
  const subtaskTextareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  useEffect(() => {
    loadData();
  }, [courseId, testId]);

  const loadData = () => {
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
    setHasUnsavedTestConfig(false);
  };

  // Auto-select student from URL parameter
  useEffect(() => {
    if (!course) return;

    const studentIdParam = searchParams.get('student');
    if (studentIdParam) {
      const student = course.students.find(s => s.id === studentIdParam);
      if (student && (!selectedStudent || selectedStudent.id !== studentIdParam)) {
        setSelectedStudent(student);
      }
    }
  }, [course, searchParams, selectedStudent]);

  useEffect(() => {
    if (selectedStudent && course && test) {
      const feedback = getStudentFeedback(courseId, testId, selectedStudent.id);
      setCurrentFeedback(feedback || {
        studentId: selectedStudent.id,
        taskFeedbacks: [],
        individualComment: '',
      });
    }
  }, [selectedStudent, course, test, courseId, testId]);

  // Load snippets when test loads
  useEffect(() => {
    if (test) {
      const snippets = getAllSnippetsForTest(test.snippets);
      setAllSnippets(snippets);
    }
  }, [test]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedTestConfig) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedTestConfig]);

  // Track test config changes
  const handleTestChange = useCallback((updatedTest: CourseTest) => {
    setTest(updatedTest);
    setHasUnsavedTestConfig(true);
  }, []);

  const handleSaveTest = () => {
    if (test) {
      updateTest(courseId, testId, test);
      setHasUnsavedTestConfig(false);
      toast(t('test.testConfigSaved'), 'success');
      loadData();
    }
  };

  const handleLabelsChange = (labels: string[]) => {
    updateCourse(courseId, { availableLabels: labels });
    setCourse(prev => prev ? { ...prev, availableLabels: labels } : prev);
    setHasUnsavedTestConfig(true);
  };

  const handleUpdateFeedback = (taskId: string, subtaskId: string | undefined, updates: Partial<TaskFeedback>) => {
    if (!currentFeedback || !selectedStudent) return;

    const existingIndex = currentFeedback.taskFeedbacks.findIndex(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );

    let newFeedbacks: TaskFeedback[];
    if (existingIndex >= 0) {
      newFeedbacks = [...currentFeedback.taskFeedbacks];
      newFeedbacks[existingIndex] = { ...newFeedbacks[existingIndex], ...updates };
    } else {
      newFeedbacks = [...currentFeedback.taskFeedbacks, { taskId, subtaskId, points: null, comment: '', ...updates }];
    }

    const updatedFeedback = {
      ...currentFeedback,
      taskFeedbacks: newFeedbacks,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
  };

  const handleUpdateIndividualComment = (comment: string) => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      individualComment: comment,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
  };

  const handleMarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      completedDate: new Date().toISOString(),
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
    toast(t('test.feedbackMarkedComplete'), 'success');
  };

  const handleUnmarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      completedDate: undefined,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
  };

  const handleToggleAbsent = () => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      absent: !currentFeedback.absent,
      // Clear completedDate when marking absent, keep other data intact
      completedDate: !currentFeedback.absent ? undefined : currentFeedback.completedDate,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
  };

  const handleExportAllPDFs = async () => {
    if (!test || !course) return;

    const completedFeedbacks = test.studentFeedbacks.filter(f => f.completedDate && !f.absent);

    if (completedFeedbacks.length === 0) {
      toast(t('test.noCompletedFeedback'), 'warning');
      return;
    }

    const confirmExport = await confirm(
      t('test.exportPDFsConfirm').replace('{count}', completedFeedbacks.length.toString()),
      t('test.exportAllPDFs')
    );

    if (!confirmExport) return;

    let successCount = 0;
    let failCount = 0;

    for (const feedback of completedFeedbacks) {
      const student = course.students.find(s => s.id === feedback.studentId);
      if (!student) continue;

      const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);

      const typstContent = generateTypstDocument({
        studentName: student.name,
        studentNumber: student.studentNumber,
        testName: test.name,
        tasks: test.tasks,
        feedbacks: feedback.taskFeedbacks,
        generalComment: test.generalComment,
        individualComment: feedback.individualComment,
        totalPoints: score,
        maxPoints: 60,
        language,
      });

      const filename = `${test.name.replace(/[^a-z0-9]/gi, '_')}_${student.name.replace(/[^a-z0-9]/gi, '_')}`;

      const success = await compileAndDownloadPDF(typstContent, filename);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (failCount > 0) {
      toast(t('test.exportComplete').replace('{success}', successCount.toString()).replace('{failed}', failCount.toString()), 'warning');
    } else {
      toast(t('test.exportSuccess').replace('{count}', successCount.toString()), 'success');
    }
  };

  const handleExportTypst = () => {
    if (!selectedStudent || !test || !currentFeedback) return;

    const score = calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: currentFeedback.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: currentFeedback.individualComment,
      totalPoints: score,
      maxPoints: 60,
      language,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.typ`;
    downloadTypstFile(typstContent, filename);
  };

  const handleCompilePDF = async () => {
    if (!selectedStudent || !test || !currentFeedback) return;

    const score = calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: currentFeedback.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: currentFeedback.individualComment,
      totalPoints: score,
      maxPoints: 60,
      language,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.typ`;

    const success = await compileAndDownloadPDF(typstContent, filename);
    if (success) {
      toast(t('test.pdfCompiledSuccess'), 'success');
    }
  };

  const handlePreviewPDF = async () => {
    if (!selectedStudent || !test || !currentFeedback) return;

    const score = calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: currentFeedback.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: currentFeedback.individualComment,
      totalPoints: score,
      maxPoints: 60,
      language,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.pdf`;

    const blob = await compileAndGetPDFBlob(typstContent, filename);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
      setPreviewPdfFilename(filename);
    }
  };

  const closePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
  };

  // Insert link template at cursor position
  const insertLinkTemplate = (textareaRef: React.RefObject<HTMLTextAreaElement>, isGeneral: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const linkTemplate = '#link("https://example.com")[\n  See example.com\n]';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + linkTemplate + currentValue.substring(end);

    if (isGeneral && test) {
      handleTestChange({ ...test, generalComment: newValue });
    } else if (!isGeneral && currentFeedback && selectedStudent) {
      const updatedFeedback = {
        ...currentFeedback,
        individualComment: newValue,
      };
      updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
      setCurrentFeedback(updatedFeedback);
    }

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkTemplate.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert snippet at cursor position
  const insertSnippet = (text: string, textareaRef: React.RefObject<HTMLTextAreaElement>, isGeneral: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

    if (isGeneral && test) {
      handleTestChange({ ...test, generalComment: newValue });
    } else if (!isGeneral && currentFeedback && selectedStudent) {
      const updatedFeedback = {
        ...currentFeedback,
        individualComment: newValue,
      };
      updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
      setCurrentFeedback(updatedFeedback);
    }

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Add new snippet and reload list
  const handleAddSnippet = (text: string, category?: FeedbackSnippet['category']) => {
    addGlobalSnippet(text, category);
    if (test) {
      const snippets = getAllSnippetsForTest(test.snippets);
      setAllSnippets(snippets);
    }
  };

  // Delete snippet and reload list
  const handleDeleteSnippet = (id: string) => {
    deleteGlobalSnippet(id);
    if (test) {
      const snippets = getAllSnippetsForTest(test.snippets);
      setAllSnippets(snippets);
    }
  };

  // Insert snippet into active subtask textarea
  const insertSnippetIntoSubtask = (text: string) => {
    if (!activeSubtask) return;

    const key = `${activeSubtask.taskId}-${activeSubtask.subtaskId || 'main'}`;
    const textarea = subtaskTextareaRefs.current.get(key);

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

    // Update feedback with new comment
    handleUpdateFeedback(activeSubtask.taskId, activeSubtask.subtaskId, { comment: newValue });

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };


  // --- Student Navigation ---
  const currentStudentIndex = course && selectedStudent
    ? course.students.findIndex(s => s.id === selectedStudent.id)
    : -1;

  const goToPreviousStudent = () => {
    if (!course || currentStudentIndex <= 0) return;
    setSelectedStudent(course.students[currentStudentIndex - 1]);
  };

  const goToNextStudent = () => {
    if (!course || currentStudentIndex < 0 || currentStudentIndex >= course.students.length - 1) return;
    setSelectedStudent(course.students[currentStudentIndex + 1]);
  };

  // Build flat task slot list for keyboard navigation
  const taskSlots: TaskSlot[] = test ? test.tasks.flatMap(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      return task.subtasks.map(st => ({ taskId: task.id, subtaskId: st.id }));
    }
    return [{ taskId: task.id }];
  }) : [];

  const activeSlotIndex = activeSubtask
    ? taskSlots.findIndex(s => s.taskId === activeSubtask.taskId && s.subtaskId === activeSubtask.subtaskId)
    : -1;

  const setActiveSlot = useCallback((index: number) => {
    if (index < 0 || index >= taskSlots.length) return;
    const slot = taskSlots[index];
    setActiveSubtask(slot);
    // Scroll the task card into view
    const key = `${slot.taskId}-${slot.subtaskId || 'main'}`;
    const textarea = subtaskTextareaRefs.current.get(key);
    textarea?.closest('.border')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [taskSlots]);

  const focusCommentForActiveSlot = useCallback(() => {
    if (!activeSubtask) return;
    const key = `${activeSubtask.taskId}-${activeSubtask.subtaskId || 'main'}`;
    const textarea = subtaskTextareaRefs.current.get(key);
    textarea?.focus();
  }, [activeSubtask]);

  // Keyboard shortcuts for grading
  useGradingShortcuts({
    onSetPoints: (points) => {
      if (activeSubtask && selectedStudent) {
        handleUpdateFeedback(activeSubtask.taskId, activeSubtask.subtaskId, { points });
      }
    },
    onNextStudent: goToNextStudent,
    onPreviousStudent: goToPreviousStudent,
    onToggleComplete: () => {
      if (currentFeedback?.completedDate) {
        handleUnmarkComplete();
      } else {
        handleMarkComplete();
      }
    },
    onNextTask: () => {
      if (activeSlotIndex < 0 && taskSlots.length > 0) {
        setActiveSlot(0);
      } else if (activeSlotIndex < taskSlots.length - 1) {
        setActiveSlot(activeSlotIndex + 1);
      }
    },
    onPreviousTask: () => {
      if (activeSlotIndex > 0) {
        setActiveSlot(activeSlotIndex - 1);
      }
    },
    onFocusComment: focusCommentForActiveSlot,
    onFocusPoints: () => {
      // Escape from textarea already handled by hook (blur),
      // activeSubtask stays the same so points mode is restored
    },
    enabled: !!selectedStudent,
  });

  if (!course || !test) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback => {
    if (!currentFeedback) return { taskId, subtaskId, points: null, comment: '' };

    const existing = currentFeedback.taskFeedbacks.find(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );
    return existing || { taskId, subtaskId, points: 0, comment: '' };
  };

  const currentScore = currentFeedback && test ? calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks) : 0;

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/course/${courseId}`}
              className="inline-flex items-center gap-2 text-brand hover:text-brand-hover mb-2"
            >
              <ArrowLeft size={20} />
              {t('test.backToCourse')}
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-display font-bold text-text-primary">{test.name}</h1>
              {course.tests.length > 1 && (
                <select
                  value={testId}
                  onChange={(e) => router.push(`/course/${courseId}/test/${e.target.value}`)}
                  className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-all cursor-pointer"
                >
                  {course.tests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-text-secondary">{course.name}</p>
            {test.description && <p className="text-text-secondary text-sm">{test.description}</p>}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/course/${courseId}/test/${testId}/task-grading`}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
              title={t('test.taskGrading')}
            >
              <ListChecks size={18} />
              {t('test.taskGrading')}
            </Link>
            <Link
              href={`/course/${courseId}/test/${testId}/analytics`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              title={t('test.taskAnalyticsTitle')}
            >
              <BarChart3 size={18} />
              {t('test.taskAnalyticsTitle')}
            </Link>
            <button
              onClick={handleExportAllPDFs}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              title={t('test.exportAllPDFs')}
            >
              <Download size={18} />
              {t('test.exportAllPDFs')}
            </button>
          </div>
        </div>

        {/* Test Settings Section */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-8 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('test.testSettings')}</h2>
              <p className="text-sm text-text-secondary">{t('test.testSettingsDesc')}</p>
            </div>
            <button
              onClick={handleSaveTest}
              className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition shadow-sm ${hasUnsavedTestConfig
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-success hover:bg-emerald-700'
                }`}
            >
              <Save size={18} />
              {t('test.saveSettings')}
              {hasUnsavedTestConfig && <span className="w-2 h-2 bg-white rounded-full" />}
            </button>
          </div>

          {/* Task Configuration */}
          <div className="mb-6">
            <TaskConfiguration
              tasks={test.tasks}
              onTasksChange={(tasks) => handleTestChange({ ...test, tasks })}
              availableLabels={course.availableLabels}
              onLabelsChange={handleLabelsChange}
            />
          </div>

          {/* General Comment */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{t('test.generalCommentTitle')}</h3>
                <p className="text-xs text-text-secondary">{t('test.generalCommentDesc')}</p>
              </div>
              <div className="flex gap-2">
                <SnippetPicker
                  snippets={allSnippets}
                  onInsert={(text) => insertSnippet(text, generalCommentRef, true)}
                  onAddSnippet={handleAddSnippet}
                  onDeleteSnippet={handleDeleteSnippet}
                />
                <button
                  onClick={() => insertLinkTemplate(generalCommentRef, true)}
                  className="flex items-center gap-1 px-3 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                  title="Insert link template"
                >
                  <Link2 size={16} />
                  Insert Link
                </button>
              </div>
            </div>
            <textarea
              ref={generalCommentRef}
              value={test.generalComment}
              onChange={(e) => handleTestChange({ ...test, generalComment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
              placeholder={t('test.generalCommentPlaceholder')}
            />
          </div>
        </div>

        {/* Grading Progress */}
        <GradingProgressBar
          completedCount={test.studentFeedbacks.filter(f => f.completedDate && !f.absent).length}
          totalCount={course.students.length}
          absentCount={test.studentFeedbacks.filter(f => f.absent).length}
        />

        {/* Progress Grid — student × task heatmap */}
        <ProgressGrid
          courseId={courseId}
          test={test}
          students={course.students}
          selectedStudentId={selectedStudent?.id}
          onSelectStudent={setSelectedStudent}
        />

        {/* Student Feedback Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('test.studentFeedback')}</h2>
              <p className="text-sm text-text-secondary">{t('test.studentFeedbackDesc')}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary bg-surface-alt border border-border rounded-lg hover:bg-gray-200 transition-colors"
                title={t('test.keyboardShortcuts')}
              >
                <Keyboard size={16} />
                {t('test.keyboardShortcuts')}
              </button>
              {showShortcutsHelp && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg p-4 z-40">
                  <h4 className="font-semibold text-text-primary text-sm mb-3">{t('test.keyboardShortcuts')}</h4>
                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">0-6</kbd><span>{t('test.shortcutSetPoints')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Tab</kbd><span>{t('test.shortcutNextTask')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Shift+Tab</kbd><span>{t('test.shortcutPrevTask')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Enter</kbd><span>{t('test.shortcutFocusComment')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Escape</kbd><span>{t('test.shortcutFocusPoints')}</span></div>
                    <hr className="border-border my-1" />
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Alt+&larr;/&uarr;</kbd><span>{t('test.shortcutPrevStudent')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Alt+&rarr;/&darr;</kbd><span>{t('test.shortcutNextStudent')}</span></div>
                    <div className="flex justify-between gap-4"><kbd className="px-1.5 py-0.5 bg-surface-alt border border-border rounded font-mono">Alt+Enter</kbd><span>{t('test.shortcutToggleComplete')}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Students list */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-lg shadow-sm p-4 sticky top-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">{t('test.studentsCount').replace('{count}', course.students.length.toString())}</h3>

                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {course.students.length === 0 ? (
                    <p className="text-sm text-text-disabled text-center py-4">{t('test.noStudentsInCourse')}</p>
                  ) : (
                    course.students.map(student => {
                      const feedback = getStudentFeedback(courseId, testId, student.id);
                      const score = feedback ? calculateStudentScore(test.tasks, feedback.taskFeedbacks) : 0;
                      const isCompleted = feedback?.completedDate;
                      const isAbsent = !!feedback?.absent;

                      return (
                        <div
                          key={student.id}
                          className={`p-3 border rounded-lg transition-colors ${selectedStudent?.id === student.id
                            ? 'border-rose-500 bg-rose-50'
                            : isAbsent
                              ? 'border-border bg-gray-50 opacity-60'
                              : 'border-border hover:bg-surface-alt'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${isAbsent ? 'line-through text-text-disabled' : 'text-text-primary'}`}>{student.name}</h4>
                                {isAbsent && (
                                  <span className="text-[10px] bg-gray-200 text-text-disabled px-1.5 py-0.5 rounded font-medium">{t('test.absent')}</span>
                                )}
                                {isCompleted && !isAbsent && (
                                  <CheckCircle size={16} className="text-success" />
                                )}
                              </div>
                              {student.studentNumber && (
                                <p className="text-xs text-text-disabled">#{student.studentNumber}</p>
                              )}
                              {!isAbsent && (
                                <p className="text-sm font-semibold text-brand mt-1">
                                  {score} / 60
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  // Toggle absent after selecting student
                                  const fb = getStudentFeedback(courseId, testId, student.id);
                                  const updatedFb = {
                                    studentId: student.id,
                                    taskFeedbacks: fb?.taskFeedbacks || [],
                                    individualComment: fb?.individualComment || '',
                                    completedDate: fb?.absent ? fb?.completedDate : undefined,
                                    absent: !fb?.absent,
                                  };
                                  updateStudentFeedback(courseId, testId, student.id, updatedFb);
                                  loadData();
                                }}
                                className={`p-1 rounded transition ${isAbsent ? 'text-success hover:bg-emerald-50' : 'text-text-disabled hover:bg-gray-100'}`}
                                title={isAbsent ? t('test.markPresent') : t('test.markAbsent')}
                              >
                                {isAbsent ? <UserCheck size={16} /> : <UserX size={16} />}
                              </button>
                              <Link
                                href={`/course/${courseId}/student/${student.id}`}
                                className="p-1 text-brand hover:bg-primary-100 rounded transition"
                                title={t('test.viewStudentDashboard')}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <BarChart3 size={16} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Feedback form */}
            <div className="lg:col-span-3">
              {selectedStudent && currentFeedback ? (
                currentFeedback.absent ? (
                  <div className="bg-surface rounded-lg shadow-sm p-12 flex items-center justify-center">
                    <div className="text-center">
                      <UserX size={48} className="mx-auto mb-4 text-text-disabled opacity-50" />
                      <h3 className="text-lg font-semibold text-text-primary mb-2">{selectedStudent.name}</h3>
                      <p className="text-text-secondary mb-6">{t('test.studentAbsent')}</p>
                      <button
                        onClick={handleToggleAbsent}
                        className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition mx-auto"
                      >
                        <UserCheck size={18} />
                        {t('test.markPresent')}
                      </button>
                    </div>
                  </div>
                ) :
                  <div className="bg-surface rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        {/* Student navigation */}
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={goToPreviousStudent}
                            disabled={currentStudentIndex <= 0}
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-alt hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title={t('test.previousStudent')}
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <span className="text-sm text-text-disabled tabular-nums">
                            {currentStudentIndex + 1} / {course.students.length}
                          </span>
                          <button
                            onClick={goToNextStudent}
                            disabled={currentStudentIndex >= course.students.length - 1}
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-alt hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title={t('test.nextStudent')}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-text-primary">{selectedStudent.name}</h2>
                        {selectedStudent.studentNumber && (
                          <p className="text-sm text-text-secondary">{t('test.studentNumber').replace('{number}', selectedStudent.studentNumber)}</p>
                        )}
                        <p className="text-3xl font-display font-bold text-brand mt-2">{currentScore} / 60</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <ScoringGuide />
                        <div className="flex gap-2">
                          {currentFeedback.completedDate ? (
                            <button
                              onClick={handleUnmarkComplete}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
                              title={t('test.clickToUnmarkComplete')}
                            >
                              <CheckCircle size={18} />
                              {t('test.completedClickToUndo')}
                            </button>
                          ) : (
                            <button
                              onClick={handleMarkComplete}
                              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition"
                            >
                              <CheckCircle size={18} />
                              {t('test.markComplete')}
                            </button>
                          )}
                          <button
                            onClick={handlePreviewPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                            title={t('test.previewPDF')}
                          >
                            <Eye size={18} />
                            {t('test.previewPDF')}
                          </button>
                          <button
                            onClick={handleCompilePDF}
                            className="flex items-center gap-2 px-3 py-2 bg-brand/80 text-white rounded-lg hover:bg-brand transition"
                            title={t('test.compileToPDF')}
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={handleExportTypst}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            title={t('test.downloadTypSource')}
                          >
                            <FileText size={18} />
                            .typ
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Task Feedback */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-text-primary">{t('test.taskFeedbackTitle')}</h3>
                        <button
                          onClick={() => setShowSnippetSidebar(!showSnippetSidebar)}
                          className="flex items-center gap-2 px-3 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                          title={showSnippetSidebar ? t('test.hideSnippets') : t('test.showSnippets')}
                        >
                          {showSnippetSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                          {showSnippetSidebar ? t('test.hideSnippets') : t('test.showSnippets')}
                        </button>
                      </div>

                      <div className="flex gap-4">
                        {/* Task list */}
                        <div className={`space-y-6 mb-6 transition-all ${showSnippetSidebar ? 'flex-1' : 'w-full'}`}>
                          {test.tasks.map(task => (
                            <div key={task.id}>
                              {task.hasSubtasks ? (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-semibold text-text-secondary">{t('test.task')} {task.label}</h4>
                                    {task.part && (
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.part === 1
                                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                        }`}>
                                        {task.part === 1 ? `${t('test.part')} 1` : `${t('test.part')} 2`}
                                      </span>
                                    )}
                                  </div>
                                  {task.subtasks.map(subtask => {
                                    const feedback = getFeedback(task.id, subtask.id);
                                    return (
                                      <div key={subtask.id} className={`ml-4 border rounded-lg p-4 transition-colors ${activeSubtask?.taskId === task.id && activeSubtask?.subtaskId === subtask.id
                                        ? 'border-brand bg-primary-50 ring-2 ring-brand/30'
                                        : 'border-border bg-surface-alt'
                                        }`}>
                                        <div className="flex items-center gap-4 mb-3">
                                          <label className="font-medium text-text-secondary min-w-[60px]">
                                            {task.label}{subtask.label}:
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                                            <div className="flex gap-1">
                                              {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                                <button
                                                  key={p}
                                                  type="button"
                                                  onClick={() => handleUpdateFeedback(task.id, subtask.id, { points: p })}
                                                  className={`w-9 h-9 rounded-lg font-semibold transition-all ${feedback.points === p
                                                    ? 'bg-brand text-white shadow-md scale-110'
                                                    : 'bg-surface border border-border text-text-secondary hover:bg-primary-50 hover:border-brand'
                                                    }`}
                                                >
                                                  {p}
                                                </button>
                                              ))}
                                            </div>
                                            <span className="text-sm text-text-secondary">/ 6</span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-text-secondary mb-1">
                                            {t('test.commentLabel')}
                                          </label>
                                          <textarea
                                            ref={(el) => {
                                              if (el) subtaskTextareaRefs.current.set(`${task.id}-${subtask.id}`, el);
                                            }}
                                            value={feedback.comment}
                                            onChange={(e) =>
                                              handleUpdateFeedback(task.id, subtask.id, { comment: e.target.value })
                                            }
                                            onFocus={() => setActiveSubtask({ taskId: task.id, subtaskId: subtask.id })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                                            placeholder={t('test.commentPlaceholder1')}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className={`border rounded-lg p-4 transition-colors ${activeSubtask?.taskId === task.id && !activeSubtask?.subtaskId
                                  ? 'border-brand bg-primary-50 ring-2 ring-brand/30'
                                  : 'border-border bg-surface-alt'
                                  }`}>
                                  {(() => {
                                    const feedback = getFeedback(task.id, undefined);
                                    return (
                                      <>
                                        <div className="flex items-center gap-4 mb-3">
                                          <div className="flex items-center gap-2">
                                            <label className="font-medium text-text-secondary min-w-[60px]">
                                              {t('test.task')} {task.label}:
                                            </label>
                                            {task.part && (
                                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.part === 1
                                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                                                }`}>
                                                {task.part === 1 ? `${t('test.part')} 1` : `${t('test.part')} 2`}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                                            <div className="flex gap-1">
                                              {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                                <button
                                                  key={p}
                                                  type="button"
                                                  onClick={() => handleUpdateFeedback(task.id, undefined, { points: p })}
                                                  className={`w-9 h-9 rounded-lg font-semibold transition-all ${feedback.points === p
                                                    ? 'bg-brand text-white shadow-md scale-110'
                                                    : 'bg-surface border border-border text-text-secondary hover:bg-primary-50 hover:border-brand'
                                                    }`}
                                                >
                                                  {p}
                                                </button>
                                              ))}
                                            </div>
                                            <span className="text-sm text-text-secondary">/ 6</span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-text-secondary mb-1">
                                            {t('test.commentLabel')}
                                          </label>
                                          <textarea
                                            ref={(el) => {
                                              if (el) subtaskTextareaRefs.current.set(`${task.id}-main`, el);
                                            }}
                                            value={feedback.comment}
                                            onChange={(e) =>
                                              handleUpdateFeedback(task.id, undefined, { comment: e.target.value })
                                            }
                                            onFocus={() => setActiveSubtask({ taskId: task.id, subtaskId: undefined })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                                            placeholder={t('test.commentPlaceholder2')}
                                          />
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Snippet Sidebar */}
                        {showSnippetSidebar && (
                          <SnippetSidebar
                            snippets={allSnippets}
                            activeSubtask={activeSubtask}
                            snippetFilter={snippetFilter}
                            onFilterChange={setSnippetFilter}
                            onInsertSnippet={insertSnippetIntoSubtask}
                            onAddSnippet={handleAddSnippet}
                            onDeleteSnippet={handleDeleteSnippet}
                          />
                        )}
                      </div>
                    </div>

                    {/* Individual Comment */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-text-secondary">
                          {t('test.individualCommentLabel')}
                        </label>
                        <div className="flex gap-2">
                          <SnippetPicker
                            snippets={allSnippets}
                            onInsert={(text) => insertSnippet(text, individualCommentRef, false)}
                            onAddSnippet={handleAddSnippet}
                            onDeleteSnippet={handleDeleteSnippet}
                          />
                          <button
                            onClick={() => insertLinkTemplate(individualCommentRef, false)}
                            className="flex items-center gap-1 px-2 py-1 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-xs"
                            title="Insert link template"
                          >
                            <Link2 size={14} />
                            Insert Link
                          </button>
                        </div>
                      </div>
                      <textarea
                        ref={individualCommentRef}
                        value={currentFeedback.individualComment}
                        onChange={(e) => handleUpdateIndividualComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
                        placeholder={t('test.individualCommentPlaceholder')}
                      />
                    </div>
                  </div>
              ) : (
                <div className="bg-surface rounded-lg shadow-sm p-12 flex items-center justify-center">
                  <div className="text-center text-text-disabled">
                    <Circle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t('test.selectStudentPrompt')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PdfPreviewModal
        pdfUrl={previewPdfUrl}
        filename={previewPdfFilename}
        onClose={closePreview}
      />
    </main>
  );
}
