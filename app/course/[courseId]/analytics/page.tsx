'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, LabelPerformance, CategoryPerformance } from '@/types';
import { loadCourse, getLabelPerformance, getCategoryPerformance } from '@/utils/courseStorage';
import { ArrowLeft, Tag, BarChart3, TrendingUp, Users, FileText, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CourseAnalyticsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [labelPerformance, setLabelPerformance] = useState<LabelPerformance[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

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
    setLabelPerformance(getLabelPerformance(courseId));
    setCategoryPerformance(getCategoryPerformance(courseId));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 5) return 'text-green-600';
    if (score >= 3.5) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 5) return 'bg-green-100';
    if (score >= 3.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!course) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  const selectedLabelData = selectedLabel ? labelPerformance.find(lp => lp.label === selectedLabel) : null;

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-brand hover:text-rose-800 mb-2"
          >
            <ArrowLeft size={20} />
            {t('analytics.backToCourse')}
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary">{t('analytics.courseAnalyticsTitle').replace('{courseName}', course.name)}</h1>
          <p className="text-text-secondary">{t('analytics.performanceAnalysisDesc')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-brand" />
              <h3 className="font-semibold text-text-primary">{t('course.totalStudents')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-brand">{course.students.length}</p>
          </div>

          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-success" />
              <h3 className="font-semibold text-text-primary">{t('course.totalTests')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-success">{course.tests.length}</p>
          </div>

          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={20} className="text-brand" />
              <h3 className="font-semibold text-text-primary">{t('analytics.totalLabels')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-brand">{course.availableLabels.length}</p>
          </div>

          {course.oralTests && course.oralTests.length > 0 && (
            <div className="bg-surface rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle size={20} className="text-violet-600" />
                <h3 className="font-semibold text-text-primary">{t('course.oralTests')}</h3>
              </div>
              <p className="text-3xl font-display font-bold text-violet-600">{course.oralTests.length}</p>
            </div>
          )}
        </div>

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Test Analytics Links */}
          {course.tests.length > 0 && (
            <div className="bg-surface rounded-lg shadow-sm p-6 border-2 border-violet-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={24} className="text-brand" />
                <h2 className="text-xl font-display font-bold text-text-primary">{t('test.taskAnalyticsTitle')}</h2>
              </div>
              <p className="text-sm text-text-secondary mb-4">{t('analytics.testAnalyticsDesc')}</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {course.tests
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(test => {
                    const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
                    return (
                      <Link
                        key={test.id}
                        href={`/course/${courseId}/test/${test.id}/analytics`}
                        className="block p-3 border border-border rounded-lg hover:border-brand hover:bg-violet-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary group-hover:text-brand transition">
                              {test.name}
                            </h3>
                            <p className="text-xs text-text-disabled">
                              {new Date(test.date).toLocaleDateString()} • {completedCount} {t('course.completedFeedback')}
                            </p>
                          </div>
                          <BarChart3 size={20} className="text-text-disabled group-hover:text-brand transition" />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Student Dashboard Links */}
          {course.students.length > 0 && (
            <div className="bg-surface rounded-lg shadow-sm p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-4">
                <Users size={24} className="text-success" />
                <h2 className="text-xl font-display font-bold text-text-primary">{t('dashboard.title')}</h2>
              </div>
              <p className="text-sm text-text-secondary mb-4">{t('analytics.studentDashboardsDesc')}</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {course.students
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(student => {
                    // Calculate completed tests for this student
                    const completedTests = course.tests.filter(test =>
                      test.studentFeedbacks.some(f => f.studentId === student.id && f.completedDate)
                    ).length;

                    return (
                      <Link
                        key={student.id}
                        href={`/course/${courseId}/student/${student.id}`}
                        className="block p-3 border border-border rounded-lg hover:border-success hover:bg-emerald-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary group-hover:text-success transition">
                              {student.name}
                            </h3>
                            <p className="text-xs text-text-disabled">
                              {completedTests} / {course.tests.length} {t('course.tests')}
                            </p>
                          </div>
                          <UserCircle size={20} className="text-text-disabled group-hover:text-success transition" />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Label Performance */}
        {labelPerformance.length > 0 ? (
          <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('analytics.performanceByLabel')}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Label Summary */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">{t('analytics.overallPerformance')}</h3>
                <div className="space-y-2">
                  {labelPerformance.map(lp => (
                    <div
                      key={lp.label}
                      className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedLabel === lp.label
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-border hover:border-violet-300'
                      }`}
                      onClick={() => setSelectedLabel(lp.label === selectedLabel ? null : lp.label)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-brand text-white rounded-full text-sm font-medium">
                            {lp.label}
                          </span>
                          <span className="text-xs text-text-disabled">{t('analytics.tasksCount').replace('{count}', lp.taskCount.toString())}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(lp.averageScore)}`}>
                            {lp.averageScore.toFixed(1)}
                          </span>
                          <span className="text-text-disabled text-sm">/ 6</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBgColor(lp.averageScore)} border-r-4 ${
                            lp.averageScore >= 5 ? 'border-emerald-600' :
                            lp.averageScore >= 3.5 ? 'border-amber-600' : 'border-red-600'
                          }`}
                          style={{ width: `${(lp.averageScore / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Performance for Selected Label */}
              <div>
                {selectedLabelData ? (
                  <>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      {t('analytics.studentPerformance')}: <span className="text-brand">{selectedLabelData.label}</span>
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedLabelData.studentScores.length > 0 ? (
                        selectedLabelData.studentScores.map(ss => (
                          <div key={ss.studentId} className="p-3 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-text-primary">{ss.studentName}</span>
                              <span className={`text-xl font-bold ${getScoreColor(ss.averageScore)}`}>
                                {ss.averageScore.toFixed(1)} / 6
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-disabled">
                              <span>{t('analytics.tasksCompleted').replace('{count}', ss.completedTasks.toString())}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  ss.averageScore >= 5 ? 'bg-success' :
                                  ss.averageScore >= 3.5 ? 'bg-amber-600' : 'bg-danger'
                                }`}
                                style={{ width: `${(ss.averageScore / 6) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-text-disabled text-center py-4">{t('analytics.noStudentDataForLabel')}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-disabled">
                    <div className="text-center">
                      <Tag size={48} className="mx-auto mb-2 opacity-50" />
                      <p>{t('analytics.clickLabelPrompt')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('analytics.performanceByLabel')}</h2>
            </div>
            <p className="text-text-disabled text-center py-8">
              {t('analytics.noLabelData')}
            </p>
          </div>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 ? (
          <div className="bg-surface rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('analytics.performanceByCategory')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {categoryPerformance.map(cp => (
                <div key={cp.category} className="p-4 border-2 border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{t(`dashboard.category${cp.category}Name`)}</h3>
                      <p className="text-xs text-text-disabled">{t('analytics.tasksCount').replace('{count}', cp.taskCount.toString())}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(cp.averageScore)}`}>
                        {cp.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-text-disabled">/ 6</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-3 bg-stone-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        cp.averageScore >= 5 ? 'bg-success' :
                        cp.averageScore >= 3.5 ? 'bg-amber-600' : 'bg-danger'
                      }`}
                      style={{ width: `${(cp.averageScore / 6) * 100}%` }}
                    />
                  </div>

                  {/* Category short title */}
                  <p className="text-xs text-text-disabled italic mt-2">
                    {t(`test.category${cp.category}Short`)}
                  </p>
                </div>
              ))}
            </div>

            {/* Category explanation from national exam guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">{t('dashboard.helpCategory')}</p>
              <div className="space-y-2 text-blue-800">
                <div>
                  <strong>{t('dashboard.category1Name')}:</strong> {t('dashboard.category1Description')}
                </div>
                <div>
                  <strong>{t('dashboard.category2Name')}:</strong> {t('dashboard.category2Description')}
                </div>
                <div>
                  <strong>{t('dashboard.category3Name')}:</strong> {t('dashboard.category3Description')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('analytics.performanceByCategory')}</h2>
            </div>
            <p className="text-text-disabled text-center py-8">
              {t('analytics.noCategoryData')}
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-violet-50 border border-violet-200 rounded-lg p-4">
          <h3 className="font-semibold text-violet-900 mb-2">{t('analytics.howToUseAnalytics')}</h3>
          <ul className="text-sm text-violet-800 space-y-1">
            <li>• {t('analytics.analyticsHelp1')}</li>
            <li>• {t('analytics.analyticsHelp2')}</li>
            <li>• {t('analytics.analyticsHelp3')}</li>
            <li>• {t('analytics.analyticsHelp4')}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
