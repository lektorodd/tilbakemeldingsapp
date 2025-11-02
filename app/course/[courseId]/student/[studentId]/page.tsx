'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentDetailedAnalytics, loadCourse } from '@/utils/courseStorage';
import { ArrowLeft, TrendingUp, Target, Award, BarChart3, Tag, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import RadarChart from '@/components/RadarChart';
import ScoringGuide from '@/components/ScoringGuide';
import type { CourseStudent } from '@/types';

export default function StudentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState<ReturnType<typeof getStudentDetailedAnalytics>>(null);
  const [allStudents, setAllStudents] = useState<CourseStudent[]>([]);

  useEffect(() => {
    const data = getStudentDetailedAnalytics(courseId, studentId);
    if (!data) {
      alert('Student or course not found');
      router.push(`/course/${courseId}`);
      return;
    }
    setAnalytics(data);

    // Load all students for the dropdown
    const course = loadCourse(courseId);
    if (course) {
      setAllStudents(course.students);
    }
  }, [courseId, studentId]);

  if (!analytics) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const { student, course, testPerformance, oralPerformance, labelPerformance, categoryPerformance, partPerformance, overallStats } = analytics;

  const getScoreColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'text-success'; // 5/6 = 83%
    if (percentage >= 58) return 'text-warning'; // 3.5/6 = 58%
    return 'text-danger';
  };

  const getScoreBgColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'bg-emerald-100';
    if (percentage >= 58) return 'bg-yellow-100';
    return 'bg-red-100';
  };

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
            {t('common.back')}
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-display font-bold text-text-primary">{student.name}</h1>
            {allStudents.length > 1 && (
              <select
                value={studentId}
                onChange={(e) => router.push(`/course/${courseId}/student/${e.target.value}`)}
                className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand transition-all cursor-pointer"
              >
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.studentNumber ? `(${s.studentNumber})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-text-secondary">{course.name}</p>
          {student.studentNumber && (
            <p className="text-sm text-text-disabled">{t('course.studentNumber')}: {student.studentNumber}</p>
          )}
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-brand" />
              <h3 className="font-semibold text-text-primary">{t('dashboard.avgScore')}</h3>
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
              {overallStats.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-text-secondary">/ 60</p>
          </div>

          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-success" />
              <h3 className="font-semibold text-text-primary">{t('dashboard.completedTests')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-success">
              {overallStats.completedTests}
            </p>
            <p className="text-sm text-text-secondary">/ {overallStats.totalTests}</p>
          </div>

          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-brand" />
              <h3 className="font-semibold text-text-primary">{t('dashboard.attemptRate')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-brand">
              {overallStats.averageAttemptRate.toFixed(0)}%
            </p>
            <p className="text-sm text-text-secondary">{t('dashboard.tasksAttempted')}</p>
          </div>

          <div className="bg-surface rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-warning" />
              <h3 className="font-semibold text-text-primary">{t('dashboard.progress')}</h3>
            </div>
            <p className="text-3xl font-display font-bold text-warning">
              {testPerformance.length > 0 && testPerformance[testPerformance.length - 1].score > 0
                ? testPerformance[testPerformance.length - 1].score
                : '-'}
            </p>
            <p className="text-sm text-text-secondary">{t('dashboard.latestTest')}</p>
          </div>
        </div>

        {/* Test Performance Timeline */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('dashboard.performanceAcrossTests')}</h2>

          {testPerformance.length === 0 ? (
            <p className="text-text-disabled text-center py-8">{t('course.noTests')}</p>
          ) : (
            <div className="space-y-3">
              {testPerformance.map(test => (
                <div key={test.testId} className="flex gap-3">
                  {/* Test card - 85% width */}
                  <Link
                    href={`/course/${courseId}/test/${test.testId}?student=${studentId}`}
                    className="flex-[0.85] border border-border rounded-lg p-4 hover:border-rose-500 hover:shadow-sm transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-text-primary hover:text-brand transition-colors">{test.testName}</h4>
                        <p className="text-xs text-text-disabled">
                          {new Date(test.testDate).toLocaleDateString('nb-NO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                          {test.score} / {test.maxScore}
                        </p>
                        {test.completed ? (
                          <p className="text-xs text-success">{t('test.completed')}</p>
                        ) : (
                          <p className="text-xs text-text-disabled">{t('test.notCompleted')}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${test.score >= 50 ? 'bg-success' : test.score >= 35 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Attempt rate */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{t('dashboard.tasksAttempted')}:</span>
                      <span className="font-medium text-text-primary">
                        {test.tasksAttempted} / {test.totalTasks} ({test.attemptPercentage.toFixed(0)}%)
                      </span>
                    </div>
                  </Link>

                  {/* Score distribution histogram box - 15% width */}
                  <div className="flex-[0.15] border border-border rounded-lg p-2 bg-background">
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-end gap-0.5 flex-1 mb-1" style={{ minHeight: '60px' }}>
                        {(() => {
                          // Use the same color as the progress bar for all histogram bars
                          const barColor = test.score >= 50 ? 'bg-success' : test.score >= 35 ? 'bg-warning' : 'bg-danger';

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
                          <div key={score} className="flex-1 text-center text-xs text-text-secondary">
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

        {/* Oral Assessments Performance */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={24} className="text-purple-600" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{t('course.oralTests')}</h2>
          </div>

          {!oralPerformance || oralPerformance.length === 0 ? (
              <p className="text-text-disabled text-center py-8">{t('course.noOralTestsYet')}</p>
            ) : (
              <div className="space-y-3">
                {oralPerformance.map(oral => (
                  <div key={oral.oralTestId} className="flex gap-3">
                    {/* Oral test card - 50% width */}
                    <Link
                      href={`/course/${courseId}/oral/${oral.oralTestId}?student=${studentId}`}
                      className="flex-[0.50] border border-border rounded-lg p-4 hover:border-purple-500 hover:shadow-sm transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary hover:text-purple-600 transition-colors">{oral.oralTestName}</h4>
                          <p className="text-xs text-text-disabled">
                            {new Date(oral.oralTestDate).toLocaleDateString('nb-NO')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getScoreColor(oral.score)}`}>
                            {oral.score} / {oral.maxScore}
                          </p>
                          {oral.completed ? (
                            <p className="text-xs text-success">{t('test.completed')}</p>
                          ) : (
                            <p className="text-xs text-text-disabled">{t('test.notCompleted')}</p>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${oral.score >= 50 ? 'bg-purple-600' : oral.score >= 35 ? 'bg-purple-400' : 'bg-purple-300'}`}
                            style={{ width: `${(oral.score / oral.maxScore) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Legend for radar chart */}
                      {oral.dimensions && oral.dimensions.length > 0 && (
                        <div className="text-xs text-text-secondary space-y-0.5">
                          <div><span className="text-base">🎯</span> {t('oral.dimension.strategy.label')}</div>
                          <div><span className="text-base">💭</span> {t('oral.dimension.reasoning.label')}</div>
                          <div><span className="text-base">📊</span> {t('oral.dimension.representations.label')}</div>
                          <div><span className="text-base">⚙️</span> {t('oral.dimension.modeling.label')}</div>
                          <div><span className="text-base">💬</span> {t('oral.dimension.communication.label')}</div>
                          <div><span className="text-base">📚</span> {t('oral.dimension.subject_knowledge.label')}</div>
                        </div>
                      )}
                    </Link>

                    {/* Radar chart box - 50% width */}
                    <div className="flex-[0.50] border border-border rounded-lg p-4 bg-background flex flex-col items-center justify-center">
                      {oral.dimensions && oral.dimensions.length > 0 ? (
                        <>
                          <RadarChart dimensions={oral.dimensions} />
                        </>
                      ) : (
                        <div className="text-center text-xs text-text-disabled p-4">
                          {t('test.notCompleted')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Performance by Theme Labels */}
        {labelPerformance.length > 0 && (
          <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('dashboard.performanceByTheme')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labelPerformance.map(label => (
                <div key={label.label} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-brand text-white rounded-full text-sm font-medium">
                      {label.label}
                    </span>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${label.averageScore >= 5 ? 'text-success' : label.averageScore >= 3.5 ? 'text-warning' : 'text-danger'}`}>
                        {label.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-text-disabled">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">{label.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        label.averageScore >= 5 ? 'bg-success' :
                        label.averageScore >= 3.5 ? 'bg-warning' : 'bg-danger'
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
          <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={24} className="text-brand" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('dashboard.performanceByCategory')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {categoryPerformance.map(cat => (
                <div key={cat.category} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">{t(`dashboard.category${cat.category}Name`)}</h3>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cat.averageScore >= 5 ? 'text-success' : cat.averageScore >= 3.5 ? 'text-warning' : 'text-danger'}`}>
                        {cat.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-text-disabled">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{cat.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        cat.averageScore >= 5 ? 'bg-success' :
                        cat.averageScore >= 3.5 ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ width: `${(cat.averageScore / 6) * 100}%` }}
                    />
                  </div>

                  {/* Category description from national exam guidelines */}
                  <p className="text-xs text-text-disabled italic">
                    {t(`dashboard.category${cat.category}Description`)}
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
        )}

        {/* Performance by Part (No aids vs All aids) */}
        {partPerformance && partPerformance.length > 0 && (
          <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={24} className="text-indigo-600" />
              <h2 className="text-2xl font-display font-bold text-text-primary">{t('dashboard.performanceByPart')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partPerformance.map(part => (
                <div key={part.part} className={`border-2 rounded-lg p-6 ${
                  part.part === 1 ? 'border-orange-300 bg-orange-50' : 'border-blue-300 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{part.part === 1 ? t('dashboard.part1NoAids') : t('dashboard.part2AllAids')}</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        {part.part === 1 ? t('dashboard.noAidsPencilOnly') : t('dashboard.allAidsAllowed')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${part.averageScore >= 5 ? 'text-success' : part.averageScore >= 3.5 ? 'text-warning' : 'text-danger'}`}>
                        {part.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-text-disabled">/ 6</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{part.taskCount} {t('dashboard.tasks')}</p>

                  {/* Progress bar */}
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        part.averageScore >= 5 ? 'bg-success' :
                        part.averageScore >= 3.5 ? 'bg-warning' : 'bg-danger'
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

        {/* Scoring Guide */}
        <div className="mt-6">
          <ScoringGuide variant="inline" />
        </div>
      </div>
    </main>
  );
}
