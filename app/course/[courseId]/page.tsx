'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseStudent, CourseTest, OralTest } from '@/types';
import { loadCourse, saveCourse, addStudentToCourse, deleteStudent, addTestToCourse, deleteTest, addOralTest, deleteOralTest, updateCourse, updateTest, updateOralTest } from '@/utils/storage';
import { exportCourseToExcel } from '@/utils/excelExport';
import { ArrowLeft, Plus, Trash2, Edit, Users, FileText, BarChart3, MessageSquare, Download } from 'lucide-react';
import Link from 'next/link';
import LabelManager from '@/components/LabelManager';
import StudentRosterPanel from '@/components/StudentRosterPanel';
import TestListPanel from '@/components/TestListPanel';
import OralTestListPanel from '@/components/OralTestListPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import { groupLabelsByParent, formatLabelDisplay } from '@/utils/labelUtils';

export default function CourseDetailPage() {
  const { t } = useLanguage();
  const { toast, confirm } = useNotification();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkAddStudentModal, setShowBulkAddStudentModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showAddOralTestModal, setShowAddOralTestModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showEditTestModal, setShowEditTestModal] = useState(false);
  const [showEditOralTestModal, setShowEditOralTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<CourseTest | null>(null);
  const [editingOralTest, setEditingOralTest] = useState<OralTest | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [bulkStudentText, setBulkStudentText] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [newTestDate, setNewTestDate] = useState('');
  const [newTestTaskCount, setNewTestTaskCount] = useState('5');
  const [newTestHasTwoParts, setNewTestHasTwoParts] = useState(false);
  const [newTestPart1Count, setNewTestPart1Count] = useState('3');
  const [newTestPart2Count, setNewTestPart2Count] = useState('2');
  const [newTestRestartNumbering, setNewTestRestartNumbering] = useState(false);
  const [newOralTestName, setNewOralTestName] = useState('');
  const [newOralTestDescription, setNewOralTestDescription] = useState('');
  const [newOralTestDate, setNewOralTestDate] = useState('');
  const [newOralTestTopics, setNewOralTestTopics] = useState('');
  const [newOralTestLabels, setNewOralTestLabels] = useState<string[]>([]);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = () => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      toast(t('course.courseNotFound'), 'error');
      router.push('/courses');
      return;
    }
    setCourse(loadedCourse);
  };

  const handleExportToExcel = async () => {
    if (!course) return;

    try {
      await exportCourseToExcel(course);
    } catch (error) {
      console.error('Export failed:', error);
      toast('Failed to export course data. Please try again.', 'error');
    }
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      toast(t('course.studentNameRequired'), 'warning');
      return;
    }

    addStudentToCourse(courseId, {
      name: newStudentName,
      studentNumber: newStudentNumber || undefined,
    });

    setNewStudentName('');
    setNewStudentNumber('');
    setShowAddStudentModal(false);
    loadData();
  };

  const handleBulkAddStudents = async () => {
    if (!bulkStudentText.trim()) {
      toast(t('course.oneStudentRequired'), 'warning');
      return;
    }

    // Parse by both newlines and commas
    const names = bulkStudentText
      .split(/[\n,]+/) // Split by newlines or commas
      .map(name => name.trim()) // Trim whitespace
      .filter(name => name.length > 0); // Remove empty strings

    if (names.length === 0) {
      toast(t('course.noValidStudents'), 'warning');
      return;
    }

    const confirmAdd = await confirm(t('course.addStudentsConfirm').replace('{count}', names.length.toString()) + '\n\n' + names.join('\n'));
    if (!confirmAdd) return;

    let addedCount = 0;
    names.forEach(name => {
      try {
        addStudentToCourse(courseId, { name });
        addedCount++;
      } catch (error) {
        console.error(`Failed to add ${name}:`, error);
      }
    });

    setBulkStudentText('');
    setShowBulkAddStudentModal(false);
    loadData();
    toast(t('course.studentsAddedSuccess').replace('{count}', addedCount.toString()), 'success');
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (await confirm(t('course.deleteStudentConfirm'))) {
      deleteStudent(courseId, studentId);
      loadData();
    }
  };

  const handleAddTest = () => {
    if (!newTestName.trim()) {
      toast(t('course.testNameRequired'), 'warning');
      return;
    }

    if (!newTestDate) {
      toast(t('course.testDateRequired'), 'warning');
      return;
    }

    let tasks: any[] = [];

    if (newTestHasTwoParts) {
      // Two-part test
      const part1Count = parseInt(newTestPart1Count) || 3;
      const part2Count = parseInt(newTestPart2Count) || 2;

      if (part1Count < 1 || part1Count > 50 || part2Count < 1 || part2Count > 50) {
        toast(t('course.invalidPartTaskCount'), 'warning');
        return;
      }

      // Generate Part 1 tasks (no aids)
      for (let i = 0; i < part1Count; i++) {
        tasks.push({
          id: `task-${i + 1}`,
          label: String(i + 1),
          subtasks: [],
          hasSubtasks: false,
          labels: [],
          category: undefined,
          part: 1,
        });
      }

      // Generate Part 2 tasks (all aids)
      for (let i = 0; i < part2Count; i++) {
        const taskNumber = newTestRestartNumbering ? i + 1 : part1Count + i + 1;
        tasks.push({
          id: `task-${part1Count + i + 1}`,
          label: String(taskNumber),
          subtasks: [],
          hasSubtasks: false,
          labels: [],
          category: undefined,
          part: 2,
        });
      }

      addTestToCourse(courseId, {
        name: newTestName,
        description: newTestDescription || undefined,
        date: newTestDate,
        tasks,
        generalComment: '',
        hasTwoParts: true,
        part1TaskCount: part1Count,
        part2TaskCount: part2Count,
        restartNumberingInPart2: newTestRestartNumbering,
      });
    } else {
      // Single-part test (traditional)
      const taskCount = parseInt(newTestTaskCount) || 5;
      if (taskCount < 1 || taskCount > 50) {
        toast(t('course.invalidTaskCount'), 'warning');
        return;
      }

      tasks = Array.from({ length: taskCount }, (_, i) => ({
        id: `task-${i + 1}`,
        label: String(i + 1),
        subtasks: [],
        hasSubtasks: false,
        labels: [],
        category: undefined,
      }));

      addTestToCourse(courseId, {
        name: newTestName,
        description: newTestDescription || undefined,
        date: newTestDate,
        tasks,
        generalComment: '',
      });
    }

    setNewTestName('');
    setNewTestDescription('');
    setNewTestDate('');
    setNewTestTaskCount('5');
    setNewTestHasTwoParts(false);
    setNewTestPart1Count('3');
    setNewTestPart2Count('2');
    setNewTestRestartNumbering(false);
    setShowAddTestModal(false);
    loadData();
  };

  const handleDeleteTest = async (testId: string) => {
    if (await confirm(t('course.deleteTestConfirm'))) {
      deleteTest(courseId, testId);
      loadData();
    }
  };

  const handleAddOralTest = () => {
    if (!newOralTestName.trim()) {
      toast(t('course.oralTestNameRequired'), 'warning');
      return;
    }

    if (!newOralTestDate) {
      toast(t('course.oralTestDateRequired'), 'warning');
      return;
    }

    const topics = newOralTestTopics
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const oralTest: OralTest = {
      id: `oral-test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: newOralTestName,
      description: newOralTestDescription || undefined,
      date: newOralTestDate,
      topics: topics.length > 0 ? topics : undefined,
      labels: newOralTestLabels.length > 0 ? newOralTestLabels : undefined,
      studentAssessments: [],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    addOralTest(courseId, oralTest);

    setNewOralTestName('');
    setNewOralTestDescription('');
    setNewOralTestDate('');
    setNewOralTestTopics('');
    setNewOralTestLabels([]);
    setShowAddOralTestModal(false);
    loadData();
  };

  const handleDeleteOralTest = async (oralTestId: string) => {
    if (await confirm(t('course.deleteOralTestConfirm'))) {
      deleteOralTest(courseId, oralTestId);
      loadData();
    }
  };

  const handleLabelsChange = (labels: string[]) => {
    if (!course) return;
    const updatedCourse = { ...course, availableLabels: labels };
    saveCourse(updatedCourse);
    setCourse(updatedCourse);
  };

  const handleEditCourse = () => {
    if (!course) return;
    setEditCourseName(course.name);
    setEditCourseDescription(course.description || '');
    setShowEditCourseModal(true);
  };

  const handleUpdateCourse = () => {
    if (!editCourseName.trim()) {
      toast(t('course.courseNameRequired'), 'warning');
      return;
    }

    updateCourse(courseId, {
      name: editCourseName,
      description: editCourseDescription || undefined,
    });

    setShowEditCourseModal(false);
    loadData();
  };

  const handleEditTest = (test: CourseTest) => {
    setEditingTest(test);
    setNewTestName(test.name);
    setNewTestDescription(test.description || '');
    setNewTestDate(test.date);
    setShowEditTestModal(true);
  };

  const handleUpdateTest = () => {
    if (!editingTest) return;
    if (!newTestName.trim()) {
      toast(t('course.testNameRequired'), 'warning');
      return;
    }
    if (!newTestDate) {
      toast(t('course.testDateRequired'), 'warning');
      return;
    }

    updateTest(courseId, editingTest.id, {
      name: newTestName,
      description: newTestDescription || undefined,
      date: newTestDate,
    });

    setShowEditTestModal(false);
    setEditingTest(null);
    setNewTestName('');
    setNewTestDescription('');
    setNewTestDate('');
    loadData();
  };

  const handleEditOralTest = (oralTest: OralTest) => {
    setEditingOralTest(oralTest);
    setNewOralTestName(oralTest.name);
    setNewOralTestDescription(oralTest.description || '');
    setNewOralTestDate(oralTest.date);
    setNewOralTestTopics(oralTest.topics?.join(', ') || '');
    setNewOralTestLabels(oralTest.labels || []);
    setShowEditOralTestModal(true);
  };

  const handleUpdateOralTest = () => {
    if (!editingOralTest) return;
    if (!newOralTestName.trim()) {
      toast(t('course.oralTestNameRequired'), 'warning');
      return;
    }
    if (!newOralTestDate) {
      toast(t('course.oralTestDateRequired'), 'warning');
      return;
    }

    const topics = newOralTestTopics
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    updateOralTest(courseId, editingOralTest.id, {
      name: newOralTestName,
      description: newOralTestDescription || undefined,
      date: newOralTestDate,
      topics: topics.length > 0 ? topics : undefined,
      labels: newOralTestLabels.length > 0 ? newOralTestLabels : undefined,
    });

    setShowEditOralTestModal(false);
    setEditingOralTest(null);
    setNewOralTestName('');
    setNewOralTestDescription('');
    setNewOralTestDate('');
    setNewOralTestTopics('');
    setNewOralTestLabels([]);
    loadData();
  };

  if (!course) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-brand hover:text-brand-hover mb-2"
            >
              <ArrowLeft size={20} />
              {t('course.backToCourses')}
            </Link>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-display font-bold text-text-primary">{course.name}</h1>
                {course.description && <p className="text-text-secondary">{course.description}</p>}
              </div>
              <button
                onClick={handleEditCourse}
                className="p-2 text-brand hover:bg-rose-50 rounded transition"
                title="Edit course details"
              >
                <Edit size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download size={18} />
              Export to CSV/Excel
            </button>
            <Link
              href={`/course/${courseId}/analytics`}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
            >
              <BarChart3 size={18} />
              {t('course.viewAnalytics')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentRosterPanel
            courseId={courseId}
            students={course.students}
            onAddStudent={() => setShowAddStudentModal(true)}
            onBulkAdd={() => setShowBulkAddStudentModal(true)}
            onDeleteStudent={handleDeleteStudent}
          />

          <TestListPanel
            courseId={courseId}
            tests={course.tests}
            studentCount={course.students.length}
            onAddTest={() => setShowAddTestModal(true)}
            onEditTest={handleEditTest}
            onDeleteTest={handleDeleteTest}
          />

          <OralTestListPanel
            courseId={courseId}
            oralTests={course.oralTests || []}
            studentCount={course.students.length}
            onAddOralTest={() => setShowAddOralTestModal(true)}
            onEditOralTest={handleEditOralTest}
            onDeleteOralTest={handleDeleteOralTest}
          />
        </div>

        {/* Label Manager */}
        <div className="mt-6">
          <LabelManager
            labels={course.availableLabels}
            onLabelsChange={handleLabelsChange}
          />
        </div>

        {/* Quick stats */}
        {course.students.length > 0 && course.tests.length > 0 && (
          <div className="mt-6 bg-amber-100 border border-amber-300 rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-2">{t('course.courseOverview')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">{t('course.totalStudents')}</p>
                <p className="text-2xl font-display font-bold text-brand-hover">{course.students.length}</p>
              </div>
              <div>
                <p className="text-text-secondary">{t('course.totalTests')}</p>
                <p className="text-2xl font-display font-bold text-emerald-700">{course.tests.length}</p>
              </div>
              <div>
                <p className="text-text-secondary">{t('course.possibleFeedback')}</p>
                <p className="text-2xl font-display font-bold text-primary-700">
                  {course.students.length * course.tests.length}
                </p>
              </div>
              <div>
                <p className="text-text-secondary">{t('test.completed')}</p>
                <p className="text-2xl font-display font-bold text-amber-700">
                  {course.tests.reduce((sum, test) =>
                    sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add student modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.addStudentTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.studentNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                    placeholder={t('course.studentNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.studentNumberLabel')}
                  </label>
                  <input
                    type="text"
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                    placeholder={t('course.studentNumberPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setNewStudentName('');
                    setNewStudentNumber('');
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                >
                  {t('course.addStudentButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk add students modal */}
        {showBulkAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.bulkAddStudents')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.bulkAddInstructions')}
                  </label>
                  <textarea
                    value={bulkStudentText}
                    onChange={(e) => setBulkStudentText(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary font-mono text-sm"
                    placeholder={t('course.bulkAddPlaceholder')}
                    autoFocus
                  />
                  <p className="text-xs text-text-disabled mt-1">
                    {t('course.bulkAddHelpText')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkAddStudentModal(false);
                    setBulkStudentText('');
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleBulkAddStudents}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                >
                  {t('course.addStudentsButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add test modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.addTestTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.testNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                    placeholder={t('course.testNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                    placeholder={t('course.testDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.testDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                  />
                </div>

                {/* Two-part test checkbox */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTestHasTwoParts}
                      onChange={(e) => setNewTestHasTwoParts(e.target.checked)}
                      className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus"
                    />
                    <span className="text-sm font-medium text-text-secondary">
                      {t('course.twoPart')}
                    </span>
                  </label>
                  <p className="text-xs text-text-disabled mt-1 ml-6">
                    {t('course.twoPartHelpText')}
                  </p>
                </div>

                {/* Standard task count - only show when NOT two-part */}
                {!newTestHasTwoParts && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {t('course.taskCountLabel')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newTestTaskCount}
                      onChange={(e) => setNewTestTaskCount(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                      placeholder="5"
                    />
                    <p className="text-xs text-text-disabled mt-1">{t('course.taskNumberingHelp')}</p>
                  </div>
                )}

                {/* Two-part configuration - only show when enabled */}
                {newTestHasTwoParts && (
                  <div className="space-y-3 bg-amber-100 p-4 rounded-lg border border-amber-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {t('course.part1Label')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={newTestPart1Count}
                          onChange={(e) => setNewTestPart1Count(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                          placeholder="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {t('course.part2Label')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={newTestPart2Count}
                          onChange={(e) => setNewTestPart2Count(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary"
                          placeholder="2"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTestRestartNumbering}
                        onChange={(e) => setNewTestRestartNumbering(e.target.checked)}
                        className="w-4 h-4 text-brand rounded focus:ring-2 focus:ring-focus"
                      />
                      <span className="text-sm text-text-secondary">
                        {t('course.restartNumbering')}
                      </span>
                    </label>

                    <p className="text-xs text-text-secondary">
                      {newTestRestartNumbering
                        ? `${t('course.part1Tasks')}: 1-${newTestPart1Count || 3}, ${t('course.part2Tasks')}: 1-${newTestPart2Count || 2}`
                        : `${t('course.part1Tasks')}: 1-${newTestPart1Count || 3}, ${t('course.part2Tasks')}: ${(parseInt(newTestPart1Count) || 3) + 1}-${(parseInt(newTestPart1Count) || 3) + (parseInt(newTestPart2Count) || 2)}`
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddTestModal(false);
                    setNewTestName('');
                    setNewTestDescription('');
                    setNewTestDate('');
                    setNewTestTaskCount('5');
                    setNewTestHasTwoParts(false);
                    setNewTestPart1Count('3');
                    setNewTestPart2Count('2');
                    setNewTestRestartNumbering(false);
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddTest}
                  className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition"
                >
                  {t('course.addTestButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add oral test modal */}
        {showAddOralTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.addOralTestTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestName}
                    onChange={(e) => setNewOralTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    placeholder={t('course.oralTestNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestDescription}
                    onChange={(e) => setNewOralTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    placeholder={t('course.oralTestDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={newOralTestDate}
                    onChange={(e) => setNewOralTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestTopicsLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestTopics}
                    onChange={(e) => setNewOralTestTopics(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    placeholder={t('course.oralTestTopicsPlaceholder')}
                  />
                  <p className="text-xs text-text-disabled mt-1">
                    {t('course.oralTestTopicsHelp')}
                  </p>
                </div>

                {/* Labels selector */}
                {course.availableLabels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {t('course.themeLabels')} (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groupLabelsByParent(course.availableLabels).map(group => (
                        <React.Fragment key={group.parent ?? '__ungrouped'}>
                          {group.parent && (
                            <span className="text-xs font-medium text-text-disabled self-center ml-1 first:ml-0">{group.parent}/</span>
                          )}
                          {group.children.map(label => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                if (newOralTestLabels.includes(label)) {
                                  setNewOralTestLabels(newOralTestLabels.filter(l => l !== label));
                                } else {
                                  setNewOralTestLabels([...newOralTestLabels, label]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition ${newOralTestLabels.includes(label)
                                ? 'bg-primary-600 text-white'
                                : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                }`}
                            >
                              {formatLabelDisplay(label)}
                            </button>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddOralTestModal(false);
                    setNewOralTestName('');
                    setNewOralTestDescription('');
                    setNewOralTestDate('');
                    setNewOralTestTopics('');
                    setNewOralTestLabels([]);
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddOralTest}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {t('course.addOralTestButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course modal */}
        {showEditCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Edit Course</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.courseNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={editCourseDescription}
                    onChange={(e) => setEditCourseDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                    placeholder={t('course.courseDescriptionPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditCourseModal(false)}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateCourse}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Test modal */}
        {showEditTestModal && editingTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Edit Test</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.testNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                    placeholder={t('course.testDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.testDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditTestModal(false);
                    setEditingTest(null);
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateTest}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Oral Test modal */}
        {showEditOralTestModal && editingOralTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Edit Oral Assessment</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestName}
                    onChange={(e) => setNewOralTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestDescription}
                    onChange={(e) => setNewOralTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    placeholder={t('course.oralTestDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={newOralTestDate}
                    onChange={(e) => setNewOralTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {t('course.oralTestTopicsLabel')}
                  </label>
                  <input
                    type="text"
                    value={newOralTestTopics}
                    onChange={(e) => setNewOralTestTopics(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    placeholder={t('course.oralTestTopicsPlaceholder')}
                  />
                  <p className="text-xs text-text-disabled mt-1">
                    {t('course.oralTestTopicsHelp')}
                  </p>
                </div>

                {/* Labels selector */}
                {course.availableLabels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {t('course.themeLabels')} (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groupLabelsByParent(course.availableLabels).map(group => (
                        <React.Fragment key={group.parent ?? '__ungrouped'}>
                          {group.parent && (
                            <span className="text-xs font-medium text-text-disabled self-center ml-1 first:ml-0">{group.parent}/</span>
                          )}
                          {group.children.map(label => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                if (newOralTestLabels.includes(label)) {
                                  setNewOralTestLabels(newOralTestLabels.filter(l => l !== label));
                                } else {
                                  setNewOralTestLabels([...newOralTestLabels, label]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition ${newOralTestLabels.includes(label)
                                ? 'bg-primary-600 text-white'
                                : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                }`}
                            >
                              {formatLabelDisplay(label)}
                            </button>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditOralTestModal(false);
                    setEditingOralTest(null);
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-text-secondary rounded-lg hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateOralTest}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
