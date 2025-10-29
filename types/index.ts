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

export interface ArchivedFeedback {
  id: string;
  date: string; // ISO date string
  testName: string;
  studentName: string;
  studentNumber?: string;
  tasks: Task[]; // Snapshot of task configuration at time of feedback
  taskFeedbacks: TaskFeedback[];
  generalComment: string;
  individualComment: string;
  totalPoints: number;
  maxPoints: number;
}

export interface TaskStatistics {
  taskLabel: string;
  taskId: string;
  subtaskId?: string;
  averagePoints: number;
  maxPoints: number;
  totalSubmissions: number;
  pointsDistribution: number[]; // Count of each point value (0-6)
}

export interface StudentProgress {
  studentName: string;
  feedbacks: ArchivedFeedback[];
  averageScore: number;
  totalTests: number;
}

// New test-centric data model
export interface Student {
  id: string;
  name: string;
  studentNumber?: string;
  taskFeedbacks: TaskFeedback[];
  individualComment: string;
  completedDate?: string; // ISO date string when feedback was completed
}

export interface Test {
  id: string;
  name: string; // e.g., "October Test - Logarithms"
  description?: string; // e.g., "logarithms", "chapter 3-5"
  tasks: Task[];
  generalComment: string;
  students: Student[];
  createdDate: string; // ISO date string
  lastModified: string; // ISO date string
}

export interface TestSummary {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  completedCount: number;
  createdDate: string;
  lastModified: string;
}

