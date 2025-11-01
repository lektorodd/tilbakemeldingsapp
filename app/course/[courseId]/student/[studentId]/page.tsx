'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentDetailedAnalytics } from '@/utils/courseStorage';
import { ArrowLeft, TrendingUp, Target, Award, BarChart3, Tag, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StudentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState<ReturnType<typeof getStudentDetailedAnalytics>>(null);

  useEffect(() => {
    const data = getStudentDetailedAnalytics(courseId, studentId);
    if (!data) {
      alert('Student or course not found');
      router.push(`/course/${courseId}`);
      return;
    }
    setAnalytics(data);
  }, [courseId, studentId]);

  if (!analytics) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center">Loading...</div>;
  }

  const { student, course, testPerformance, labelPerformance, categoryPerformance, partPerformance, overallStats } = analytics;

  const getScoreColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'text-emerald-600'; // 5/6 = 83%
    if (percentage >= 58) return 'text-yellow-600'; // 3.5/6 = 58%
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'bg-emerald-100';
    if (percentage >= 58) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-2"
          >
            <ArrowLeft size={20} />
            {t('common.back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{course.name}</p>
          {student.studentNumber && (
            <p className="text-sm text-gray-500">{t('course.studentNumber')}: {student.studentNumber}</p>
          )}
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-rose-600" />
              <h3 className="font-semibold text-gray-800">{t('dashboard.avgScore')}</h3>
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
              {overallStats.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">/ 60</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-emerald-600" />
              <h3 className="font-semibold text-gray-800">{t('dashboard.completedTests')}</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {overallStats.completedTests}
            </p>
            <p className="text-sm text-gray-600">/ {overallStats.totalTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-violet-600" />
              <h3 className="font-semibold text-gray-800">{t('dashboard.attemptRate')}</h3>
            </div>
            <p className="text-3xl font-bold text-violet-600">
              {overallStats.averageAttemptRate.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.tasksAttempted')}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-800">{t('dashboard.progress')}</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {testPerformance.length > 0 && testPerformance[testPerformance.length - 1].score > 0
                ? testPerformance[testPerformance.length - 1].score
                : '-'}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.latestTest')}</p>
          </div>
        </div>

        {/* Test Performance Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('dashboard.performanceAcrossTests')}</h2>

          {testPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('course.noTests')}</p>
          ) : (
            <div className="space-y-3">
              {testPerformance.map(test => (
                <div key={test.testId} className="flex gap-3">
                  {/* Test card - 85% width */}
                  <Link
                    href={`/course/${courseId}/test/${test.testId}?student=${studentId}`}
                    className="flex-[0.85] border border-gray-200 rounded-lg p-4 hover:border-rose-500 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 hover:text-rose-600 transition">{test.testName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(test.testDate).toLocaleDateString('nb-NO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                          {test.score} / {test.maxScore}
                        </p>
                        {test.completed ? (
                          <p className="text-xs text-emerald-600">{t('test.completed')}</p>
                        ) : (
                          <p className="text-xs text-gray-500">{t('test.notCompleted')}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${test.score >= 50 ? 'bg-emerald-600' : test.score >= 35 ? 'bg-yellow-600' : 'bg-red-600'}`}
                          style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Attempt rate */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('dashboard.tasksAttempted')}:</span>
                      <span className="font-medium text-gray-800">
                        {test.tasksAttempted} / {test.totalTasks} ({test.attemptPercentage.toFixed(0)}%)
                      </span>
                    </div>
                  </Link>

                  {/* Score distribution histogram box - 15% width */}
                  <div className="flex-[0.15] border border-gray-200 rounded-lg p-2 bg-amber-50">
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-end gap-0.5 flex-1 mb-1" style={{ minHeight: '60px' }}>
                        {(() => {
                          // Use the same color as the progress bar for all histogram bars
                          const barColor = test.score >= 50 ? 'bg-emerald-600' : test.score >= 35 ? 'bg-yellow-600' : 'bg-red-600';

                          return [0, 1, 2, 3, 4, 5, 6].map(score => {
                            const count = test.scoreDistribution[score] || 0;
                            const maxCount = Math.max(...Object.values(test.scoreDistribution));
                            const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

                            return (
                              <div
                                key={score}
                                className="flex-1 relative group h-full"
                                title={`${count} task${count !== 1 ? 's' : ''} with ${score} points`}
                              >
                                <div className="h-full flex flex-col justify-end">
                                  <div
                                    className={`${count > 0 ? barColor : 'bg-gray-300'} rounded-t transition-all`}
                                    style={{ height: count > 0 ? `${heightPercent}%` : '2px' }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      {/* Labels for histogram */}
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4, 5, 6].map(score => (
                          <div key={score} className="flex-1 text-center text-xs text-gray-600">
                            {score}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance by Theme Labels */}
        {labelPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-violet-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.performanceByTheme')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labelPerformance.map(label => (
                <div key={label.label} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-violet-600 text-white rounded-full text-sm font-medium">
                      {label.label}
                    </span>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${label.averageScore >= 5 ? 'text-emerald-600' : label.averageScore >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {label.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{label.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        label.averageScore >= 5 ? 'bg-emerald-600' :
                        label.averageScore >= 3.5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(label.averageScore / 6) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance by Category */}
        {categoryPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={24} className="text-rose-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.performanceByCategory')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryPerformance.map(cat => (
                <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{cat.description}</h3>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cat.averageScore >= 5 ? 'text-emerald-600' : cat.averageScore >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {cat.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{cat.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        cat.averageScore >= 5 ? 'bg-emerald-600' :
                        cat.averageScore >= 3.5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(cat.averageScore / 6) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance by Part (No aids vs All aids) */}
        {partPerformance && partPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={24} className="text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.performanceByPart')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partPerformance.map(part => (
                <div key={part.part} className={`border-2 rounded-lg p-6 ${
                  part.part === 1 ? 'border-orange-300 bg-orange-50' : 'border-blue-300 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{part.part === 1 ? t('dashboard.part1NoAids') : t('dashboard.part2AllAids')}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {part.part === 1 ? t('dashboard.noAidsPencilOnly') : t('dashboard.allAidsAllowed')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${part.averageScore >= 5 ? 'text-emerald-600' : part.averageScore >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {part.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{part.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        part.averageScore >= 5 ? 'bg-emerald-600' :
                        part.averageScore >= 3.5 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${(part.averageScore / 6) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison insight */}
            {partPerformance.length === 2 && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>{t('dashboard.comparison')}:</strong>{' '}
                  {partPerformance[0].averageScore > partPerformance[1].averageScore ? (
                    t('dashboard.betterNoAids')
                      .replace('{score1}', partPerformance[0].averageScore.toFixed(1))
                      .replace('{score2}', partPerformance[1].averageScore.toFixed(1))
                  ) : partPerformance[0].averageScore < partPerformance[1].averageScore ? (
                    t('dashboard.betterAllAids')
                      .replace('{score1}', partPerformance[1].averageScore.toFixed(1))
                      .replace('{score2}', partPerformance[0].averageScore.toFixed(1))
                  ) : (
                    t('dashboard.equalPerformance')
                      .replace('{score}', partPerformance[0].averageScore.toFixed(1))
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">{t('dashboard.helpTitle')}</h3>
          <ul className="text-sm text-rose-800 space-y-1">
            <li>• {t('dashboard.helpAttemptRate')}</li>
            <li>• {t('dashboard.helpTheme')}</li>
            <li>• {t('dashboard.helpCategory')}</li>
            <li>• {t('dashboard.helpPart')}</li>
            <li>• {t('dashboard.helpColors')}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
