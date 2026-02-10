'use client';

import { useState, useEffect } from 'react';
import { Test } from '@/types';
import { loadAllTests, deleteTest, setupAutoSaveDirectory, isAutoSaveEnabled, disableAutoSave, exportTestAsFiles, exportAllTests } from '@/utils/testStorage';
import { Plus, Trash2, Edit, Users, FolderOpen, Download, Upload, Settings } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/contexts/NotificationContext';

export default function TestsPage() {
  const { toast, confirm } = useNotification();
  const [tests, setTests] = useState<Test[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  useEffect(() => {
    loadData();
    setAutoSaveEnabled(isAutoSaveEnabled());
  }, []);

  const loadData = () => {
    const allTests = loadAllTests();
    setTests(allTests);
  };

  const handleCreateTest = () => {
    if (!newTestName.trim()) {
      toast('Please enter a test name', 'warning');
      return;
    }

    const newTest: Test = {
      id: `test-${Date.now()}`,
      name: newTestName,
      description: newTestDescription,
      tasks: [
        { id: 'task-1', label: '1', subtasks: [], hasSubtasks: false },
        {
          id: 'task-2',
          label: '2',
          subtasks: [
            { id: 'task-2-a', label: 'a' },
            { id: 'task-2-b', label: 'b' },
          ],
          hasSubtasks: true,
        },
        { id: 'task-3', label: '3', subtasks: [], hasSubtasks: false },
      ],
      generalComment: '',
      students: [],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const allTests = loadAllTests();
    allTests.push(newTest);

    if (typeof window !== 'undefined') {
      localStorage.setItem('math-feedback-tests', JSON.stringify(allTests));
    }

    setNewTestName('');
    setNewTestDescription('');
    setShowCreateModal(false);
    loadData();
  };

  const handleDeleteTest = async (testId: string) => {
    if (await confirm('Are you sure you want to delete this test? This will delete all student feedback within it.')) {
      deleteTest(testId);
      loadData();
    }
  };

  const handleSetupAutoSave = async () => {
    const success = await setupAutoSaveDirectory();
    if (success) {
      setAutoSaveEnabled(true);
      toast('Auto-save enabled! All completed feedback will be automatically saved to the selected folder.', 'success');
    }
  };

  const handleDisableAutoSave = () => {
    disableAutoSave();
    setAutoSaveEnabled(false);
    toast('Auto-save disabled.', 'info');
  };

  const handleExportAll = () => {
    const json = exportAllTests();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-tests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Math Test Feedback App</h1>
            <p className="text-gray-600">Manage tests and provide feedback to students</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Download size={18} />
              Export All
            </button>
            <Link
              href="/archive"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <FolderOpen size={18} />
              Old Archive
            </Link>
          </div>
        </div>

        {/* Auto-save settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Auto-Save Settings</h3>
                <p className="text-sm text-gray-600">
                  {autoSaveEnabled
                    ? 'Completed feedback is automatically saved to your selected folder'
                    : 'Enable auto-save to automatically save completed feedback to a local folder'}
                </p>
              </div>
            </div>
            {autoSaveEnabled ? (
              <button
                onClick={handleDisableAutoSave}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Disable Auto-Save
              </button>
            ) : (
              <button
                onClick={handleSetupAutoSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Setup Auto-Save Folder
              </button>
            )}
          </div>
        </div>

        {/* Create new test button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
          >
            <Plus size={20} />
            Create New Test
          </button>
        </div>

        {/* Tests grid */}
        {tests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tests yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first test to start giving feedback to students
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
            >
              <Plus size={20} />
              Create Your First Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => {
              const completedCount = test.students.filter(s => s.completedDate).length;
              const totalStudents = test.students.length;

              return (
                <div key={test.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{test.name}</h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created: {new Date(test.createdDate).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Users size={18} />
                    <span className="text-sm">
                      {totalStudents} {totalStudents === 1 ? 'student' : 'students'}
                      {totalStudents > 0 && ` (${completedCount} completed)`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/test/${test.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <Edit size={16} />
                      Open Test
                    </Link>
                    <button
                      onClick={() => exportTestAsFiles(test.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                      title="Export test"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create test modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">Create New Test</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name (required):
                  </label>
                  <input
                    type="text"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., October Test"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional):
                  </label>
                  <input
                    type="text"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Logarithms, Chapter 3-5"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTestName('');
                    setNewTestDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTest}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Create Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
