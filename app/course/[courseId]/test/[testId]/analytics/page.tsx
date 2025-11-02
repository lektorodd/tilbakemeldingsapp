'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseTest, TaskAnalytics } from '@/types';
import { loadCourse, getTestTaskAnalytics } from '@/utils/courseStorage';
import { ArrowLeft, Filter, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TestAnalyticsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<CourseTest | null>(null);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics[]>([]);

  // Filter states
  const [selectedPart, setSelectedPart] = useState<'all' | 1 | 2>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 1 | 2 | 3>('all');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'label' | 'avgScore' | 'attemptPct'>('label');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      alert(t('course.courseNotFound'));
      router.push('/courses');
      return;
    }

    const loadedTest = loadedCourse.tests.find(t => t.id === testId);
    if (!loadedTest) {
      alert(t('test.testNotFound'));
      router.push(`/course/${courseId}`);
      return;
    }

    setCourse(loadedCourse);
    setTest(loadedTest);

    const analytics = getTestTaskAnalytics(courseId, testId);
    setTaskAnalytics(analytics);
  }, [courseId, testId, router, t]);

  if (!course || !test) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  // Get available parts, categories, and labels from the data
  const availableParts = new Set(taskAnalytics.map(ta => ta.part).filter(p => p !== undefined));
  const availableCategories = new Set(taskAnalytics.map(ta => ta.category).filter(c => c !== undefined));
  const availableLabels = new Set(taskAnalytics.flatMap(ta => ta.labels));

  // Apply filters
  const filteredAnalytics = taskAnalytics.filter(ta => {
    if (selectedPart !== 'all' && ta.part !== selectedPart) return false;
    if (selectedCategory !== 'all' && ta.category !== selectedCategory) return false;
    if (selectedLabels.length > 0 && !selectedLabels.some(label => ta.labels.includes(label))) return false;
    return true;
  });

  // Apply sorting
  const sortedAnalytics = [...filteredAnalytics].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'label') {
      comparison = a.label.localeCompare(b.label);
    } else if (sortBy === 'avgScore') {
      comparison = a.averageScore - b.averageScore;
    } else if (sortBy === 'attemptPct') {
      comparison = a.attemptPercentage - b.attemptPercentage;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const getCategoryColor = (category?: number) => {
    switch (category) {
      case 1: return 'bg-emerald-100 text-emerald-800';
      case 2: return 'bg-amber-100 text-amber-800';
      case 3: return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category?: number) => {
    switch (category) {
      case 1: return t('category.cat1Short') || 'Cat 1';
      case 2: return t('category.cat2Short') || 'Cat 2';
      case 3: return t('category.cat3Short') || 'Cat 3';
      default: return 'N/A';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'text-emerald-700 font-bold';
    if (score >= 4) return 'text-emerald-600 font-semibold';
    if (score >= 3) return 'text-amber-600 font-semibold';
    if (score >= 2) return 'text-orange-600';
    if (score >= 1) return 'text-rose-600';
    return 'text-gray-500';
  };

  const getAttemptColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-700 font-bold';
    if (percentage >= 60) return 'text-emerald-600 font-semibold';
    if (percentage >= 40) return 'text-amber-600 font-semibold';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-rose-600';
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/course/${courseId}/test/${testId}`}
            className="inline-flex items-center gap-2 text-brand hover:text-rose-800 mb-2"
          >
            <ArrowLeft size={20} />
            Back to Test Feedback
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={32} className="text-brand" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Test Task Analysis
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-text-secondary">{test.name}</h2>
          <p className="text-text-secondary">{course.name}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
            <p className="text-sm text-text-secondary">Total Tasks</p>
            <p className="text-2xl font-bold text-text-primary">{taskAnalytics.length}</p>
          </div>
          <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
            <p className="text-sm text-text-secondary">Average Score</p>
            <p className="text-2xl font-bold text-brand">
              {(filteredAnalytics.reduce((sum, ta) => sum + ta.averageScore, 0) / filteredAnalytics.length || 0).toFixed(2)} / 6
            </p>
          </div>
          <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
            <p className="text-sm text-text-secondary">Avg Attempt Rate</p>
            <p className="text-2xl font-bold text-emerald-600">
              {(filteredAnalytics.reduce((sum, ta) => sum + ta.attemptPercentage, 0) / filteredAnalytics.length || 0).toFixed(0)}%
            </p>
          </div>
          <div className="bg-surface rounded-lg shadow-sm p-4 border border-border">
            <p className="text-sm text-text-secondary">Students</p>
            <p className="text-2xl font-bold text-text-primary">
              {taskAnalytics.length > 0 ? taskAnalytics[0].totalStudents : 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-sm p-6 mb-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-brand" />
            <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Part Filter */}
            {availableParts.size > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Part
                </label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value as 'all' | 1 | 2)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                >
                  <option value="all">All Parts</option>
                  {Array.from(availableParts).sort().map(part => (
                    <option key={part} value={part}>
                      Part {part} {part === 1 ? '(No aids)' : '(All aids)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            {availableCategories.size > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'all' | 1 | 2 | 3)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                >
                  <option value="all">All Categories</option>
                  {Array.from(availableCategories).sort().map(cat => (
                    <option key={cat} value={cat}>
                      Category {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'label' | 'avgScore' | 'attemptPct')}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                >
                  <option value="label">Task Label</option>
                  <option value="avgScore">Avg Score</option>
                  <option value="attemptPct">Attempt %</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-surface-alt transition"
                  title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Label Filter */}
          {availableLabels.size > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Theme Labels (click to filter)
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(availableLabels).sort().map(label => (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedLabels.includes(label)
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedLabels.length > 0 && (
                <button
                  onClick={() => setSelectedLabels([])}
                  className="mt-2 text-sm text-brand hover:underline"
                >
                  Clear label filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Analytics Table */}
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Task</th>
                  {test.hasTwoParts && <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Part</th>}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Theme Labels</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Avg Score</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Attempted</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Attempt %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan={test.hasTwoParts ? 7 : 6} className="px-4 py-8 text-center text-text-disabled">
                      No tasks match the selected filters
                    </td>
                  </tr>
                ) : (
                  sortedAnalytics.map((ta) => (
                    <tr key={`${ta.taskId}-${ta.subtaskId || 'main'}`} className="hover:bg-surface-alt transition">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        Task {ta.label}
                      </td>
                      {test.hasTwoParts && (
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {ta.part ? `Part ${ta.part}` : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {ta.category ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(ta.category)}`}>
                            {getCategoryLabel(ta.category)}
                          </span>
                        ) : (
                          <span className="text-sm text-text-disabled">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {ta.labels.length > 0 ? (
                            ta.labels.map(label => (
                              <span
                                key={label}
                                className="inline-block px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs"
                              >
                                {label}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-text-disabled">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${getScoreColor(ta.averageScore)}`}>
                          {ta.averageScore.toFixed(2)}
                        </span>
                        <span className="text-xs text-text-disabled"> / 6</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-text-secondary">
                        {ta.attemptCount} / {ta.totalStudents}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${getAttemptColor(ta.attemptPercentage)}`}>
                          {ta.attemptPercentage.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Note */}
        <div className="mt-4 text-sm text-text-secondary">
          <p>
            <strong>Avg Score:</strong> Average points earned across all students who attempted the task.
            <strong className="ml-3">Attempt %:</strong> Percentage of students who scored 1 or more points.
          </p>
        </div>
      </div>
    </main>
  );
}
