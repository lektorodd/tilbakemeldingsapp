'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudentDetailedAnalytics } from '@/utils/courseStorage';
import { ArrowLeft, TrendingUp, Target, Award, BarChart3, Tag } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;

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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const { student, course, testPerformance, labelPerformance, categoryPerformance, overallStats } = analytics;

  const getScoreColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'text-green-600'; // 5/6 = 83%
    if (percentage >= 58) return 'text-yellow-600'; // 3.5/6 = 58%
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    const percentage = (score / 60) * 100;
    if (percentage >= 83) return 'bg-green-100';
    if (percentage >= 58) return 'bg-yellow-100';
    return 'bg-red-100';
  };

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
            Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{course.name}</p>
          {student.studentNumber && (
            <p className="text-sm text-gray-500">Student #: {student.studentNumber}</p>
          )}
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Average Score</h3>
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
              {overallStats.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">out of 60</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">Tests Completed</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {overallStats.completedTests}
            </p>
            <p className="text-sm text-gray-600">of {overallStats.totalTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">Attempt Rate</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {overallStats.averageAttemptRate.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">tasks attempted</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-800">Progress</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {testPerformance.length > 0 && testPerformance[testPerformance.length - 1].score > 0
                ? testPerformance[testPerformance.length - 1].score
                : '-'}
            </p>
            <p className="text-sm text-gray-600">latest test</p>
          </div>
        </div>

        {/* Test Performance Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Across Tests</h2>

          {testPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tests yet</p>
          ) : (
            <div className="space-y-3">
              {testPerformance.map(test => (
                <Link
                  key={test.testId}
                  href={`/course/${courseId}/test/${test.testId}?student=${studentId}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 hover:text-blue-600 transition">{test.testName}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(test.testDate).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                        {test.score} / {test.maxScore}
                      </p>
                      {test.completed ? (
                        <p className="text-xs text-green-600">Completed</p>
                      ) : (
                        <p className="text-xs text-gray-500">Not completed</p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${test.score >= 50 ? 'bg-green-600' : test.score >= 35 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Attempt rate */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tasks attempted:</span>
                    <span className="font-medium text-gray-800">
                      {test.tasksAttempted} / {test.totalTasks} ({test.attemptPercentage.toFixed(0)}%)
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Performance by Theme Labels */}
        {labelPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={24} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Performance by Theme</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labelPerformance.map(label => (
                <div key={label.label} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                      {label.label}
                    </span>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${label.averageScore >= 5 ? 'text-green-600' : label.averageScore >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {label.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{label.taskCount} tasks</p>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        label.averageScore >= 5 ? 'bg-green-600' :
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Performance by Category</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryPerformance.map(cat => (
                <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{cat.description}</h3>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${cat.averageScore >= 5 ? 'text-green-600' : cat.averageScore >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {cat.averageScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">/ 6</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{cat.taskCount} tasks</p>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        cat.averageScore >= 5 ? 'bg-green-600' :
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

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Understanding the Dashboard:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Attempt Rate</strong> shows how many tasks the student tries (more than 0 points)</li>
            <li>• <strong>Theme Performance</strong> shows average scores for different skill areas</li>
            <li>• <strong>Category Performance</strong> shows average scores by difficulty/type</li>
            <li>• Color coding: Green (≥5/6), Yellow (≥3.5/6), Red (&lt;3.5/6)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
