'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Test, Student, TaskFeedback } from '@/types';
import { loadTest, saveTest, addStudentToTest, updateStudent, deleteStudent, calculateStudentScore } from '@/utils/testStorage';
import { generateTypstDocument, downloadTypstFile } from '@/utils/typstExport';
import TaskConfiguration from '@/components/TaskConfiguration';
import { ArrowLeft, Plus, Trash2, Save, Download, CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<Test | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = () => {
    const loadedTest = loadTest(testId);
    if (!loadedTest) {
      alert('Test not found');
      router.push('/tests');
      return;
    }
    setTest(loadedTest);
  };

  const handleSaveTest = () => {
    if (test) {
      saveTest(test);
      alert('Test saved successfully!');
    }
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      alert('Please enter a student name');
      return;
    }

    if (!test) return;

    const newStudent = addStudentToTest(testId, {
      name: newStudentName,
      studentNumber: newStudentNumber || undefined,
      taskFeedbacks: [],
      individualComment: '',
    });

    setNewStudentName('');
    setNewStudentNumber('');
    setShowAddStudentModal(false);
    loadData();
    setSelectedStudent(newStudent);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student and their feedback?')) {
      deleteStudent(testId, studentId);
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      loadData();
    }
  };

  const handleUpdateFeedback = (taskId: string, subtaskId: string | undefined, updates: Partial<TaskFeedback>) => {
    if (!selectedStudent || !test) return;

    const existingIndex = selectedStudent.taskFeedbacks.findIndex(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );

    let newFeedbacks: TaskFeedback[];
    if (existingIndex >= 0) {
      newFeedbacks = [...selectedStudent.taskFeedbacks];
      newFeedbacks[existingIndex] = { ...newFeedbacks[existingIndex], ...updates };
    } else {
      newFeedbacks = [...selectedStudent.taskFeedbacks, { taskId, subtaskId, points: 0, comment: '', ...updates }];
    }

    const updatedStudent = {
      ...selectedStudent,
      taskFeedbacks: newFeedbacks,
    };

    updateStudent(testId, selectedStudent.id, updatedStudent);
    setSelectedStudent(updatedStudent);
    loadData();
  };

  const handleMarkComplete = () => {
    if (!selectedStudent || !test) return;

    const updatedStudent = {
      ...selectedStudent,
      completedDate: new Date().toISOString(),
    };

    updateStudent(testId, selectedStudent.id, updatedStudent);
    setSelectedStudent(updatedStudent);
    loadData();
    alert('Feedback marked as complete and auto-saved!');
  };

  const handleExportTypst = () => {
    if (!selectedStudent || !test) return;

    const totalPoints = selectedStudent.taskFeedbacks.reduce((sum, f) => sum + f.points, 0);
    const score = calculateStudentScore(test.tasks, selectedStudent.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: selectedStudent.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: selectedStudent.individualComment,
      totalPoints: score,
      maxPoints: 60,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.typ`;
    downloadTypstFile(typstContent, filename);
  };

  if (!test) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback => {
    if (!selectedStudent) return { taskId, subtaskId, points: 0, comment: '' };

    const existing = selectedStudent.taskFeedbacks.find(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );
    return existing || { taskId, subtaskId, points: 0, comment: '' };
  };

  const currentScore = selectedStudent ? calculateStudentScore(test.tasks, selectedStudent.taskFeedbacks) : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft size={20} />
              Back to Tests
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{test.name}</h1>
            {test.description && <p className="text-gray-600">{test.description}</p>}
          </div>
          <button
            onClick={handleSaveTest}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Save size={18} />
            Save Test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Task configuration and students */}
          <div className="lg:col-span-1 space-y-6">
            {/* Task Configuration */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <TaskConfiguration
                tasks={test.tasks}
                onTasksChange={(tasks) => setTest({ ...test, tasks })}
                availableLabels={[]}
              />
            </div>

            {/* General Comment */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">General Comment</h3>
              <textarea
                value={test.generalComment}
                onChange={(e) => setTest({ ...test, generalComment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Same for all students..."
              />
            </div>

            {/* Students list */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Students ({test.students.length})</h3>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {test.students.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No students yet</p>
                ) : (
                  test.students.map(student => {
                    const score = calculateStudentScore(test.tasks, student.taskFeedbacks);
                    return (
                      <div
                        key={student.id}
                        className={`p-3 border rounded-lg cursor-pointer transition ${
                          selectedStudent?.id === student.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-800">{student.name}</h4>
                              {student.completedDate && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                            </div>
                            {student.studentNumber && (
                              <p className="text-xs text-gray-500">#{student.studentNumber}</p>
                            )}
                            <p className="text-sm font-semibold text-blue-600 mt-1">
                              {score} / 60
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudent(student.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right side - Feedback form */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                    {selectedStudent.studentNumber && (
                      <p className="text-sm text-gray-600">Student #: {selectedStudent.studentNumber}</p>
                    )}
                    <p className="text-3xl font-bold text-blue-600 mt-2">{currentScore} / 60</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedStudent.completedDate ? (
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium">
                        <CheckCircle size={18} />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                      >
                        <CheckCircle size={18} />
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={handleExportTypst}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                    >
                      <Download size={18} />
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Task Feedback */}
                <div className="space-y-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Task Feedback</h3>
                  {test.tasks.map(task => (
                    <div key={task.id}>
                      {task.hasSubtasks ? (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-700">Task {task.label}</h4>
                          {task.subtasks.map(subtask => {
                            const feedback = getFeedback(task.id, subtask.id);
                            return (
                              <div key={subtask.id} className="ml-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center gap-4 mb-3">
                                  <label className="font-medium text-gray-700 min-w-[60px]">
                                    {task.label}{subtask.label}:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Points:</label>
                                    <select
                                      value={feedback.points}
                                      onChange={(e) =>
                                        handleUpdateFeedback(task.id, subtask.id, { points: Number(e.target.value) })
                                      }
                                      className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <span className="text-sm text-gray-600">/ 6</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comment (Typst math supported):
                                  </label>
                                  <textarea
                                    value={feedback.comment}
                                    onChange={(e) =>
                                      handleUpdateFeedback(task.id, subtask.id, { comment: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="e.g., Good work! $x = 5$"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          {(() => {
                            const feedback = getFeedback(task.id, undefined);
                            return (
                              <>
                                <div className="flex items-center gap-4 mb-3">
                                  <label className="font-medium text-gray-700 min-w-[60px]">
                                    Task {task.label}:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Points:</label>
                                    <select
                                      value={feedback.points}
                                      onChange={(e) =>
                                        handleUpdateFeedback(task.id, undefined, { points: Number(e.target.value) })
                                      }
                                      className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {[0, 1, 2, 3, 4, 5, 6].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <span className="text-sm text-gray-600">/ 6</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comment (Typst math supported):
                                  </label>
                                  <textarea
                                    value={feedback.comment}
                                    onChange={(e) =>
                                      handleUpdateFeedback(task.id, undefined, { comment: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    placeholder="e.g., Excellent! $integral x^2 d x = x^3/3 + C$"
                                  />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Individual Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Individual Comment (specific to this student):
                  </label>
                  <textarea
                    value={selectedStudent.individualComment}
                    onChange={(e) => {
                      const updated = { ...selectedStudent, individualComment: e.target.value };
                      updateStudent(testId, selectedStudent.id, updated);
                      setSelectedStudent(updated);
                      loadData();
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Personal feedback for this student..."
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Circle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a student to provide feedback</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add student modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Student</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name (required):
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Doe"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Number (optional):
                  </label>
                  <input
                    type="text"
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12345"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setNewStudentName('');
                    setNewStudentNumber('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
