'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseStudent, CourseTest } from '@/types';
import { loadCourse, saveCourse, addStudentToCourse, deleteStudent, addTestToCourse, deleteTest } from '@/utils/courseStorage';
import { ArrowLeft, Plus, Trash2, Edit, Users, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [newTestDate, setNewTestDate] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = () => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      alert('Course not found');
      router.push('/courses');
      return;
    }
    setCourse(loadedCourse);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      alert('Please enter a student name');
      return;
    }

    addStudentToCourse(courseId, {
      name: newStudentName,
      studentNumber: newStudentNumber || undefined,
    });

    setNewStudentName('');
    setNewStudentNumber('');
    setShowAddStudentModal(false);
    loadData();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student? This will also delete all their feedback.')) {
      deleteStudent(courseId, studentId);
      loadData();
    }
  };

  const handleAddTest = () => {
    if (!newTestName.trim()) {
      alert('Please enter a test name');
      return;
    }

    if (!newTestDate) {
      alert('Please select a test date');
      return;
    }

    addTestToCourse(courseId, {
      name: newTestName,
      description: newTestDescription || undefined,
      date: newTestDate,
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
    });

    setNewTestName('');
    setNewTestDescription('');
    setNewTestDate('');
    setShowAddTestModal(false);
    loadData();
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test? This will delete all feedback for this test.')) {
      deleteTest(courseId, testId);
      loadData();
    }
  };

  if (!course) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft size={20} />
              Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            {course.description && <p className="text-gray-600">{course.description}</p>}
          </div>
          <Link
            href={`/course/${courseId}/analytics`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            <BarChart3 size={18} />
            View Analytics
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Students</h2>
                <span className="text-gray-600">({course.students.length})</span>
              </div>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No students yet</p>
              ) : (
                course.students.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">{student.name}</h4>
                      {student.studentNumber && (
                        <p className="text-xs text-gray-500">#{student.studentNumber}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tests section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Tests</h2>
                <span className="text-gray-600">({course.tests.length})</span>
              </div>
              <button
                onClick={() => setShowAddTestModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.tests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No tests yet</p>
              ) : (
                course.tests
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(test => {
                    const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
                    return (
                      <div
                        key={test.id}
                        className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{test.name}</h4>
                            {test.description && (
                              <p className="text-xs text-gray-600">{test.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(test.date).toLocaleDateString('nb-NO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {completedCount} / {course.students.length} completed
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <Link
                          href={`/course/${courseId}/test/${test.id}`}
                          className="block text-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                        >
                          <Edit size={14} className="inline mr-1" />
                          Give Feedback
                        </Link>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {course.students.length > 0 && course.tests.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Course Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">{course.students.length}</p>
              </div>
              <div>
                <p className="text-blue-700">Total Tests</p>
                <p className="text-2xl font-bold text-blue-900">{course.tests.length}</p>
              </div>
              <div>
                <p className="text-blue-700">Possible Feedback</p>
                <p className="text-2xl font-bold text-blue-900">
                  {course.students.length * course.tests.length}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Completed</p>
                <p className="text-2xl font-bold text-blue-900">
                  {course.tests.reduce((sum, test) =>
                    sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Add test modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Test</h2>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date (required):
                  </label>
                  <input
                    type="date"
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddTestModal(false);
                    setNewTestName('');
                    setNewTestDescription('');
                    setNewTestDate('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTest}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
