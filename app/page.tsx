'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFeedback } from '@/types';
import TaskConfiguration from '@/components/TaskConfiguration';
import StudentInfo from '@/components/StudentInfo';
import FeedbackForm from '@/components/FeedbackForm';
import { generateTypstDocument, downloadTypstFile, calculateTotalPoints, calculateMaxPoints } from '@/utils/typstExport';
import { saveTasks, loadTasks, saveGeneralComment, loadGeneralComment, saveTestName, loadTestName } from '@/utils/storage';
import { saveToArchive } from '@/utils/archive';
import { Download, RotateCcw, Archive, Save } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [testName, setTestName] = useState('Matteprøve');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<TaskFeedback[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [individualComment, setIndividualComment] = useState('');

  // Load saved data on mount
  useEffect(() => {
    const savedTasks = loadTasks();
    const savedGeneralComment = loadGeneralComment();
    const savedTestName = loadTestName();

    if (savedTasks && savedTasks.length > 0) {
      setTasks(savedTasks);
    } else {
      // Default tasks
      const defaultTasks: Task[] = [
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
      ];
      setTasks(defaultTasks);
    }

    setGeneralComment(savedGeneralComment);
    setTestName(savedTestName);
  }, []);

  // Save tasks when they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  // Save general comment when it changes
  useEffect(() => {
    saveGeneralComment(generalComment);
  }, [generalComment]);

  // Save test name when it changes
  useEffect(() => {
    saveTestName(testName);
  }, [testName]);

  const handleExportPDF = () => {
    const totalPoints = calculateTotalPoints(feedbacks);
    const maxPoints = calculateMaxPoints(tasks);

    const typstContent = generateTypstDocument({
      studentName,
      studentNumber,
      testName,
      tasks,
      feedbacks,
      generalComment,
      individualComment,
      totalPoints,
      maxPoints,
    });

    const filename = `${studentName.replace(/\s+/g, '_')}_${testName.replace(/\s+/g, '_')}.typ`;
    downloadTypstFile(typstContent, filename);
  };

  const handleSaveToArchive = () => {
    const totalPoints = calculateTotalPoints(feedbacks);
    const maxPoints = calculateMaxPoints(tasks);

    saveToArchive({
      testName,
      studentName,
      studentNumber,
      tasks: JSON.parse(JSON.stringify(tasks)), // Deep copy
      taskFeedbacks: JSON.parse(JSON.stringify(feedbacks)), // Deep copy
      generalComment,
      individualComment,
      totalPoints,
      maxPoints,
    });

    alert('Feedback saved to archive!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this feedback? This will clear the student info and feedback, but keep the task configuration.')) {
      setFeedbacks([]);
      setStudentName('');
      setStudentNumber('');
      setIndividualComment('');
    }
  };

  const totalPoints = calculateTotalPoints(feedbacks);
  const maxPoints = calculateMaxPoints(tasks);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Math Test Feedback App</h1>
              <p className="text-gray-600">Create detailed feedback for math tests with Typst math notation support</p>
            </div>
            <Link
              href="/archive"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Archive size={20} />
              View Archive
            </Link>
          </div>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Name:
          </label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Matteprøve Kapittel 3-5"
          />
        </div>

        <TaskConfiguration tasks={tasks} onTasksChange={setTasks} />

        <StudentInfo
          studentName={studentName}
          studentNumber={studentNumber}
          generalComment={generalComment}
          individualComment={individualComment}
          onStudentNameChange={setStudentName}
          onStudentNumberChange={setStudentNumber}
          onGeneralCommentChange={setGeneralComment}
          onIndividualCommentChange={setIndividualComment}
        />

        <FeedbackForm
          tasks={tasks}
          feedbacks={feedbacks}
          onFeedbackChange={setFeedbacks}
        />

        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Summary</h3>
              <p className="text-lg text-gray-700 mt-2">
                Total Points: <span className="font-bold text-blue-600">{totalPoints}</span> / {maxPoints}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                <RotateCcw size={20} />
                Reset Feedback
              </button>
              <button
                onClick={handleSaveToArchive}
                disabled={!studentName}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                Save to Archive
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!studentName}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Export Typst File
              </button>
            </div>
          </div>
          {!studentName && (
            <p className="text-sm text-red-600">Please enter a student name to export</p>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to use Typst math notation:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Inline math: Use $...$ (e.g., $x^2 + y^2 = r^2$)</li>
            <li>• Greek letters: $alpha$, $beta$, $gamma$, etc.</li>
            <li>• Fractions: $x/y$ or $frac(x, y)$</li>
            <li>• Limits: $lim_(x arrow infinity) f(x)$</li>
            <li>• Integrals: $integral x^2 d x$</li>
            <li>• Derivatives: $f'(x)$ or $(d y)/(d x)$</li>
          </ul>
          <p className="text-sm text-blue-800 mt-2">
            After exporting, compile the .typ file with Typst CLI: <code className="bg-blue-100 px-1 rounded">typst compile filename.typ</code>
          </p>
        </div>
      </div>
    </main>
  );
}
