'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, LabelPerformance, CategoryPerformance } from '@/types';
import { loadCourse, getLabelPerformance, getCategoryPerformance } from '@/utils/courseStorage';
import { ArrowLeft, Tag, BarChart3, TrendingUp, Users } from 'lucide-react';
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
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 5) return 'bg-green-100';
    if (score >= 3.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!course) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">{t('common.loading')}</div>;
  }

  const selectedLabelData = selectedLabel ? labelPerformance.find(lp => lp.label === selectedLabel) : null;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeft size={20} />
            {t('analytics.backToCourse')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics.courseAnalyticsTitle').replace('{courseName}', course.name)}</h1>
          <p className="text-gray-600">{t('analytics.performanceAnalysisDesc')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">{t('course.totalStudents')}</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{course.students.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">{t('course.totalTests')}</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{course.tests.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">{t('analytics.totalLabels')}</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{course.availableLabels.length}</p>
          </div>
        </div>

        {/* Label Performance */}
        {labelPerformance.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('analytics.performanceByLabel')}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Label Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('analytics.overallPerformance')}</h3>
                <div className="space-y-2">
                  {labelPerformance.map(lp => (
                    <div
                      key={lp.label}
                      className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                        selectedLabel === lp.label
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedLabel(lp.label === selectedLabel ? null : lp.label)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                            {lp.label}
                          </span>
                          <span className="text-xs text-gray-500">{t('analytics.tasksCount').replace('{count}', lp.taskCount.toString())}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(lp.averageScore)}`}>
                            {lp.averageScore.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-sm">/ 6</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBgColor(lp.averageScore)} border-r-4 ${
                            lp.averageScore >= 5 ? 'border-green-600' :
                            lp.averageScore >= 3.5 ? 'border-yellow-600' : 'border-red-600'
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {t('analytics.studentPerformance')}: <span className="text-purple-600">{selectedLabelData.label}</span>
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedLabelData.studentScores.length > 0 ? (
                        selectedLabelData.studentScores.map(ss => (
                          <div key={ss.studentId} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800">{ss.studentName}</span>
                              <span className={`text-xl font-bold ${getScoreColor(ss.averageScore)}`}>
                                {ss.averageScore.toFixed(1)} / 6
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{t('analytics.tasksCompleted').replace('{count}', ss.completedTasks.toString())}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  ss.averageScore >= 5 ? 'bg-green-600' :
                                  ss.averageScore >= 3.5 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${(ss.averageScore / 6) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">{t('analytics.noStudentDataForLabel')}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('analytics.performanceByLabel')}</h2>
            </div>
            <p className="text-gray-500 text-center py-8">
              {t('analytics.noLabelData')}
            </p>
          </div>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('analytics.performanceByCategory')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryPerformance.map(cp => (
                <div key={cp.category} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{cp.description}</h3>
                      <p className="text-xs text-gray-500">{t('analytics.tasksCount').replace('{count}', cp.taskCount.toString())}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(cp.averageScore)}`}>
                        {cp.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        cp.averageScore >= 5 ? 'bg-green-600' :
                        cp.averageScore >= 3.5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(cp.averageScore / 6) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('analytics.categoryGuide')}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('analytics.performanceByCategory')}</h2>
            </div>
            <p className="text-gray-500 text-center py-8">
              {t('analytics.noCategoryData')}
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">{t('analytics.howToUseAnalytics')}</h3>
          <ul className="text-sm text-purple-800 space-y-1">
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
