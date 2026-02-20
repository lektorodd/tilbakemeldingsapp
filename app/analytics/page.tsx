'use client';

import { useState, useEffect } from 'react';
import { ArchivedFeedback, TaskStatistics } from '@/types';
import { loadArchive, calculateTaskStatistics, getStudentProgress, getAllStudentNames, getAllTestNames } from '@/utils/archive';
import { ArrowLeft, TrendingDown, TrendingUp, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [archive, setArchive] = useState<ArchivedFeedback[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [taskStats, setTaskStats] = useState<TaskStatistics[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const data = loadArchive();
    setArchive(data);
  }, []);

  useEffect(() => {
    if (archive.length > 0) {
      const stats = calculateTaskStatistics(archive, selectedTest || undefined);
      setTaskStats(stats);
    }
  }, [archive, selectedTest]);

  useEffect(() => {
    if (selectedStudent && archive.length > 0) {
      const progress = getStudentProgress(archive, selectedStudent);
      setStudentData(progress);
    } else {
      setStudentData(null);
    }
  }, [selectedStudent, archive]);

  const testNames = getAllTestNames(archive);
  const studentNames = getAllStudentNames(archive);

  const getDifficultyColor = (avgPoints: number, maxPoints: number): string => {
    const percentage = (avgPoints / maxPoints) * 100;
    if (percentage < 40) return 'text-danger bg-danger-bg';
    if (percentage < 60) return 'text-orange-600 bg-orange-50';
    if (percentage < 80) return 'text-warning bg-warning-bg';
    return 'text-green-600 bg-green-50';
  };

  const getDifficultyLabel = (avgPoints: number, maxPoints: number): string => {
    const percentage = (avgPoints / maxPoints) * 100;
    if (percentage < 40) return 'Very Hard';
    if (percentage < 60) return 'Hard';
    if (percentage < 80) return 'Moderate';
    return 'Easy';
  };

  return (
    <main className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-info hover:text-info mb-4"
            >
              <ArrowLeft size={20} />
              Back to Archive
            </Link>
            <h1 className="text-4xl font-bold text-text-primary">Analytics & Statistics</h1>
            <p className="text-text-secondary mt-2">Analyze task difficulty and student progress</p>
          </div>
        </div>

        {archive.length === 0 ? (
          <div className="bg-warning-bg border border-warning rounded-lg p-6 text-center">
            <BarChart3 className="mx-auto mb-4 text-warning" size={48} />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No data available</h3>
            <p className="text-text-secondary">Save some feedback to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Task Difficulty Analysis */}
            <div className="bg-surface rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 size={28} className="text-primary-600" />
                  <h2 className="text-2xl font-display font-bold text-text-primary">Task Difficulty Analysis</h2>
                </div>
                <div>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Tests</option>
                    {testNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {taskStats.length === 0 ? (
                <p className="text-text-disabled text-center py-8">No task data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-alt">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Task</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Avg Points</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Max Points</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Success Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Submissions</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Difficulty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Distribution (0-6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {taskStats.map(stat => {
                        const successRate = ((stat.averagePoints / stat.maxPoints) * 100).toFixed(1);
                        return (
                          <tr key={`${stat.taskId}-${stat.subtaskId || 'main'}`} className="hover:bg-surface">
                            <td className="px-4 py-3 font-medium text-text-primary">{stat.taskLabel}</td>
                            <td className="px-4 py-3 text-center font-semibold text-info">
                              {stat.averagePoints.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center text-text-secondary">{stat.maxPoints}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(stat.averagePoints, stat.maxPoints)}`}>
                                {successRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-text-secondary">{stat.totalSubmissions}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {parseFloat(successRate) < 60 ? (
                                  <TrendingDown size={18} className="text-danger" />
                                ) : (
                                  <TrendingUp size={18} className="text-green-600" />
                                )}
                                <span className="text-sm font-medium text-text-secondary">
                                  {getDifficultyLabel(stat.averagePoints, stat.maxPoints)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {stat.pointsDistribution.map((count, points) => (
                                  <div
                                    key={points}
                                    className="relative group"
                                    title={`${points} points: ${count} students`}
                                  >
                                    <div
                                      className="w-8 h-12 bg-info-bg rounded-t relative overflow-hidden"
                                    >
                                      <div
                                        className="absolute bottom-0 w-full bg-info transition-all"
                                        style={{
                                          height: `${stat.totalSubmissions > 0 ? (count / stat.totalSubmissions) * 100 : 0}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-center text-text-secondary mt-1">{points}</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 bg-info-bg border border-info rounded-lg p-4">
                <h4 className="font-semibold text-info mb-2">How to read this:</h4>
                <ul className="text-sm text-info space-y-1">
                  <li>• <strong>Very Hard</strong>: Average score below 40% - students struggle with this task</li>
                  <li>• <strong>Hard</strong>: Average score 40-60% - challenging task</li>
                  <li>• <strong>Moderate</strong>: Average score 60-80% - reasonable difficulty</li>
                  <li>• <strong>Easy</strong>: Average score above 80% - students handle this well</li>
                  <li>• The distribution shows how many students got each point value (0-6)</li>
                </ul>
              </div>
            </div>

            {/* Student Progress Tracking */}
            <div className="bg-surface rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users size={28} className="text-green-600" />
                  <h2 className="text-2xl font-display font-bold text-text-primary">Student Progress Tracking</h2>
                </div>
                <div>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-focus"
                  >
                    <option value="">Select a student...</option>
                    {studentNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {studentData ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Total Tests</h3>
                      <p className="text-3xl font-display font-bold text-green-600">{studentData.totalTests}</p>
                    </div>
                    <div className="bg-info-bg rounded-lg p-4 border border-info">
                      <h3 className="text-sm font-medium text-info mb-1">Average Score</h3>
                      <p className="text-3xl font-display font-bold text-info">
                        {studentData.averageScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                      <h3 className="text-sm font-medium text-primary-800 mb-1">Latest Score</h3>
                      <p className="text-3xl font-display font-bold text-primary-600">
                        {studentData.feedbacks.length > 0
                          ? ((studentData.feedbacks[studentData.feedbacks.length - 1].totalPoints /
                              studentData.feedbacks[studentData.feedbacks.length - 1].maxPoints) *
                              100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Test History</h3>
                    <table className="w-full">
                      <thead className="bg-surface-alt">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Test Name</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Points</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Percentage</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {studentData.feedbacks.map((feedback: ArchivedFeedback, index: number) => {
                          const percentage = (feedback.totalPoints / feedback.maxPoints) * 100;
                          let trend = null;
                          if (index > 0) {
                            const prevPercentage =
                              (studentData.feedbacks[index - 1].totalPoints /
                                studentData.feedbacks[index - 1].maxPoints) *
                              100;
                            const diff = percentage - prevPercentage;
                            trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
                          }

                          return (
                            <tr key={feedback.id} className="hover:bg-surface">
                              <td className="px-4 py-3 text-text-secondary">
                                {new Date(feedback.date).toLocaleDateString('nb-NO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-3 font-medium text-text-primary">{feedback.testName}</td>
                              <td className="px-4 py-3 text-center font-semibold text-info">
                                {feedback.totalPoints}/{feedback.maxPoints}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  percentage >= 80
                                    ? 'bg-green-100 text-green-800'
                                    : percentage >= 60
                                    ? 'bg-warning-bg text-warning'
                                    : 'bg-danger-bg text-danger'
                                }`}>
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {trend === 'up' && (
                                  <TrendingUp size={20} className="inline text-green-600" />
                                )}
                                {trend === 'down' && (
                                  <TrendingDown size={20} className="inline text-danger" />
                                )}
                                {trend === null && <span className="text-text-disabled">-</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-disabled">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a student to view their progress</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
