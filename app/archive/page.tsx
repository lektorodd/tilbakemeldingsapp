'use client';

import { useState, useEffect } from 'react';
import { ArchivedFeedback } from '@/types';
import { loadArchive, deleteArchivedFeedback, exportArchiveToJSON, importArchiveFromJSON, clearArchive } from '@/utils/archive';
import { ArrowLeft, Trash2, Download, Upload, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/contexts/NotificationContext';

export default function ArchivePage() {
  const { toast, confirm } = useNotification();
  const [archive, setArchive] = useState<ArchivedFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<ArchivedFeedback | null>(null);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterTest, setFilterTest] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = loadArchive();
    setArchive(data);
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Are you sure you want to delete this feedback?')) {
      deleteArchivedFeedback(id);
      loadData();
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    }
  };

  const handleExport = () => {
    const json = exportArchiveToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-archive-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importArchiveFromJSON(content);
        loadData();
        toast('Archive imported successfully!', 'success');
      } catch (error) {
        toast('Failed to import archive. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearArchive = async () => {
    if (await confirm('Are you sure you want to clear the entire archive? This cannot be undone!')) {
      clearArchive();
      loadData();
      setSelectedFeedback(null);
    }
  };

  const filteredArchive = archive.filter(f => {
    const matchStudent = filterStudent === '' || f.studentName.toLowerCase().includes(filterStudent.toLowerCase());
    const matchTest = filterTest === '' || f.testName.toLowerCase().includes(filterTest.toLowerCase());
    return matchStudent && matchTest;
  });

  const uniqueStudents = Array.from(new Set(archive.map(f => f.studentName))).sort();
  const uniqueTests = Array.from(new Set(archive.map(f => f.testName))).sort();

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-brand hover:text-rose-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Feedback
            </Link>
            <h1 className="text-4xl font-bold text-text-primary">Feedback Archive</h1>
            <p className="text-text-secondary mt-2">View and analyze past feedback</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
            >
              <Download size={18} />
              Export Archive
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:hover:bg-emerald-700 transition-colors cursor-pointer">
              <Upload size={18} />
              Import Archive
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleClearArchive}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          </div>
        </div>

        {archive.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-warning" size={48} />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No archived feedback yet</h3>
            <p className="text-text-secondary">Start by creating and saving feedback from the main page.</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
            >
              Go to Feedback Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Section */}
            <div className="lg:col-span-1 bg-surface rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                Feedback List ({filteredArchive.length})
              </h2>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Filter by Student:
                  </label>
                  <select
                    value={filterStudent}
                    onChange={(e) => setFilterStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                  >
                    <option value="">All Students</option>
                    {uniqueStudents.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Filter by Test:
                  </label>
                  <select
                    value={filterTest}
                    onChange={(e) => setFilterTest(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                  >
                    <option value="">All Tests</option>
                    {uniqueTests.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredArchive.map(feedback => (
                  <div
                    key={feedback.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFeedback?.id === feedback.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => setSelectedFeedback(feedback)}>
                        <h3 className="font-semibold text-text-primary">{feedback.studentName}</h3>
                        <p className="text-sm text-text-secondary">{feedback.testName}</p>
                        <p className="text-xs text-text-disabled mt-1">
                          {new Date(feedback.date).toLocaleDateString('nb-NO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm font-medium text-brand mt-1">
                          {feedback.totalPoints}/{feedback.maxPoints} points
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(feedback.id)}
                        className="p-1 text-danger hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Section */}
            <div className="lg:col-span-2 bg-surface rounded-lg shadow-sm p-6">
              {selectedFeedback ? (
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-text-primary">
                        {selectedFeedback.studentName}
                      </h2>
                      <p className="text-lg text-text-secondary">{selectedFeedback.testName}</p>
                      {selectedFeedback.studentNumber && (
                        <p className="text-sm text-text-disabled">
                          Student #: {selectedFeedback.studentNumber}
                        </p>
                      )}
                      <p className="text-sm text-text-disabled">
                        Date: {new Date(selectedFeedback.date).toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-brand">
                        {selectedFeedback.totalPoints}/{selectedFeedback.maxPoints}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {((selectedFeedback.totalPoints / selectedFeedback.maxPoints) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-6">
                    {selectedFeedback.generalComment && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">General Comment</h3>
                        <div className="bg-background rounded-lg p-4 text-text-secondary whitespace-pre-wrap font-mono text-sm">
                          {selectedFeedback.generalComment}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Task Feedback</h3>
                      <div className="space-y-4">
                        {selectedFeedback.tasks.map(task => {
                          if (task.hasSubtasks && task.subtasks.length > 0) {
                            return (
                              <div key={task.id}>
                                <h4 className="font-medium text-text-secondary mb-2">Task {task.label}</h4>
                                {task.subtasks.map(subtask => {
                                  const feedback = selectedFeedback.taskFeedbacks.find(
                                    f => f.taskId === task.id && f.subtaskId === subtask.id
                                  );
                                  if (!feedback) return null;

                                  return (
                                    <div key={subtask.id} className="ml-4 mb-3 bg-background rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-text-primary">
                                          {task.label}{subtask.label}
                                        </span>
                                        <span className="text-brand font-semibold">
                                          {feedback.points}/6
                                        </span>
                                      </div>
                                      {feedback.comment && (
                                        <p className="text-sm text-text-secondary font-mono whitespace-pre-wrap">
                                          {feedback.comment}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          } else {
                            const feedback = selectedFeedback.taskFeedbacks.find(
                              f => f.taskId === task.id && !f.subtaskId
                            );
                            if (!feedback) return null;

                            return (
                              <div key={task.id} className="bg-background rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-text-primary">Task {task.label}</span>
                                  <span className="text-brand font-semibold">
                                    {feedback.points}/6
                                  </span>
                                </div>
                                {feedback.comment && (
                                  <p className="text-sm text-text-secondary font-mono whitespace-pre-wrap">
                                    {feedback.comment}
                                  </p>
                                )}
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>

                    {selectedFeedback.individualComment && (
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Individual Comment</h3>
                        <div className="bg-background rounded-lg p-4 text-text-secondary whitespace-pre-wrap font-mono text-sm">
                          {selectedFeedback.individualComment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-disabled">
                  <div className="text-center">
                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a feedback to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/analytics"
            className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
          >
            View Analytics & Statistics
          </Link>
        </div>
      </div>
    </main>
  );
}
