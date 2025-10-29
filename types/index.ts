export interface Task {
  id: string;
  label: string; // e.g., "1", "2", "3"
  subtasks: Subtask[];
  hasSubtasks: boolean;
  labels: string[]; // e.g., ["logarithms", "equations", "algebra"]
  category?: number; // 1, 2, or 3
}

export interface Subtask {
  id: string;
  label: string; // e.g., "a", "b", "c"
  labels: string[]; // Subtasks can also have their own labels
  category?: number; // 1, 2, or 3
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

// Course-centric data model
export interface CourseStudent {
  id: string;
  name: string;
  studentNumber?: string;
}

export interface TestFeedbackData {
  studentId: string;
  taskFeedbacks: TaskFeedback[];
  individualComment: string;
  completedDate?: string;
  score?: number; // Calculated, not stored
}

export interface CourseTest {
  id: string;
  name: string; // e.g., "October Test - Logarithms"
  description?: string;
  date: string; // Test date
  tasks: Task[];
  generalComment: string;
  studentFeedbacks: TestFeedbackData[]; // Feedback for each student on this test
  createdDate: string;
  lastModified: string;
}

export interface Course {
  id: string;
  name: string; // e.g., "Math 10A - Fall 2024"
  description?: string;
  students: CourseStudent[]; // All students in this course
  tests: CourseTest[]; // All tests in this course
  availableLabels: string[]; // Course-specific labels (e.g., ["fractions", "logarithms", "equations"])
  createdDate: string;
  lastModified: string;
}

export interface CourseSummary {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  testCount: number;
  createdDate: string;
  lastModified: string;
}

// Analytics interfaces
export interface StudentTestResult {
  testId: string;
  testName: string;
  testDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  completed: boolean;
}

export interface StudentCourseProgress {
  student: CourseStudent;
  testResults: StudentTestResult[];
  averageScore: number;
  averagePercentage: number;
  completedTests: number;
  totalTests: number;
}

export interface TestResultsSummary {
  test: CourseTest;
  completedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  studentResults: Array<{
    student: CourseStudent;
    score: number;
    completed: boolean;
  }>;
}

// Label-based analytics
export interface LabelPerformance {
  label: string;
  averageScore: number;
  taskCount: number;
  studentScores: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    completedTasks: number;
  }>;
}

export interface CategoryPerformance {
  category: number;
  averageScore: number;
  taskCount: number;
  description: string; // e.g., "Category 1 (Easy)", "Category 2 (Medium)", "Category 3 (Hard)"
}

