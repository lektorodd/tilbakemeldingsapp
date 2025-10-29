import { Task, TaskFeedback } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'math-feedback-tasks',
  GENERAL_COMMENT: 'math-feedback-general-comment',
  TEST_NAME: 'math-feedback-test-name',
};

export function saveTasks(tasks: Task[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
}

export function loadTasks(): Task[] | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

export function saveGeneralComment(comment: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.GENERAL_COMMENT, comment);
  }
}

export function loadGeneralComment(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.GENERAL_COMMENT) || '';
  }
  return '';
}

export function saveTestName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TEST_NAME, name);
  }
}

export function loadTestName(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.TEST_NAME) || 'Matteprøve';
  }
  return 'Matteprøve';
}

export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
