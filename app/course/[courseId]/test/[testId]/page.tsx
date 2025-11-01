'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, CourseTest, CourseStudent, TaskFeedback, TestFeedbackData, FeedbackSnippet } from '@/types';
import { loadCourse, updateTest, updateStudentFeedback, getStudentFeedback, calculateStudentScore } from '@/utils/courseStorage';
import { generateTypstDocument, downloadTypstFile, compileAndDownloadPDF } from '@/utils/typstExport';
import TaskConfiguration from '@/components/TaskConfiguration';
import SnippetPicker from '@/components/SnippetPicker';
import { ArrowLeft, Save, Download, CheckCircle, Circle, FileText, BarChart3, Link2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadGlobalSnippets, addGlobalSnippet, deleteGlobalSnippet, getAllSnippetsForTest } from '@/utils/snippetStorage';

export default function TestFeedbackPage() {
  const { t, language } = useLanguage();
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
      alert(t('course.courseNotFound'));
      router.push('/courses');
      return;
    }

    const loadedTest = loadedCourse.tests.find(t => t.id === testId);
    if (!loadedTest) {
      alert(t('test.testNotFound'));
      router.push(`/course/${courseId}`);
      return;
    }

    setCourse(loadedCourse);
    setTest(loadedTest);
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

  const handleSaveTest = () => {
    if (test) {
      updateTest(courseId, testId, test);
      alert(t('test.testConfigSaved'));
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
    loadData();
  };

  const handleUpdateIndividualComment = (comment: string) => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      individualComment: comment,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
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
    alert(t('test.feedbackMarkedComplete'));
  };

  const handleUnmarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      completedDate: undefined,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
  };

  const handleExportAllPDFs = async () => {
    if (!test || !course) return;

    const completedFeedbacks = test.studentFeedbacks.filter(f => f.completedDate);

    if (completedFeedbacks.length === 0) {
      alert(t('test.noCompletedFeedback'));
      return;
    }

    const confirmExport = confirm(
      t('test.exportPDFsConfirm').replace('{count}', completedFeedbacks.length.toString())
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
      alert(t('test.exportComplete').replace('{success}', successCount.toString()).replace('{failed}', failCount.toString()));
    } else {
      alert(t('test.exportSuccess').replace('{count}', successCount.toString()));
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
      alert(t('test.pdfCompiledSuccess'));
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
      setTest({ ...test, generalComment: newValue });
    } else if (!isGeneral && currentFeedback && selectedStudent) {
      const updatedFeedback = {
        ...currentFeedback,
        individualComment: newValue,
      };
      updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
      setCurrentFeedback(updatedFeedback);
      loadData();
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
      setTest({ ...test, generalComment: newValue });
    } else if (!isGeneral && currentFeedback && selectedStudent) {
      const updatedFeedback = {
        ...currentFeedback,
        individualComment: newValue,
      };
      updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
      setCurrentFeedback(updatedFeedback);
      loadData();
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
            <h1 className="text-3xl font-display font-bold text-text-primary">{test.name}</h1>
            <p className="text-text-secondary">{course.name}</p>
            {test.description && <p className="text-text-secondary text-sm">{test.description}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveTest}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition"
            >
              <Save size={18} />
              {t('test.saveTestConfig')}
            </button>
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

        {/* Task Configuration - Full Width */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <TaskConfiguration
            tasks={test.tasks}
            onTasksChange={(tasks) => setTest({ ...test, tasks })}
            availableLabels={course.availableLabels}
          />
        </div>

        {/* General Comment - Full Width */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">{t('test.generalCommentTitle')}</h3>
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
          <p className="text-sm text-text-secondary mb-2">{t('test.generalCommentDesc')}</p>
          <textarea
            ref={generalCommentRef}
            value={test.generalComment}
            onChange={(e) => setTest({ ...test, generalComment: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus font-mono text-sm text-text-primary"
            placeholder={t('test.generalCommentPlaceholder')}
          />
        </div>

        {/* Students and Feedback */}
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
                    <h2 className="text-2xl font-display font-bold text-text-primary">{selectedStudent.name}</h2>
                    {selectedStudent.studentNumber && (
                      <p className="text-sm text-text-secondary">{t('test.studentNumber').replace('{number}', selectedStudent.studentNumber)}</p>
                    )}
                    <p className="text-3xl font-display font-bold text-brand mt-2">{currentScore} / 60</p>
                  </div>
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
                          <h4 className="text-lg font-semibold text-text-secondary">{t('test.task')} {task.label}</h4>
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
                                    <select
                                      value={feedback.points}
                                      onChange={(e) =>
                                        handleUpdateFeedback(task.id, subtask.id, { points: Number(e.target.value) })
                                      }
                                      className="px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
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
                                  <label className="font-medium text-text-secondary min-w-[60px]">
                                    {t('test.task')} {task.label}:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-text-secondary">{t('test.pointsLabel')}</label>
                                    <select
                                      value={feedback.points}
                                      onChange={(e) =>
                                        handleUpdateFeedback(task.id, undefined, { points: Number(e.target.value) })
                                      }
                                      className="px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
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
                        <div className="sticky top-4 bg-surface rounded-lg shadow-sm border border-border p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                          <h4 className="text-lg font-display font-semibold text-text-primary mb-3">
                            {t('test.snippetsTitle')}
                          </h4>
                          {activeSubtask ? (
                            <>
                              <p className="text-sm text-text-secondary mb-4">
                                {t('test.snippetsDesc')}
                              </p>
                              <SnippetPicker
                                snippets={allSnippets}
                                onInsert={insertSnippetIntoSubtask}
                                onAddSnippet={handleAddSnippet}
                                onDeleteSnippet={handleDeleteSnippet}
                              />
                            </>
                          ) : (
                            <p className="text-sm text-text-disabled text-center py-8">
                              {t('test.snippetsClickTextarea')}
                            </p>
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
    </main>
  );
}
