import { Test, Student, TestSummary, Task, TaskFeedback } from '@/types';

const TESTS_KEY = 'math-feedback-tests';
const AUTO_SAVE_DIR_HANDLE_KEY = 'math-feedback-auto-save-dir';

// Test CRUD operations
export function saveTest(test: Test): void {
  const tests = loadAllTests();
  const existingIndex = tests.findIndex(t => t.id === test.id);

  test.lastModified = new Date().toISOString();

  if (existingIndex >= 0) {
    tests[existingIndex] = test;
  } else {
    tests.push(test);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  }

  // Auto-save to file if configured
  autoSaveToFile(test);
}

export function loadAllTests(): Test[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

export function loadTest(testId: string): Test | null {
  const tests = loadAllTests();
  return tests.find(t => t.id === testId) || null;
}

export function deleteTest(testId: string): void {
  const tests = loadAllTests();
  const filtered = tests.filter(t => t.id !== testId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(TESTS_KEY, JSON.stringify(filtered));
  }
}

export function getTestSummaries(): TestSummary[] {
  const tests = loadAllTests();
  return tests.map(test => ({
    id: test.id,
    name: test.name,
    description: test.description,
    studentCount: test.students.length,
    completedCount: test.students.filter(s => s.completedDate).length,
    createdDate: test.createdDate,
    lastModified: test.lastModified,
  }));
}

// Student operations within a test
export function addStudentToTest(testId: string, student: Omit<Student, 'id'>): Student {
  const test = loadTest(testId);
  if (!test) throw new Error('Test not found');

  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  test.students.push(newStudent);
  saveTest(test);

  return newStudent;
}

export function updateStudent(testId: string, studentId: string, updates: Partial<Student>): void {
  const test = loadTest(testId);
  if (!test) throw new Error('Test not found');

  const studentIndex = test.students.findIndex(s => s.id === studentId);
  if (studentIndex < 0) throw new Error('Student not found');

  test.students[studentIndex] = {
    ...test.students[studentIndex],
    ...updates,
  };

  saveTest(test);
}

export function deleteStudent(testId: string, studentId: string): void {
  const test = loadTest(testId);
  if (!test) throw new Error('Test not found');

  test.students = test.students.filter(s => s.id !== studentId);
  saveTest(test);
}

// Scoring calculations - NEW: average per task * 10
export function calculateStudentScore(tasks: Task[], feedbacks: TaskFeedback[]): number {
  const taskCount = countTasks(tasks);
  if (taskCount === 0) return 0;

  const totalPoints = feedbacks.reduce((sum, f) => sum + f.points, 0);
  const maxPoints = taskCount * 6;

  if (maxPoints === 0) return 0;

  // Average score per task, then multiply by 10 to get 0-60 range
  const averagePerTask = totalPoints / taskCount;
  return Math.round(averagePerTask * 10);
}

export function calculateMaxScore(tasks: Task[]): number {
  // Max is 60 (6 points per task * 10)
  return 60;
}

function countTasks(tasks: Task[]): number {
  let count = 0;
  tasks.forEach(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      count += task.subtasks.length;
    } else {
      count += 1;
    }
  });
  return count;
}

// Auto-save functionality
let autoSaveDirHandle: FileSystemDirectoryHandle | null = null;

export async function setupAutoSaveDirectory(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check if File System Access API is supported
  if (!('showDirectoryPicker' in window)) {
    alert('Auto-save to folder is not supported in this browser. Use Chrome or Edge for this feature.');
    return false;
  }

  try {
    // @ts-ignore - showDirectoryPicker is not in TypeScript types yet
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });

    autoSaveDirHandle = dirHandle;

    // Try to persist the permission
    if (dirHandle.requestPermission) {
      await dirHandle.requestPermission({ mode: 'readwrite' });
    }

    return true;
  } catch (error) {
    console.error('Failed to set up auto-save directory:', error);
    return false;
  }
}

