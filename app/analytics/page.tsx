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
    if (percentage < 40) return 'text-red-600 bg-red-50';
    if (percentage < 60) return 'text-orange-600 bg-orange-50';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-50';
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
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Archive
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Analytics & Statistics</h1>
            <p className="text-gray-600 mt-2">Analyze task difficulty and student progress</p>
          </div>
        </div>

        {archive.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <BarChart3 className="mx-auto mb-4 text-yellow-600" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600">Save some feedback to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Task Difficulty Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 size={28} className="text-indigo-600" />
                  <h2 className="text-2xl font-display font-bold text-gray-800">Task Difficulty Analysis</h2>
                </div>
                <div>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Tests</option>
                    {testNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {taskStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No task data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Avg Points</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Max Points</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Success Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Submissions</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Difficulty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Distribution (0-6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {taskStats.map(stat => {
                        const successRate = ((stat.averagePoints / stat.maxPoints) * 100).toFixed(1);
                        return (
                          <tr key={`${stat.taskId}-${stat.subtaskId || 'main'}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{stat.taskLabel}</td>
                            <td className="px-4 py-3 text-center font-semibold text-blue-600">
                              {stat.averagePoints.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">{stat.maxPoints}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(stat.averagePoints, stat.maxPoints)}`}>
                                {successRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-700">{stat.totalSubmissions}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {parseFloat(successRate) < 60 ? (
                                  <TrendingDown size={18} className="text-red-600" />
                                ) : (
                                  <TrendingUp size={18} className="text-green-600" />
                                )}
                                <span className="text-sm font-medium text-gray-700">
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
                                      className="w-8 h-12 bg-blue-200 rounded-t relative overflow-hidden"
                                    >
                                      <div
                                        className="absolute bottom-0 w-full bg-blue-600 transition-all"
                                        style={{
                                          height: `${stat.totalSubmissions > 0 ? (count / stat.totalSubmissions) * 100 : 0}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-center text-gray-600 mt-1">{points}</div>
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

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to read this:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Very Hard</strong>: Average score below 40% - students struggle with this task</li>
                  <li>• <strong>Hard</strong>: Average score 40-60% - challenging task</li>
                  <li>• <strong>Moderate</strong>: Average score 60-80% - reasonable difficulty</li>
                  <li>• <strong>Easy</strong>: Average score above 80% - students handle this well</li>
                  <li>• The distribution shows how many students got each point value (0-6)</li>
                </ul>
              </div>
            </div>

            {/* Student Progress Tracking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users size={28} className="text-green-600" />
                  <h2 className="text-2xl font-display font-bold text-gray-800">Student Progress Tracking</h2>
                </div>
                <div>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">Average Score</h3>
                      <p className="text-3xl font-display font-bold text-blue-600">
                        {studentData.averageScore.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <h3 className="text-sm font-medium text-indigo-800 mb-1">Latest Score</h3>
                      <p className="text-3xl font-display font-bold text-indigo-600">
                        {studentData.feedbacks.length > 0
                          ? ((studentData.feedbacks[studentData.feedbacks.length - 1].totalPoints /
                              studentData.feedbacks[studentData.feedbacks.length - 1].maxPoints) *
                              100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Test History</h3>
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Test Name</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Points</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Trend</th>
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
                            <tr key={feedback.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-700">
                                {new Date(feedback.date).toLocaleDateString('nb-NO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-800">{feedback.testName}</td>
                              <td className="px-4 py-3 text-center font-semibold text-blue-600">
                                {feedback.totalPoints}/{feedback.maxPoints}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  percentage >= 80
                                    ? 'bg-green-100 text-green-800'
                                    : percentage >= 60
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {trend === 'up' && (
                                  <TrendingUp size={20} className="inline text-green-600" />
                                )}
                                {trend === 'down' && (
                                  <TrendingDown size={20} className="inline text-red-600" />
                                )}
                                {trend === null && <span className="text-gray-400">-</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
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
