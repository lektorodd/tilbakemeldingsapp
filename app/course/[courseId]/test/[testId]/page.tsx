'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, CourseTest, CourseStudent, TaskFeedback, TestFeedbackData, FeedbackSnippet } from '@/types';
import { loadCourse, updateTest, updateStudentFeedback, getStudentFeedback, calculateStudentScore } from '@/utils/courseStorage';
import { generateTypstDocument, downloadTypstFile, compileAndDownloadPDF } from '@/utils/typstExport';
import TaskConfiguration from '@/components/TaskConfiguration';
import SnippetPicker from '@/components/SnippetPicker';
import ScoringGuide from '@/components/ScoringGuide';
import { ArrowLeft, Save, Download, CheckCircle, Circle, FileText, BarChart3, Link2, PanelRightOpen, PanelRightClose, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeSubtask, setActiveSubtask] = useState<{taskId: string, subtaskId?: string} | null>(null);
  const [snippetFilter, setSnippetFilter] = useState<'all' | 'standard' | 'encouragement' | 'error' | 'custom'>('all');
  const [showAddSnippetForm, setShowAddSnippetForm] = useState(false);
  const [newSnippetText, setNewSnippetText] = useState('');

  // Track unsaved test config changes
  const [hasUnsavedTestConfig, setHasUnsavedTestConfig] = useState(false);

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
      newFeedbacks = [...currentFeedback.taskFeedbacks, { taskId, subtaskId, points: 0, comment: '', ...updates }];
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

  const handleExportAllPDFs = async () => {
    if (!test || !course) return;

    const completedFeedbacks = test.studentFeedbacks.filter(f => f.completedDate);

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

  // Handle adding snippet from sidebar form
  const handleAddSnippetFromForm = () => {
    if (newSnippetText.trim()) {
      handleAddSnippet(newSnippetText.trim(), 'custom');
      setNewSnippetText('');
      setShowAddSnippetForm(false);
    }
  };

  // Get category color for snippet badges
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'standard': return 'bg-stone-100 text-stone-700';
      case 'encouragement': return 'bg-emerald-100 text-emerald-700';
      case 'error': return 'bg-rose-100 text-rose-700';
      case 'custom': return 'bg-violet-100 text-violet-700';
      default: return 'bg-stone-100 text-stone-700';
    }
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

  if (!course || !test) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback => {
    if (!currentFeedback) return { taskId, subtaskId, points: 0, comment: '' };

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
              className="inline-flex items-center gap-2 text-brand hover:text-rose-800 mb-2"
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
              href={`/course/${courseId}/test/${testId}/analytics`}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
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
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-8 border-2 border-violet-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('test.testSettings')}</h2>
              <p className="text-sm text-text-secondary">{t('test.testSettingsDesc')}</p>
            </div>
            <button
              onClick={handleSaveTest}
              className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg transition shadow-sm ${
                hasUnsavedTestConfig
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

        {/* Student Feedback Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('test.studentFeedback')}</h2>
            <p className="text-sm text-text-secondary">{t('test.studentFeedbackDesc')}</p>
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

                    return (
                      <div
                        key={student.id}
                        className={`p-3 border rounded-lg transition-colors ${
                          selectedStudent?.id === student.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-border hover:bg-surface-alt'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-text-primary">{student.name}</h4>
                              {isCompleted && (
                                <CheckCircle size={16} className="text-success" />
                              )}
                            </div>
                            {student.studentNumber && (
                              <p className="text-xs text-text-disabled">#{student.studentNumber}</p>
                            )}
                            <p className="text-sm font-semibold text-brand mt-1">
                              {score} / 60
                            </p>
                          </div>
                          <Link
                            href={`/course/${courseId}/student/${student.id}`}
                            className="p-1 text-brand hover:bg-violet-100 rounded transition"
                            title={t('test.viewStudentDashboard')}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BarChart3 size={16} />
                          </Link>
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
                      onClick={handleCompilePDF}
                      className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                      title={t('test.compileToPDF')}
                    >
                      <Download size={18} />
                      {t('test.generatePDF')}
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
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                task.part === 1
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
                              <div key={subtask.id} className="ml-4 border border-border rounded-lg p-4 bg-surface-alt">
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
                                          className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                                            feedback.points === p
                                              ? 'bg-brand text-white shadow-md scale-110'
                                              : 'bg-surface border border-border text-text-secondary hover:bg-violet-50 hover:border-brand'
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
                        <div className="border border-border rounded-lg p-4 bg-surface-alt">
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
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        task.part === 1
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
                                          className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                                            feedback.points === p
                                              ? 'bg-brand text-white shadow-md scale-110'
                                              : 'bg-surface border border-border text-text-secondary hover:bg-violet-50 hover:border-brand'
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
                      <div className="w-80 flex-shrink-0">
                        <div className="sticky top-4 bg-surface rounded-lg shadow-sm border border-border h-[calc(100vh-120px)] flex flex-col">
                          {/* Header */}
                          <div className="p-4 border-b border-border flex-shrink-0">
                            <h4 className="text-lg font-display font-semibold text-text-primary mb-3">
                              {t('test.snippetsTitle')}
                            </h4>
                            {activeSubtask && (
                              <>
                                <p className="text-xs text-text-secondary mb-3">
                                  {t('test.snippetsDesc')}
                                </p>
                                {/* Filter buttons */}
                                <div className="flex gap-1 flex-wrap">
                                  <button
                                    onClick={() => setSnippetFilter('all')}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      snippetFilter === 'all' ? 'bg-brand text-white' : 'bg-surface-alt text-text-secondary hover:bg-gray-200'
                                    }`}
                                  >
                                    {t('common.all')} ({allSnippets.length})
                                  </button>
                                  <button
                                    onClick={() => setSnippetFilter('standard')}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      snippetFilter === 'standard' ? 'bg-stone-600 text-white' : 'bg-surface-alt text-text-secondary hover:bg-stone-100'
                                    }`}
                                  >
                                    Standard
                                  </button>
                                  <button
                                    onClick={() => setSnippetFilter('encouragement')}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      snippetFilter === 'encouragement' ? 'bg-success text-white' : 'bg-surface-alt text-text-secondary hover:bg-emerald-100'
                                    }`}
                                  >
                                    {t('snippets.encouragement') || 'Oppmuntrande'}
                                  </button>
                                  <button
                                    onClick={() => setSnippetFilter('error')}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      snippetFilter === 'error' ? 'bg-danger text-white' : 'bg-surface-alt text-text-secondary hover:bg-red-100'
                                    }`}
                                  >
                                    {t('snippets.error') || 'Feil'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Snippet list */}
                          <div className="flex-1 overflow-y-auto min-h-0 p-2">
                            {!activeSubtask ? (
                              <p className="text-sm text-text-disabled text-center py-8">
                                {t('test.snippetsClickTextarea')}
                              </p>
                            ) : (() => {
                              const filteredSnippets = snippetFilter === 'all'
                                ? allSnippets
                                : allSnippets.filter(s => s.category === snippetFilter);

                              return filteredSnippets.length === 0 ? (
                                <p className="text-sm text-text-disabled text-center py-4">
                                  {t('snippets.noSnippets') || 'Ingen snøggtekstar å vise'}
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {filteredSnippets.map(snippet => (
                                    <div
                                      key={snippet.id}
                                      className="group flex items-center gap-2 p-2 hover:bg-surface-alt rounded-lg transition-colors"
                                    >
                                      <button
                                        onClick={() => insertSnippetIntoSubtask(snippet.text)}
                                        className="flex-1 text-left text-sm text-text-primary hover:text-brand transition-colors"
                                      >
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${getCategoryColor(snippet.category)}`}>
                                          {snippet.category || 'standard'}
                                        </span>
                                        {snippet.text}
                                      </button>
                                      {snippet.category === 'custom' && (
                                        <button
                                          onClick={() => handleDeleteSnippet(snippet.id)}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-red-50 rounded transition-opacity"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Add new snippet form */}
                          {activeSubtask && (
                            <div className="p-3 border-t border-border bg-stone-50 flex-shrink-0">
                              {showAddSnippetForm ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={newSnippetText}
                                    onChange={(e) => setNewSnippetText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddSnippetFromForm();
                                      if (e.key === 'Escape') setShowAddSnippetForm(false);
                                    }}
                                    placeholder={t('snippets.addPlaceholder') || 'Skriv inn ny snøggtekst...'}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm text-text-primary"
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleAddSnippetFromForm}
                                      className="flex-1 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                                    >
                                      {t('common.add')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddSnippetForm(false);
                                        setNewSnippetText('');
                                      }}
                                      className="px-3 py-1.5 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition-colors text-sm"
                                    >
                                      {t('common.cancel')}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowAddSnippetForm(true)}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm"
                                >
                                  <Plus size={16} />
                                  {t('snippets.addNew') || 'Lag ny snøggtekst'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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
    </main>
  );
}