export function isAutoSaveEnabled(): boolean {
  return autoSaveDirHandle !== null;
}

export function disableAutoSave(): void {
  autoSaveDirHandle = null;
}

async function autoSaveToFile(test: Test): Promise<void> {
  if (!autoSaveDirHandle) return;

  try {
    // Create test folder
    const testFolderName = sanitizeFileName(test.name);
    const testDirHandle = await autoSaveDirHandle.getDirectoryHandle(testFolderName, { create: true });

    // Save test configuration
    const testConfigFile = await testDirHandle.getFileHandle('test-config.json', { create: true });
    const testConfigWritable = await testConfigFile.createWritable();
    await testConfigWritable.write(JSON.stringify({
      name: test.name,
      description: test.description,
      tasks: test.tasks,
      generalComment: test.generalComment,
      createdDate: test.createdDate,
      lastModified: test.lastModified,
    }, null, 2));
    await testConfigWritable.close();

    // Save each student's feedback
    for (const student of test.students) {
      if (student.completedDate) {
        const studentFileName = `${sanitizeFileName(student.name)}.json`;
        const studentFile = await testDirHandle.getFileHandle(studentFileName, { create: true });
        const studentWritable = await studentFile.createWritable();

        const score = calculateStudentScore(test.tasks, student.taskFeedbacks);

        await studentWritable.write(JSON.stringify({
          name: student.name,
          studentNumber: student.studentNumber,
          score: score,
          maxScore: 60,
          taskFeedbacks: student.taskFeedbacks,
          individualComment: student.individualComment,
          completedDate: student.completedDate,
        }, null, 2));
        await studentWritable.close();
      }
    }
  } catch (error) {
    console.error('Auto-save failed:', error);
    // Don't throw - just log the error
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Export all data
export function exportAllTests(): string {
  const tests = loadAllTests();
  return JSON.stringify(tests, null, 2);
}

export async function exportTestAsFiles(testId: string): Promise<void> {
  const test = loadTest(testId);
  if (!test) throw new Error('Test not found');

  if (!('showDirectoryPicker' in window)) {
    // Fallback: download as single JSON
    const json = JSON.stringify(test, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(test.name)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });

    // Create test folder
    const testFolderName = sanitizeFileName(test.name);
    const testDirHandle = await dirHandle.getDirectoryHandle(testFolderName, { create: true });

    // Save test configuration
    const testConfigFile = await testDirHandle.getFileHandle('test-config.json', { create: true });
    const testConfigWritable = await testConfigFile.createWritable();
    await testConfigWritable.write(JSON.stringify({
      name: test.name,
      description: test.description,
      tasks: test.tasks,
      generalComment: test.generalComment,
      createdDate: test.createdDate,
      lastModified: test.lastModified,
    }, null, 2));
    await testConfigWritable.close();

    // Save each completed student's feedback
    for (const student of test.students) {
      if (student.completedDate) {
        const studentFileName = `${sanitizeFileName(student.name)}.json`;
        const studentFile = await testDirHandle.getFileHandle(studentFileName, { create: true });
        const studentWritable = await studentFile.createWritable();

        const score = calculateStudentScore(test.tasks, student.taskFeedbacks);

        await studentWritable.write(JSON.stringify({
          name: student.name,
          studentNumber: student.studentNumber,
          score: score,
          maxScore: 60,
          taskFeedbacks: student.taskFeedbacks,
          individualComment: student.individualComment,
          completedDate: student.completedDate,
        }, null, 2));
        await studentWritable.close();
      }
    }

    alert(`Test exported successfully to ${testFolderName}/`);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export test. Please try again.');
  }
}

// Import functionality
export function importTests(jsonString: string): void {
  try {
    const imported = JSON.parse(jsonString);
    const tests = loadAllTests();

    if (Array.isArray(imported)) {
      // Importing multiple tests
      tests.push(...imported);
    } else {
      // Importing single test
      tests.push(imported);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    }
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
