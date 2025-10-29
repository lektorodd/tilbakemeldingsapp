export interface Task {
  id: string;
  label: string; // e.g., "1", "2", "3"
  subtasks: Subtask[];
  hasSubtasks: boolean;
}

export interface Subtask {
  id: string;
  label: string; // e.g., "a", "b", "c"
}

export interface TaskFeedback {
  taskId: string;
  subtaskId?: string;
  points: number; // 0-6
  comment: string; // Supports Typst math notation
}

export interface StudentFeedback {
  studentName: string;
  studentNumber?: string;
  taskFeedbacks: TaskFeedback[];
  individualComment: string;
  generalComment: string;
  totalPoints: number;
  maxPoints: number;
}

export interface TestConfiguration {
  testName: string;
  tasks: Task[];
  maxPointsPerTask: number;
  generalComment: string;
}
