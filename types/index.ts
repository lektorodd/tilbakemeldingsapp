export interface Task {
  id: string;
  label: string; // e.g., "1", "2", "3"
  subtasks: Subtask[];
  hasSubtasks: boolean;
  labels: string[]; // e.g., ["logarithms", "equations", "algebra"]
  category?: number; // 1, 2, or 3
  part?: 1 | 2; // 1 = no aids, 2 = all aids
  weight?: number; // Task weight for scoring (default: 1). Controls how much this task counts toward the total score.
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
  points: number | null; // null = ungraded, 0-6 when graded
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
  absent?: boolean; // true = student was not present for this test
  taskFeedbacks: TaskFeedback[];
  individualComment: string;
  completedDate?: string;
  score?: number; // Calculated, not stored
}

export interface FeedbackSnippet {
  id: string;
  text: string;
  category?: 'standard' | 'encouragement' | 'error' | 'custom' | 'math';
  createdDate: string;
}

export interface CourseTest {
  id: string;
  name: string; // e.g., "October Test - Logarithms"
  description?: string;
  date: string; // Test date
  tasks: Task[];
  generalComment: string;
  studentFeedbacks: TestFeedbackData[]; // Feedback for each student on this test
  // Part configuration for two-part tests (Part 1: no aids, Part 2: all aids)
  hasTwoParts?: boolean;
  part1TaskCount?: number;
  part2TaskCount?: number;
  restartNumberingInPart2?: boolean;
  snippets?: FeedbackSnippet[]; // Test-specific comment snippets
  createdDate: string;
  lastModified: string;
}

// Oral Assessment - separate from written tests
export interface OralTest {
  id: string;
  name: string; // e.g., "Oral Exam - Derivatives"
  description?: string;
  date: string; // Assessment date
  topics?: string[]; // Topics covered (e.g., ["derivatives", "integrals"])
  labels?: string[]; // Course labels applied to this oral assessment
  studentAssessments: OralFeedbackData[]; // Assessments for each student
  generalNotes?: string; // General notes about this oral assessment
  createdDate: string;
  lastModified: string;
}

export interface Course {
  id: string;
  name: string; // e.g., "Math 10A - Fall 2024"
  description?: string;
  students: CourseStudent[]; // All students in this course
  tests: CourseTest[]; // Written tests in this course
  oralTests?: OralTest[]; // Oral assessments in this course
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

// Oral feedback types - LK20-based assessment dimensions
export type OralFeedbackDimensionType =
  | 'strategy' // Strategival og metode
  | 'reasoning' // Resonnering og argumentasjon
  | 'representations' // Representasjonar
  | 'modeling' // Modellering / anvending
  | 'communication' // Kommunikasjon
  | 'subject_knowledge'; // Fagleg forståing (kunnskapsområde)

export interface OralFeedbackDimension {
  dimension: OralFeedbackDimensionType;
  points: number; // 0-6
  comment: string; // Additional notes on this dimension
  weight?: number; // Optional weight for this dimension (default: 1). Higher weight = more influence on final score.
}

export interface OralFeedbackData {
  studentId: string;
  dimensions: OralFeedbackDimension[]; // All 6 dimensions
  generalObservations: string; // Overall notes from the oral assessment
  taskReferences?: string[]; // Which tasks/topics were discussed
  recordedDate?: string; // When the oral assessment took place
  duration?: number; // Duration in minutes
  completedDate?: string; // When the teacher finished the assessment
  score?: number; // Calculated average across dimensions (0-60 scale)
}

// Per-student scores for a specific task (used in analytics drill-down and task-level grading)
export interface TaskStudentScore {
  studentId: string;
  studentName: string;
  studentNumber?: string;
  points: number | null;
  comment: string;
  hasAttempted: boolean;
}

// Task-level analytics for a specific test
export interface TaskAnalytics {
  taskId: string;
  subtaskId?: string;
  label: string; // e.g., "1", "1a", "2b"
  fullLabel: string; // e.g., "Part 1 - Task 1a", "Task 2"
  part?: 1 | 2;
  category?: number;
  labels: string[]; // Theme labels
  averageScore: number; // Average points across all students who attempted
  attemptCount: number; // Number of students who scored 1+ points
  attemptPercentage: number; // Percentage of students who attempted (1+ points)
  totalStudents: number; // Total students with completed feedback
  scoreDistribution: Record<number, number>; // Count for each score 0-6
}

