'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseTest, CourseStudent, TaskFeedback, TestFeedbackData } from '@/types';
import { loadCourse, updateTest, updateStudentFeedback, getStudentFeedback, calculateStudentScore } from '@/utils/courseStorage';
import { generateTypstDocument, downloadTypstFile, compileAndDownloadPDF } from '@/utils/typstExport';
import TaskConfiguration from '@/components/TaskConfiguration';
import { ArrowLeft, Save, Download, CheckCircle, Circle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TestFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const testId = params.testId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [test, setTest] = useState<CourseTest | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<TestFeedbackData | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId, testId]);

  const loadData = () => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      alert('Course not found');
      router.push('/courses');
      return;
    }

    const loadedTest = loadedCourse.tests.find(t => t.id === testId);
    if (!loadedTest) {
      alert('Test not found');
      router.push(`/course/${courseId}`);
      return;
    }

    setCourse(loadedCourse);
    setTest(loadedTest);
  };

  useEffect(() => {
    if (selectedStudent && course && test) {
      const feedback = getStudentFeedback(courseId, testId, selectedStudent.id);
      setCurrentFeedback(feedback || {
        studentId: selectedStudent.id,
        taskFeedbacks: [],
        individualComment: '',
      });
    }
  }, [selectedStudent, course, test, courseId, testId]);

  const handleSaveTest = () => {
    if (test) {
      updateTest(courseId, testId, test);
      alert('Test configuration saved!');
      loadData();
    }
  };

  const handleUpdateFeedback = (taskId: string, subtaskId: string | undefined, updates: Partial<TaskFeedback>) => {
    if (!currentFeedback || !selectedStudent) return;

    const existingIndex = currentFeedback.taskFeedbacks.findIndex(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );

    let newFeedbacks: TaskFeedback[];
    if (existingIndex >= 0) {
      newFeedbacks = [...currentFeedback.taskFeedbacks];
      newFeedbacks[existingIndex] = { ...newFeedbacks[existingIndex], ...updates };
    } else {
      newFeedbacks = [...currentFeedback.taskFeedbacks, { taskId, subtaskId, points: 0, comment: '', ...updates }];
    }

    const updatedFeedback = {
      ...currentFeedback,
      taskFeedbacks: newFeedbacks,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
  };

  const handleUpdateIndividualComment = (comment: string) => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      individualComment: comment,
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
  };

  const handleMarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const updatedFeedback = {
      ...currentFeedback,
      completedDate: new Date().toISOString(),
    };

    updateStudentFeedback(courseId, testId, selectedStudent.id, updatedFeedback);
    setCurrentFeedback(updatedFeedback);
    loadData();
    alert('Feedback marked as complete and auto-saved!');
  };

  const handleExportTypst = () => {
    if (!selectedStudent || !test || !currentFeedback) return;

    const score = calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: currentFeedback.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: currentFeedback.individualComment,
      totalPoints: score,
      maxPoints: 60,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.typ`;
    downloadTypstFile(typstContent, filename);
  };

  const handleCompilePDF = async () => {
    if (!selectedStudent || !test || !currentFeedback) return;

    const score = calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks);

    const typstContent = generateTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      testName: test.name,
      tasks: test.tasks,
      feedbacks: currentFeedback.taskFeedbacks,
      generalComment: test.generalComment,
      individualComment: currentFeedback.individualComment,
      totalPoints: score,
      maxPoints: 60,
    });

    const filename = `${selectedStudent.name.replace(/\s+/g, '_')}_${test.name.replace(/\s+/g, '_')}.typ`;

    const success = await compileAndDownloadPDF(typstContent, filename);
    if (success) {
      alert('PDF compiled and downloaded successfully!');
    }
  };

  if (!course || !test) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback => {
    if (!currentFeedback) return { taskId, subtaskId, points: 0, comment: '' };

    const existing = currentFeedback.taskFeedbacks.find(
      f => f.taskId === taskId && f.subtaskId === subtaskId
    );
    return existing || { taskId, subtaskId, points: 0, comment: '' };
  };

  const currentScore = currentFeedback && test ? calculateStudentScore(test.tasks, currentFeedback.taskFeedbacks) : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/course/${courseId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft size={20} />
              Back to Course
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-gray-600">{course.name}</p>
            {test.description && <p className="text-gray-600 text-sm">{test.description}</p>}
          </div>
          <button
            onClick={handleSaveTest}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Save size={18} />
            Save Test Config
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Task Configuration */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <TaskConfiguration
                tasks={test.tasks}
                onTasksChange={(tasks) => setTest({ ...test, tasks })}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Students ({course.students.length})</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {course.students.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No students in course</p>
                ) : (
                  course.students.map(student => {
                    const feedback = getStudentFeedback(courseId, testId, student.id);
                    const score = feedback ? calculateStudentScore(test.tasks, feedback.taskFeedbacks) : 0;
                    const isCompleted = feedback?.completedDate;

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
                              {isCompleted && (
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
            {selectedStudent && currentFeedback ? (
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
                    {currentFeedback.completedDate ? (
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
                      onClick={handleCompilePDF}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                      title="Compile to PDF directly"
                    >
                      <Download size={18} />
                      Generate PDF
                    </button>
                    <button
                      onClick={handleExportTypst}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                      title="Download .typ source file"
                    >
                      <FileText size={18} />
                      .typ
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
                    value={currentFeedback.individualComment}
                    onChange={(e) => handleUpdateIndividualComment(e.target.value)}
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
      </div>
    </main>
  );
}
