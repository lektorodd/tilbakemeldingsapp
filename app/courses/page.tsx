'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { loadAllCourses, deleteCourse, setupAutoSaveDirectory, isAutoSaveEnabled, disableAutoSave, exportAllCourses } from '@/utils/courseStorage';
import { Plus, Trash2, Users, FileText, Settings, Download, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  useEffect(() => {
    loadData();
    setAutoSaveEnabled(isAutoSaveEnabled());
  }, []);

  const loadData = () => {
    const allCourses = loadAllCourses();
    setCourses(allCourses);
  };

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      alert(t('course.courseNameRequired'));
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: newCourseName,
      description: newCourseDescription,
      students: [],
      tests: [],
      availableLabels: [],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const allCourses = loadAllCourses();
    allCourses.push(newCourse);

    if (typeof window !== 'undefined') {
      localStorage.setItem('math-feedback-courses', JSON.stringify(allCourses));
    }

    setNewCourseName('');
    setNewCourseDescription('');
    setShowCreateModal(false);
    loadData();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm(t('course.deleteConfirmFull'))) {
      deleteCourse(courseId);
      loadData();
    }
  };

  const handleSetupAutoSave = async () => {
    const success = await setupAutoSaveDirectory();
    if (success) {
      setAutoSaveEnabled(true);
      alert(t('course.autoSaveEnabled'));
    }
  };

  const handleDisableAutoSave = () => {
    disableAutoSave();
    setAutoSaveEnabled(false);
    alert(t('course.autoSaveDisabled'));
  };

  const handleExportAll = () => {
    const json = exportAllCourses();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-courses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('home.title')}</h1>
            <p className="text-gray-600">{t('home.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
            >
              <Download size={18} />
              {t('course.exportAll')}
            </button>
            <Link
              href="/archive"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
            >
              <FolderOpen size={18} />
              {t('course.oldArchive')}
            </Link>
          </div>
        </div>

        {/* Auto-save settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t('course.autoSaveSettings')}</h3>
                <p className="text-sm text-gray-600">
                  {autoSaveEnabled
                    ? t('course.autoSaveEnabledDesc')
                    : t('course.autoSaveDisabledDesc')}
                </p>
              </div>
            </div>
            {autoSaveEnabled ? (
              <button
                onClick={handleDisableAutoSave}
                className="px-4 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-700 transition"
              >
                {t('course.disableAutoSave')}
              </button>
            ) : (
              <button
                onClick={handleSetupAutoSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
              >
                {t('course.setupAutoSave')}
              </button>
            )}
          </div>
        </div>

        {/* Create new course button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium"
          >
            <Plus size={20} />
            {t('home.createCourse')}
          </button>
        </div>

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('home.noCourses')}</h3>
            <p className="text-gray-600 mb-6">
              {t('home.subtitle')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium"
            >
              <Plus size={20} />
              {t('home.createCourse')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const completedCount = course.tests.reduce((sum, test) =>
                sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0
              );
              const totalPossible = course.students.length * course.tests.length;

              return (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{course.name}</h3>
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t('course.createdDate')}: {new Date(course.createdDate).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users size={18} />
                      <span className="text-sm">
                        {course.students.length} {t('course.students').toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FileText size={18} />
                      <span className="text-sm">
                        {course.tests.length} {t('course.tests').toLowerCase()}
                      </span>
                    </div>
                    {totalPossible > 0 && (
                      <div className="text-sm text-gray-600">
                        {completedCount} / {totalPossible} {t('course.completedFeedback')}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/course/${course.id}`}
                    className="block text-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
                  >
                    {t('course.openCourse')}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Create course modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('course.createCourseTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.courseNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    placeholder={t('home.courseNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    placeholder={t('course.courseDescriptionPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCourseName('');
                    setNewCourseDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 text-gray-700 rounded-md hover:bg-stone-400 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                >
                  {t('course.createCourseButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
