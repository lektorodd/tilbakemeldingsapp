'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseStudent, CourseTest } from '@/types';
import { loadCourse, saveCourse, addStudentToCourse, deleteStudent, addTestToCourse, deleteTest } from '@/utils/courseStorage';
import { ArrowLeft, Plus, Trash2, Edit, Users, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import LabelManager from '@/components/LabelManager';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CourseDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkAddStudentModal, setShowBulkAddStudentModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
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

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = () => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      alert(t('course.courseNotFound'));
      router.push('/courses');
      return;
    }
    setCourse(loadedCourse);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      alert(t('course.studentNameRequired'));
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

  const handleBulkAddStudents = () => {
    if (!bulkStudentText.trim()) {
      alert(t('course.oneStudentRequired'));
      return;
    }

    // Parse by both newlines and commas
    const names = bulkStudentText
      .split(/[\n,]+/) // Split by newlines or commas
      .map(name => name.trim()) // Trim whitespace
      .filter(name => name.length > 0); // Remove empty strings

    if (names.length === 0) {
      alert(t('course.noValidStudents'));
      return;
    }

    const confirmAdd = confirm(t('course.addStudentsConfirm').replace('{count}', names.length.toString()) + '\n\n' + names.join('\n'));
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
    alert(t('course.studentsAddedSuccess').replace('{count}', addedCount.toString()));
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm(t('course.deleteStudentConfirm'))) {
      deleteStudent(courseId, studentId);
      loadData();
    }
  };

  const handleAddTest = () => {
    if (!newTestName.trim()) {
      alert(t('course.testNameRequired'));
      return;
    }

    if (!newTestDate) {
      alert(t('course.testDateRequired'));
      return;
    }

    let tasks: any[] = [];

    if (newTestHasTwoParts) {
      // Two-part test
      const part1Count = parseInt(newTestPart1Count) || 3;
      const part2Count = parseInt(newTestPart2Count) || 2;

      if (part1Count < 1 || part1Count > 50 || part2Count < 1 || part2Count > 50) {
        alert(t('course.invalidPartTaskCount'));
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
        alert(t('course.invalidTaskCount'));
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

  const handleDeleteTest = (testId: string) => {
    if (confirm(t('course.deleteTestConfirm'))) {
      deleteTest(courseId, testId);
      loadData();
    }
  };

  const handleLabelsChange = (labels: string[]) => {
    if (!course) return;
    const updatedCourse = { ...course, availableLabels: labels };
    saveCourse(updatedCourse);
    setCourse(updatedCourse);
  };

  if (!course) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-2"
            >
              <ArrowLeft size={20} />
              {t('course.backToCourses')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            {course.description && <p className="text-gray-600">{course.description}</p>}
          </div>
          <Link
            href={`/course/${courseId}/analytics`}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
          >
            <BarChart3 size={18} />
            {t('course.viewAnalytics')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={24} className="text-rose-600" />
                <h2 className="text-2xl font-bold text-gray-800">{t('course.students')}</h2>
                <span className="text-gray-600">({course.students.length})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition text-sm"
                >
                  <Plus size={16} />
                  {t('common.add')}
                </button>
                <button
                  onClick={() => setShowBulkAddStudentModal(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-sm"
                >
                  <Users size={16} />
                  {t('course.bulkAdd')}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">{t('course.noStudentsYet')}</p>
              ) : (
                course.students.map(student => (
                  <div
                    key={student.id}
                    className="border border-stone-300 rounded-lg p-3 hover:bg-amber-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{student.name}</h4>
                        {student.studentNumber && (
                          <p className="text-xs text-gray-500">#{student.studentNumber}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <Link
                      href={`/course/${courseId}/student/${student.id}`}
                      className="block text-center px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-sm"
                    >
                      <BarChart3 size={14} className="inline mr-1" />
                      {t('test.viewDashboard')}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tests section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-800">{t('course.tests')}</h2>
                <span className="text-gray-600">({course.tests.length})</span>
              </div>
              <button
                onClick={() => setShowAddTestModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition text-sm"
              >
                <Plus size={16} />
                {t('common.add')}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.tests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">{t('course.noTestsYet')}</p>
              ) : (
                course.tests
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(test => {
                    const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
                    return (
                      <div
                        key={test.id}
                        className="border border-stone-300 rounded-lg p-3 hover:bg-amber-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{test.name}</h4>
                            {test.description && (
                              <p className="text-xs text-gray-600">{test.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(test.date).toLocaleDateString('nb-NO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-rose-600 mt-1">
                              {t('course.completedOf').replace('{completed}', completedCount.toString()).replace('{total}', course.students.length.toString())}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <Link
                          href={`/course/${courseId}/test/${test.id}`}
                          className="block text-center px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition text-sm"
                        >
                          <Edit size={14} className="inline mr-1" />
                          {t('test.giveFeedback')}
                        </Link>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
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
            <h3 className="font-semibold text-gray-900 mb-2">{t('course.courseOverview')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-700">{t('course.totalStudents')}</p>
                <p className="text-2xl font-bold text-rose-700">{course.students.length}</p>
              </div>
              <div>
                <p className="text-gray-700">{t('course.totalTests')}</p>
                <p className="text-2xl font-bold text-emerald-700">{course.tests.length}</p>
              </div>
              <div>
                <p className="text-gray-700">{t('course.possibleFeedback')}</p>
                <p className="text-2xl font-bold text-violet-700">
                  {course.students.length * course.tests.length}
                </p>
              </div>
              <div>
                <p className="text-gray-700">{t('test.completed')}</p>
                <p className="text-2xl font-bold text-amber-700">
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
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('course.addStudentTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.studentNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    placeholder={t('course.studentNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.studentNumberLabel')}
                  </label>
                  <input
                    type="text"
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
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
                  className="flex-1 px-4 py-2 bg-stone-300 text-gray-700 rounded-md hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
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
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('course.bulkAddStudents')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.bulkAddInstructions')}
                  </label>
                  <textarea
                    value={bulkStudentText}
                    onChange={(e) => setBulkStudentText(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 font-mono text-sm"
                    placeholder={t('course.bulkAddPlaceholder')}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
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
                  className="flex-1 px-4 py-2 bg-stone-300 text-gray-700 rounded-md hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleBulkAddStudents}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
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
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('course.addTestTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.testNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    placeholder={t('course.testNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    placeholder={t('course.testDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.testDateLabel')}
                  </label>
                  <input
                    type="date"
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                  />
                </div>

                {/* Two-part test checkbox */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTestHasTwoParts}
                      onChange={(e) => setNewTestHasTwoParts(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('course.twoPart')}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    {t('course.twoPartHelpText')}
                  </p>
                </div>

                {/* Standard task count - only show when NOT two-part */}
                {!newTestHasTwoParts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('course.taskCountLabel')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newTestTaskCount}
                      onChange={(e) => setNewTestTaskCount(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('course.taskNumberingHelp')}</p>
                  </div>
                )}

                {/* Two-part configuration - only show when enabled */}
                {newTestHasTwoParts && (
                  <div className="space-y-3 bg-amber-100 p-4 rounded-md border border-amber-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('course.part1Label')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={newTestPart1Count}
                          onChange={(e) => setNewTestPart1Count(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                          placeholder="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('course.part2Label')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={newTestPart2Count}
                          onChange={(e) => setNewTestPart2Count(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                          placeholder="2"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTestRestartNumbering}
                        onChange={(e) => setNewTestRestartNumbering(e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
                      />
                      <span className="text-sm text-gray-700">
                        {t('course.restartNumbering')}
                      </span>
                    </label>

                    <p className="text-xs text-gray-600">
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
                  className="flex-1 px-4 py-2 bg-stone-300 text-gray-700 rounded-md hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAddTest}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                >
                  {t('course.addTestButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
