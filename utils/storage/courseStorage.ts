import { Course, CourseStudent, CourseTest, OralTest, CourseSummary, TestFeedbackData, Task, TaskFeedback, StudentCourseProgress, StudentTestResult, TestResultsSummary, LabelPerformance, CategoryPerformance, OralFeedbackData, TaskAnalytics, TaskStudentScore } from '@/types';
import { saveCourseToFolder, deleteCourseFromFolder, isFolderConnected, saveAllCoursesToFolder } from '../folderSync';

const COURSES_KEY = 'math-feedback-courses';
const BACKUP_KEY_PREFIX = 'math-feedback-backup-';
const BACKUP_INDEX_KEY = 'math-feedback-backup-index';
const MAX_BACKUPS = 10;
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

let autoBackupTimer: ReturnType<typeof setInterval> | null = null;

// Course CRUD operations
export function saveCourse(course: Course): void {
  const courses = loadAllCourses();
  const existingIndex = courses.findIndex(c => c.id === course.id);

  course.lastModified = new Date().toISOString();

  if (existingIndex >= 0) {
    courses[existingIndex] = course;
  } else {
    courses.push(course);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  }

  // Sync to connected folder (OneDrive etc.)
  if (isFolderConnected()) {
    saveCourseToFolder(course);
  }
}

export function loadAllCourses(): Course[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(COURSES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

export function loadCourse(courseId: string): Course | null {
  const courses = loadAllCourses();
  return courses.find(c => c.id === courseId) || null;
}

export function deleteCourse(courseId: string): void {
  const courses = loadAllCourses();
  const courseToDelete = courses.find(c => c.id === courseId);
  const filtered = courses.filter(c => c.id !== courseId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
  }

  // Remove from connected folder
  if (isFolderConnected() && courseToDelete) {
    deleteCourseFromFolder(courseToDelete.name);
  }
}

export function updateCourse(courseId: string, updates: Partial<Course>): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const updatedCourse = {
    ...course,
    ...updates,
  };

  saveCourse(updatedCourse);
}

export function getCourseSummaries(): CourseSummary[] {
  const courses = loadAllCourses();
  return courses.map(course => ({
    id: course.id,
    name: course.name,
    description: course.description,
    studentCount: course.students.length,
    testCount: course.tests.length,
    createdDate: course.createdDate,
    lastModified: course.lastModified,
  }));
}

// Student operations
export function addStudentToCourse(courseId: string, student: Omit<CourseStudent, 'id'>): CourseStudent {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const newStudent: CourseStudent = {
    ...student,
    id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  course.students.push(newStudent);
  saveCourse(course);

  return newStudent;
}

export function updateStudent(courseId: string, studentId: string, updates: Partial<CourseStudent>): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const studentIndex = course.students.findIndex(s => s.id === studentId);
  if (studentIndex < 0) throw new Error('Student not found');

  course.students[studentIndex] = {
    ...course.students[studentIndex],
    ...updates,
  };

  saveCourse(course);
}

export function deleteStudent(courseId: string, studentId: string): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  course.students = course.students.filter(s => s.id !== studentId);

  // Also remove their feedback from all tests
  course.tests.forEach(test => {
    test.studentFeedbacks = test.studentFeedbacks.filter(f => f.studentId !== studentId);
  });

  saveCourse(course);
}

// Test operations
export function addTestToCourse(courseId: string, test: Omit<CourseTest, 'id' | 'createdDate' | 'lastModified' | 'studentFeedbacks'>): CourseTest {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const newTest: CourseTest = {
    ...test,
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    studentFeedbacks: [],
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  course.tests.push(newTest);
  saveCourse(course);

  return newTest;
}

export function updateTest(courseId: string, testId: string, updates: Partial<CourseTest>): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const testIndex = course.tests.findIndex(t => t.id === testId);
  if (testIndex < 0) throw new Error('Test not found');

  course.tests[testIndex] = {
    ...course.tests[testIndex],
    ...updates,
    lastModified: new Date().toISOString(),
  };

  saveCourse(course);
}

export function deleteTest(courseId: string, testId: string): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  course.tests = course.tests.filter(t => t.id !== testId);
  saveCourse(course);
}

// Feedback operations
export function updateStudentFeedback(
  courseId: string,
  testId: string,
  studentId: string,
  updates: Partial<TestFeedbackData>
): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  const test = course.tests.find(t => t.id === testId);
  if (!test) throw new Error('Test not found');

  const feedbackIndex = test.studentFeedbacks.findIndex(f => f.studentId === studentId);

  if (feedbackIndex >= 0) {
    test.studentFeedbacks[feedbackIndex] = {
      ...test.studentFeedbacks[feedbackIndex],
      ...updates,
    };
  } else {
    test.studentFeedbacks.push({
      studentId,
      taskFeedbacks: [],
      individualComment: '',
      ...updates,
    });
  }

  saveCourse(course);
}

export function getStudentFeedback(courseId: string, testId: string, studentId: string): TestFeedbackData | null {
  const course = loadCourse(courseId);
  if (!course) return null;

  const test = course.tests.find(t => t.id === testId);
  if (!test) return null;

  return test.studentFeedbacks.find(f => f.studentId === studentId) || null;
}

// Oral Test CRUD operations
export function addOralTest(courseId: string, oralTest: OralTest): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  if (!course.oralTests) {
    course.oralTests = [];
  }

  course.oralTests.push(oralTest);
  saveCourse(course);
}

export function updateOralTest(courseId: string, oralTestId: string, updates: Partial<OralTest>): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  if (!course.oralTests) {
    throw new Error('No oral tests in course');
  }

  const oralTestIndex = course.oralTests.findIndex(t => t.id === oralTestId);
  if (oralTestIndex === -1) throw new Error('Oral test not found');

  course.oralTests[oralTestIndex] = {
    ...course.oralTests[oralTestIndex],
    ...updates,
    lastModified: new Date().toISOString(),
  };

  saveCourse(course);
}

export function deleteOralTest(courseId: string, oralTestId: string): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  if (!course.oralTests) return;

  course.oralTests = course.oralTests.filter(t => t.id !== oralTestId);
  saveCourse(course);
}

// Oral Assessment operations
export function updateOralAssessment(
  courseId: string,
  oralTestId: string,
  studentId: string,
  updates: Partial<OralFeedbackData>
): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  if (!course.oralTests) {
    throw new Error('No oral tests in course');
  }

  const oralTest = course.oralTests.find(t => t.id === oralTestId);
  if (!oralTest) throw new Error('Oral test not found');

  const assessmentIndex = oralTest.studentAssessments.findIndex(a => a.studentId === studentId);

  if (assessmentIndex >= 0) {
    oralTest.studentAssessments[assessmentIndex] = {
      ...oralTest.studentAssessments[assessmentIndex],
      ...updates,
    };
  } else {
    oralTest.studentAssessments.push({
      studentId,
      dimensions: [],
      generalObservations: '',
      ...updates,
    });
  }

  saveCourse(course);
}

export function getOralAssessment(courseId: string, oralTestId: string, studentId: string): OralFeedbackData | null {
  const course = loadCourse(courseId);
  if (!course || !course.oralTests) return null;

  const oralTest = course.oralTests.find(t => t.id === oralTestId);
  if (!oralTest) return null;

  return oralTest.studentAssessments.find(a => a.studentId === studentId) || null;
}

export function deleteOralAssessment(courseId: string, oralTestId: string, studentId: string): void {
  const course = loadCourse(courseId);
  if (!course) throw new Error('Course not found');

  if (!course.oralTests) return;

  const oralTest = course.oralTests.find(t => t.id === oralTestId);
  if (!oralTest) return;

  oralTest.studentAssessments = oralTest.studentAssessments.filter(a => a.studentId !== studentId);
  saveCourse(course);
}

export function calculateOralScore(oralFeedback: OralFeedbackData): number {
  if (oralFeedback.dimensions.length === 0) return 0;

  const totalPoints = oralFeedback.dimensions.reduce((sum, dim) => sum + dim.points, 0);
  const averagePoints = totalPoints / oralFeedback.dimensions.length;
  return Math.round(averagePoints * 10);
}

// Scoring calculations
export function calculateStudentScore(tasks: Task[], feedbacks: TaskFeedback[]): number {
  const taskCount = countTasks(tasks);
  if (taskCount === 0) return 0;

  const totalPoints = feedbacks.reduce((sum, f) => sum + f.points, 0);
  const averagePerTask = totalPoints / taskCount;
  return Math.round(averagePerTask * 10);
}

export function calculateMaxScore(): number {
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

// Analytics
export function getStudentProgress(courseId: string, studentId: string): StudentCourseProgress | null {
  const course = loadCourse(courseId);
  if (!course) return null;

  const student = course.students.find(s => s.id === studentId);
  if (!student) return null;

  const testResults: StudentTestResult[] = course.tests.map(test => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === studentId);
    const score = feedback ? calculateStudentScore(test.tasks, feedback.taskFeedbacks) : 0;
    const percentage = (score / 60) * 100;

    return {
      testId: test.id,
      testName: test.name,
      testDate: test.date,
      score,
      maxScore: 60,
      percentage,
      completed: !!feedback?.completedDate,
    };
  }).sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

  const completedResults = testResults.filter(r => r.completed);
  const averageScore = completedResults.length > 0
    ? completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length
    : 0;
  const averagePercentage = completedResults.length > 0
    ? completedResults.reduce((sum, r) => sum + r.percentage, 0) / completedResults.length
    : 0;

  return {
    student,
    testResults,
    averageScore,
    averagePercentage,
    completedTests: completedResults.length,
    totalTests: course.tests.length,
  };
}

export function getTestResults(courseId: string, testId: string): TestResultsSummary | null {
  const course = loadCourse(courseId);
  if (!course) return null;

  const test = course.tests.find(t => t.id === testId);
  if (!test) return null;

  const studentResults = course.students.map(student => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);
    const score = feedback ? calculateStudentScore(test.tasks, feedback.taskFeedbacks) : 0;

    return {
      student,
      score,
      completed: !!feedback?.completedDate,
    };
  });

  const completedResults = studentResults.filter(r => r.completed);
  const scores = completedResults.map(r => r.score);

  return {
    test,
    completedCount: completedResults.length,
    averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    studentResults,
  };
}

// Label and Category Analytics
export function getLabelPerformance(courseId: string): LabelPerformance[] {
  const course = loadCourse(courseId);
  if (!course || course.availableLabels.length === 0) return [];

  const labelMap = new Map<string, {
    totalPoints: number;
    totalTasks: number;
    studentScores: Map<string, { totalPoints: number; taskCount: number }>;
  }>();

  // Initialize all labels
  course.availableLabels.forEach(label => {
    labelMap.set(label, {
      totalPoints: 0,
      totalTasks: 0,
      studentScores: new Map(),
    });
  });

  // Aggregate data from all tests
  course.tests.forEach(test => {
    test.studentFeedbacks.forEach(feedback => {
      if (!feedback.completedDate) return; // Only include completed feedback

      feedback.taskFeedbacks.forEach(taskFeedback => {
        // Find the task or subtask
        const task = test.tasks.find(t => t.id === taskFeedback.taskId);
        if (!task) return;

        let labels: string[] = [];

        if (taskFeedback.subtaskId) {
          const subtask = task.subtasks.find(st => st.id === taskFeedback.subtaskId);
          if (subtask) {
            labels = subtask.labels || [];
          }
        } else {
          labels = task.labels || [];
        }

        // Update stats for each label
        labels.forEach(label => {
          const labelData = labelMap.get(label);
          if (!labelData) return;

          labelData.totalPoints += taskFeedback.points;
          labelData.totalTasks += 1;

          // Update student-specific data
          const studentId = feedback.studentId;
          if (!labelData.studentScores.has(studentId)) {
            labelData.studentScores.set(studentId, { totalPoints: 0, taskCount: 0 });
          }
          const studentData = labelData.studentScores.get(studentId)!;
          studentData.totalPoints += taskFeedback.points;
          studentData.taskCount += 1;
        });
      });
    });
  });

  // Convert to array format
  return Array.from(labelMap.entries()).map(([label, data]) => {
    const averageScore = data.totalTasks > 0 ? data.totalPoints / data.totalTasks : 0;

    const studentScores = Array.from(data.studentScores.entries()).map(([studentId, studentData]) => {
      const student = course.students.find(s => s.id === studentId);
      return {
        studentId,
        studentName: student?.name || 'Unknown',
        averageScore: studentData.taskCount > 0 ? studentData.totalPoints / studentData.taskCount : 0,
        completedTasks: studentData.taskCount,
      };
    }).sort((a, b) => b.averageScore - a.averageScore); // Sort by score descending

    return {
      label,
      averageScore,
      taskCount: data.totalTasks,
      studentScores,
    };
  }).sort((a, b) => a.label.localeCompare(b.label)); // Sort by label name
}

export function getCategoryPerformance(courseId: string): CategoryPerformance[] {
  const course = loadCourse(courseId);
  if (!course) return [];

  const categoryMap = new Map<number, {
    totalPoints: number;
    totalTasks: number;
  }>();

  // Initialize categories 1, 2, 3
  [1, 2, 3].forEach(cat => {
    categoryMap.set(cat, { totalPoints: 0, totalTasks: 0 });
  });

  // Aggregate data from all tests
  course.tests.forEach(test => {
    test.studentFeedbacks.forEach(feedback => {
      if (!feedback.completedDate) return; // Only include completed feedback

      feedback.taskFeedbacks.forEach(taskFeedback => {
        // Find the task or subtask
        const task = test.tasks.find(t => t.id === taskFeedback.taskId);
        if (!task) return;

        let category: number | undefined;

        if (taskFeedback.subtaskId) {
          const subtask = task.subtasks.find(st => st.id === taskFeedback.subtaskId);
          if (subtask) {
            category = subtask.category;
          }
        } else {
          category = task.category;
        }

        if (!category) return; // Skip tasks without category

        const categoryData = categoryMap.get(category);
        if (!categoryData) return;

        categoryData.totalPoints += taskFeedback.points;
        categoryData.totalTasks += 1;
      });
    });
  });

  // Convert to array format
  const descriptions = {
    1: 'Category 1',
    2: 'Category 2',
    3: 'Category 3',
  };

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      averageScore: data.totalTasks > 0 ? data.totalPoints / data.totalTasks : 0,
      taskCount: data.totalTasks,
      description: descriptions[category as 1 | 2 | 3],
    }))
    .filter(cat => cat.taskCount > 0) // Only include categories with data
    .sort((a, b) => a.category - b.category);
}

// Individual Student Analytics
export function getStudentDetailedAnalytics(courseId: string, studentId: string) {
  const course = loadCourse(courseId);
  if (!course) return null;

  const student = course.students.find(s => s.id === studentId);
  if (!student) return null;

  // Performance across tests
  const testPerformance = course.tests.map(test => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === studentId);
    if (!feedback) {
      return {
        testId: test.id,
        testName: test.name,
        testDate: test.date,
        score: 0,
        maxScore: 60,
        completed: false,
        tasksAttempted: 0,
        totalTasks: countTasks(test.tasks),
        attemptPercentage: 0,
        scoreDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      };
    }

    const totalTasks = countTasks(test.tasks);
    const tasksAttempted = feedback.taskFeedbacks.filter(f => f.points > 0).length;
    const attemptPercentage = totalTasks > 0 ? (tasksAttempted / totalTasks) * 100 : 0;

    // Calculate score distribution (how many tasks got 0, 1, 2, 3, 4, 5, 6 points)
    const scoreDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    // Count feedback entries
    feedback.taskFeedbacks.forEach(tf => {
      const points = Math.min(6, Math.max(0, tf.points)); // Clamp to 0-6
      scoreDistribution[points] = (scoreDistribution[points] || 0) + 1;
    });

    // Add unattempted tasks (tasks without feedback) as 0 points
    const unattemptedTasks = totalTasks - feedback.taskFeedbacks.length;
    if (unattemptedTasks > 0) {
      scoreDistribution[0] += unattemptedTasks;
    }

    return {
      testId: test.id,
      testName: test.name,
      testDate: test.date,
      score: calculateStudentScore(test.tasks, feedback.taskFeedbacks),
      maxScore: 60,
      completed: !!feedback.completedDate,
      tasksAttempted,
      totalTasks,
      attemptPercentage,
      scoreDistribution,
    };
  }).sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());

  // Performance by label
  const labelPerformance = new Map<string, { totalPoints: number; taskCount: number }>();

  course.availableLabels.forEach(label => {
    labelPerformance.set(label, { totalPoints: 0, taskCount: 0 });
  });

  course.tests.forEach(test => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === studentId);
    if (!feedback || !feedback.completedDate) return;

    feedback.taskFeedbacks.forEach(taskFeedback => {
      const task = test.tasks.find(t => t.id === taskFeedback.taskId);
      if (!task) return;

      let labels: string[] = [];
      if (taskFeedback.subtaskId) {
        const subtask = task.subtasks.find(st => st.id === taskFeedback.subtaskId);
        if (subtask) labels = subtask.labels || [];
      } else {
        labels = task.labels || [];
      }

      labels.forEach(label => {
        const data = labelPerformance.get(label);
        if (data) {
          data.totalPoints += taskFeedback.points;
          data.taskCount += 1;
        }
      });
    });
  });

  const labelStats = Array.from(labelPerformance.entries())
    .map(([label, data]) => ({
      label,
      averageScore: data.taskCount > 0 ? data.totalPoints / data.taskCount : 0,
      taskCount: data.taskCount,
    }))
    .filter(l => l.taskCount > 0)
    .sort((a, b) => a.label.localeCompare(b.label));

  // Performance by category
  const categoryPerformance = new Map<number, { totalPoints: number; taskCount: number }>();
  [1, 2, 3].forEach(cat => categoryPerformance.set(cat, { totalPoints: 0, taskCount: 0 }));

  course.tests.forEach(test => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === studentId);
    if (!feedback || !feedback.completedDate) return;

    feedback.taskFeedbacks.forEach(taskFeedback => {
      const task = test.tasks.find(t => t.id === taskFeedback.taskId);
      if (!task) return;

      let category: number | undefined;
      if (taskFeedback.subtaskId) {
        const subtask = task.subtasks.find(st => st.id === taskFeedback.subtaskId);
        if (subtask) category = subtask.category;
      } else {
        category = task.category;
      }

      if (!category) return;

      const data = categoryPerformance.get(category);
      if (data) {
        data.totalPoints += taskFeedback.points;
        data.taskCount += 1;
      }
    });
  });

  const categoryStats = Array.from(categoryPerformance.entries())
    .map(([category, data]) => ({
      category,
      averageScore: data.taskCount > 0 ? data.totalPoints / data.taskCount : 0,
      taskCount: data.taskCount,
      description: `Category ${category}`,
    }))
    .filter(c => c.taskCount > 0)
    .sort((a, b) => a.category - b.category);

  // Performance by part (no aids vs all aids)
  const partPerformance = new Map<1 | 2, { totalPoints: number; taskCount: number }>();
  partPerformance.set(1, { totalPoints: 0, taskCount: 0 }); // Part 1: No aids
  partPerformance.set(2, { totalPoints: 0, taskCount: 0 }); // Part 2: All aids

  course.tests.forEach(test => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === studentId);
    if (!feedback || !feedback.completedDate) return;

    feedback.taskFeedbacks.forEach(taskFeedback => {
      const task = test.tasks.find(t => t.id === taskFeedback.taskId);
      if (!task || !task.part) return;

      const data = partPerformance.get(task.part);
      if (data) {
        data.totalPoints += taskFeedback.points;
        data.taskCount += 1;
      }
    });
  });

  const partStats = Array.from(partPerformance.entries())
    .map(([part, data]) => ({
      part,
      averageScore: data.taskCount > 0 ? data.totalPoints / data.taskCount : 0,
      taskCount: data.taskCount,
      description: part === 1 ? 'Part 1: No aids' : 'Part 2: All aids',
    }))
    .filter(p => p.taskCount > 0)
    .sort((a, b) => a.part - b.part);

  // Performance across oral assessments
  const oralPerformance = (course.oralTests || []).map(oralTest => {
    const assessment = oralTest.studentAssessments.find(a => a.studentId === studentId);
    if (!assessment) {
      return {
        oralTestId: oralTest.id,
        oralTestName: oralTest.name,
        oralTestDate: oralTest.date,
        score: 0,
        maxScore: 60,
        completed: false,
        dimensions: [],
      };
    }

    return {
      oralTestId: oralTest.id,
      oralTestName: oralTest.name,
      oralTestDate: oralTest.date,
      score: assessment.score || calculateOralScore(assessment),
      maxScore: 60,
      completed: !!assessment.completedDate,
      dimensions: assessment.dimensions,
    };
  }).sort((a, b) => new Date(a.oralTestDate).getTime() - new Date(b.oralTestDate).getTime());

  // Overall stats (including oral assessments)
  const completedTests = testPerformance.filter(t => t.completed);
  const completedOralTests = oralPerformance.filter(o => o.completed);

  const totalCompletedAssessments = completedTests.length + completedOralTests.length;
  const allScores = [
    ...completedTests.map(t => t.score),
    ...completedOralTests.map(o => o.score),
  ];

  const averageScore = totalCompletedAssessments > 0
    ? allScores.reduce((sum, score) => sum + score, 0) / totalCompletedAssessments
    : 0;

  const averageAttemptRate = testPerformance.length > 0
    ? testPerformance.reduce((sum, t) => sum + t.attemptPercentage, 0) / testPerformance.length
    : 0;

  return {
    student,
    course,
    testPerformance,
    oralPerformance,
    labelPerformance: labelStats,
    categoryPerformance: categoryStats,
    partPerformance: partStats,
    overallStats: {
      completedTests: completedTests.length,
      totalTests: course.tests.length,
      completedOralTests: completedOralTests.length,
      totalOralTests: (course.oralTests || []).length,
      averageScore,
      averageAttemptRate,
    },
  };
}

// Test Task Analytics - Analyze task performance for a specific test
export function getTestTaskAnalytics(courseId: string, testId: string): TaskAnalytics[] {
  const course = loadCourse(courseId);
  if (!course) return [];

  const test = course.tests.find(t => t.id === testId);
  if (!test) return [];

  // Get completed feedback only
  const completedFeedbacks = test.studentFeedbacks.filter(f => f.completedDate);
  const totalStudents = completedFeedbacks.length;

  if (totalStudents === 0) return [];

  const taskAnalytics: TaskAnalytics[] = [];

  // Process each task
  test.tasks.forEach((task) => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      // Process each subtask
      task.subtasks.forEach((subtask) => {
        const analytics = calculateTaskAnalytics(
          task,
          subtask,
          completedFeedbacks,
          totalStudents,
          test.hasTwoParts
        );
        taskAnalytics.push(analytics);
      });
    } else {
      // Process task without subtasks
      const analytics = calculateTaskAnalytics(
        task,
        undefined,
        completedFeedbacks,
        totalStudents,
        test.hasTwoParts
      );
      taskAnalytics.push(analytics);
    }
  });

  return taskAnalytics;
}

function calculateTaskAnalytics(
  task: Task,
  subtask: { id: string; label: string; labels: string[]; category?: number } | undefined,
  completedFeedbacks: TestFeedbackData[],
  totalStudents: number,
  hasTwoParts?: boolean
): TaskAnalytics {
  const taskId = task.id;
  const subtaskId = subtask?.id;

  // Collect all feedback for this task/subtask
  const feedbacks = completedFeedbacks
    .flatMap(f => f.taskFeedbacks)
    .filter(tf =>
      tf.taskId === taskId &&
      (subtaskId ? tf.subtaskId === subtaskId : !tf.subtaskId)
    );

  // Calculate statistics
  const scoreDistribution: Record<number, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  };

  let totalPoints = 0;
  let attemptCount = 0; // Students who scored 1+ points

  feedbacks.forEach(feedback => {
    const points = Math.min(6, Math.max(0, feedback.points));
    scoreDistribution[points]++;
    totalPoints += points;

    if (points >= 1) {
      attemptCount++;
    }
  });

  // Account for students who didn't attempt (no feedback entry)
  const unattempted = totalStudents - feedbacks.length;
  scoreDistribution[0] += unattempted;

  const averageScore = feedbacks.length > 0 ? totalPoints / feedbacks.length : 0;
  const attemptPercentage = totalStudents > 0 ? (attemptCount / totalStudents) * 100 : 0;

  // Build labels
  const label = subtask ? `${task.label}${subtask.label}` : task.label;
  let fullLabel = label;

  if (hasTwoParts && task.part) {
    fullLabel = `Part ${task.part} - Task ${label}`;
  } else {
    fullLabel = `Task ${label}`;
  }

  return {
    taskId,
    subtaskId,
    label,
    fullLabel,
    part: task.part,
    category: subtask?.category ?? task.category,
    labels: subtask?.labels ?? task.labels,
    averageScore,
    attemptCount,
    attemptPercentage,
    totalStudents,
    scoreDistribution,
  };
}

// Get per-student scores for a specific task/subtask (used in analytics drill-down and task-level grading)
export function getTaskStudentScores(
  courseId: string,
  testId: string,
  taskId: string,
  subtaskId?: string
): TaskStudentScore[] {
  const course = loadCourse(courseId);
  if (!course) return [];

  const test = course.tests.find(t => t.id === testId);
  if (!test) return [];

  return course.students.map(student => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);
    const taskFeedback = feedback?.taskFeedbacks.find(
      tf => tf.taskId === taskId && (subtaskId ? tf.subtaskId === subtaskId : !tf.subtaskId)
    );

    return {
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentNumber,
      points: taskFeedback?.points ?? 0,
      comment: taskFeedback?.comment ?? '',
      hasAttempted: (taskFeedback?.points ?? 0) > 0 || (taskFeedback?.comment ?? '').trim().length > 0,
    };
  });
}

// ==========================================
// FOLDER SYNC — Smart bidirectional merge on startup, migrate to folder
// ==========================================

/**
 * Merge feedback arrays: union-merge by studentId.
 * For each studentId, keep the entry with more data (more taskFeedbacks,
 * or the one with a completedDate if the other doesn't have one).
 * Never discard in-progress feedback.
 */
export function mergeFeedbacks(
  localFeedbacks: TestFeedbackData[],
  folderFeedbacks: TestFeedbackData[]
): TestFeedbackData[] {
  const merged = new Map<string, TestFeedbackData>();

  // Start with all local feedback
  for (const fb of localFeedbacks) {
    merged.set(fb.studentId, fb);
  }

  // Union-merge folder feedback
  for (const folderFb of folderFeedbacks) {
    const existing = merged.get(folderFb.studentId);
    if (!existing) {
      // Student only exists in folder — keep it
      merged.set(folderFb.studentId, folderFb);
    } else {
      // Student exists in both — pick the best version
      const existingHasData = existing.taskFeedbacks.length > 0 ||
        existing.individualComment.trim().length > 0;
      const folderHasData = folderFb.taskFeedbacks.length > 0 ||
        folderFb.individualComment.trim().length > 0;

      if (!existingHasData && folderHasData) {
        // Local is empty, folder has data — use folder
        merged.set(folderFb.studentId, folderFb);
      } else if (existingHasData && !folderHasData) {
        // Local has data, folder is empty — keep local (in-progress work!)
        // Already in map, do nothing
      } else if (existingHasData && folderHasData) {
        // Both have data — prefer completed over not-completed,
        // then prefer more taskFeedbacks, then prefer newer
        if (!existing.completedDate && folderFb.completedDate) {
          // Folder is completed but local isn't — check if local has MORE feedback
          if (existing.taskFeedbacks.length > folderFb.taskFeedbacks.length) {
            // Local has more work, keep local (user may have added new feedback)
          } else {
            merged.set(folderFb.studentId, folderFb);
          }
        } else if (existing.completedDate && !folderFb.completedDate) {
          // Local is completed, folder isn't — keep local
        } else {
          // Same completion status — prefer the one with more data
          if (folderFb.taskFeedbacks.length > existing.taskFeedbacks.length) {
            merged.set(folderFb.studentId, folderFb);
          }
        }
      }
    }
  }

  return Array.from(merged.values());
}

/**
 * Merge tests: union-merge by test id.
 * For each test, merge their studentFeedbacks.
 */
export function mergeTests(
  localTests: CourseTest[],
  folderTests: CourseTest[]
): CourseTest[] {
  const merged = new Map<string, CourseTest>();

  // Start with all local tests
  for (const test of localTests) {
    merged.set(test.id, test);
  }

  // Union-merge folder tests
  for (const folderTest of folderTests) {
    const existing = merged.get(folderTest.id);
    if (!existing) {
      // Test only in folder — keep it
      merged.set(folderTest.id, folderTest);
    } else {
      // Test in both — merge feedback, keep newer config
      const useFolder = new Date(folderTest.lastModified) > new Date(existing.lastModified);
      const mergedTest: CourseTest = {
        ...(useFolder ? folderTest : existing),
        studentFeedbacks: mergeFeedbacks(
          existing.studentFeedbacks,
          folderTest.studentFeedbacks
        ),
      };
      merged.set(folderTest.id, mergedTest);
    }
  }

  return Array.from(merged.values());
}

/**
 * Smart bidirectional sync: merge folder data with localStorage.
 * Never discards in-progress feedback that exists only in localStorage.
 * Call on app startup after initFolderSync() succeeds.
 * Returns true if sync completed.
 */
export async function syncFromFolder(): Promise<boolean> {
  const { loadCoursesFromFolder } = await import('../folderSync');
  const folderCourses = await loadCoursesFromFolder();
  if (folderCourses === null) return false;

  const localCourses = loadAllCourses();

  // Build lookup maps
  const localMap = new Map<string, Course>();
  for (const c of localCourses) localMap.set(c.id, c);

  const folderMap = new Map<string, Course>();
  for (const c of folderCourses) folderMap.set(c.id, c);

  // Collect all unique course IDs
  const allIds = new Set([...localMap.keys(), ...folderMap.keys()]);
  const mergedCourses: Course[] = [];

  for (const id of allIds) {
    const local = localMap.get(id);
    const folder = folderMap.get(id);

    if (local && !folder) {
      // Only in localStorage — keep it
      mergedCourses.push(local);
    } else if (!local && folder) {
      // Only in folder — add it
      mergedCourses.push(folder);
    } else if (local && folder) {
      // In both — smart merge
      const useFolder = new Date(folder.lastModified) > new Date(local.lastModified);

      // Merge students (union by id)
      const studentMap = new Map<string, typeof local.students[0]>();
      for (const s of local.students) studentMap.set(s.id, s);
      for (const s of folder.students) {
        if (!studentMap.has(s.id)) studentMap.set(s.id, s);
      }

      // Merge labels (union)
      const labelSet = new Set([...(local.availableLabels || []), ...(folder.availableLabels || [])]);

      const mergedCourse: Course = {
        // Use the newer metadata
        ...(useFolder ? folder : local),
        // But always use merged collections
        students: Array.from(studentMap.values()),
        tests: mergeTests(local.tests, folder.tests),
        oralTests: [
          ...(local.oralTests || []),
          ...(folder.oralTests || []).filter(ft =>
            !(local.oralTests || []).some(lt => lt.id === ft.id)
          ),
        ],
        availableLabels: Array.from(labelSet),
      };

      mergedCourses.push(mergedCourse);
    }
  }

  // Save merged result to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(mergedCourses));
  }

  // Write merged result back to folder so it stays in sync
  await saveAllCoursesToFolder(mergedCourses);

  return true;
}

/**
 * Migrate all existing localStorage data to the connected folder.
 * Call after user first connects a folder, to push existing data there.
 */
export async function migrateToFolder(): Promise<void> {
  const courses = loadAllCourses();
  if (courses.length > 0) {
    await saveAllCoursesToFolder(courses);
  }
}

// ==========================================
// TIMED AUTO-BACKUP SYSTEM
// ==========================================

export interface BackupEntry {
  id: string;
  timestamp: string;
  courseCount: number;
  totalFeedback: number;
  sizeBytes: number;
  label?: string; // e.g. "before-delete", "manual", "auto"
}

function getBackupIndex(): BackupEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BACKUP_INDEX_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveBackupIndex(index: BackupEntry[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(index));
  }
}

export function createBackup(label: string = 'auto'): BackupEntry | null {
  if (typeof window === 'undefined') return null;

  const courses = loadAllCourses();
  if (courses.length === 0) return null;

  const data = JSON.stringify(courses);
  const totalFeedback = courses.reduce((sum, c) =>
    sum + c.tests.reduce((tSum, t) =>
      tSum + t.studentFeedbacks.filter(f => f.completedDate).length, 0), 0);

  const id = `backup-${Date.now()}`;
  const entry: BackupEntry = {
    id,
    timestamp: new Date().toISOString(),
    courseCount: courses.length,
    totalFeedback,
    sizeBytes: new Blob([data]).size,
    label,
  };

  try {
    localStorage.setItem(BACKUP_KEY_PREFIX + id, data);
  } catch (e) {
    // localStorage full — remove oldest backup and retry
    const index = getBackupIndex();
    if (index.length > 0) {
      const oldest = index.shift()!;
      localStorage.removeItem(BACKUP_KEY_PREFIX + oldest.id);
      saveBackupIndex(index);
      try {
        localStorage.setItem(BACKUP_KEY_PREFIX + id, data);
      } catch {
        console.error('Cannot create backup: localStorage full');
        return null;
      }
    } else {
      console.error('Cannot create backup: localStorage full');
      return null;
    }
  }

  const index = getBackupIndex();
  index.push(entry);

  // Trim to MAX_BACKUPS (keep manual/before-delete backups longer)
  while (index.length > MAX_BACKUPS) {
    const oldest = index.shift()!;
    localStorage.removeItem(BACKUP_KEY_PREFIX + oldest.id);
  }

  saveBackupIndex(index);
  return entry;
}

export function listBackups(): BackupEntry[] {
  return getBackupIndex().sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getBackupData(backupId: string): Course[] | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(BACKUP_KEY_PREFIX + backupId);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function restoreFromBackup(backupId: string): { success: boolean; courseCount: number } {
  const courses = getBackupData(backupId);
  if (!courses) return { success: false, courseCount: 0 };

  // Create a safety backup of current state before restoring
  createBackup('before-restore');

  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  }
  return { success: true, courseCount: courses.length };
}

export function deleteBackup(backupId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BACKUP_KEY_PREFIX + backupId);
  const index = getBackupIndex().filter(e => e.id !== backupId);
  saveBackupIndex(index);
}

export function startAutoBackup(): void {
  if (autoBackupTimer) return; // Already running
  // Create an initial backup right away
  createBackup('auto');
  autoBackupTimer = setInterval(() => {
    createBackup('auto');
  }, AUTO_BACKUP_INTERVAL);
}

export function stopAutoBackup(): void {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer);
    autoBackupTimer = null;
  }
}

export function isAutoBackupRunning(): boolean {
  return autoBackupTimer !== null;
}

// ==========================================
// IMPORT FROM FOLDER (File System Access API)
// ==========================================

async function readFileFromHandle(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return await file.text();
}

export async function importFromFolder(): Promise<{
  success: boolean;
  courses: Course[];
  errors: string[];
}> {
  if (typeof window === 'undefined') {
    return { success: false, courses: [], errors: ['Not in browser environment'] };
  }

  if (!('showDirectoryPicker' in window)) {
    return { success: false, courses: [], errors: ['Folder import is not supported in this browser. Use Chrome or Edge.'] };
  }

  try {
    // @ts-ignore
    const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'read',
      startIn: 'documents',
    });

    const importedCourses: Course[] = [];
    const errors: string[] = [];

    // Check if the selected folder itself is a course folder (has course-info.json)
    // This handles the case where the user selects the course folder directly
    // instead of the parent directory containing course folders
    let selectedFolderIsCourse = false;
    try {
      await dirHandle.getFileHandle('course-info.json');
      selectedFolderIsCourse = true;
    } catch {
      // No course-info.json at top level, treat as parent directory
    }

    if (selectedFolderIsCourse) {
      // The user selected a course folder directly — import it
      try {
        const course = await importCourseFromFolder(dirHandle);
        if (course) {
          importedCourses.push(course);
        } else {
          errors.push(`Could not import course from folder "${dirHandle.name}": no students or tests found`);
        }
      } catch (e) {
        errors.push(`Failed to import course folder "${dirHandle.name}": ${e}`);
      }
    } else {
      // Iterate through course folders in the parent directory
      // @ts-ignore - for await on directory handle
      for await (const entry of dirHandle.values()) {
        if (entry.kind !== 'directory') {
          // Check if it's a top-level JSON file (full export)
          if (entry.kind === 'file' && entry.name.endsWith('.json')) {
            try {
              const content = await readFileFromHandle(entry as FileSystemFileHandle);
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                // It's a full course export array
                importedCourses.push(...parsed);
              } else if (parsed.id && parsed.name && parsed.tests) {
                // Single course
                importedCourses.push(parsed);
              }
            } catch (e) {
              errors.push(`Failed to read ${entry.name}: ${e}`);
            }
          }
          continue;
        }

        // This is a course folder from auto-save
        const courseDirHandle = entry as FileSystemDirectoryHandle;
        try {
          const course = await importCourseFromFolder(courseDirHandle);
          if (course) {
            importedCourses.push(course);
          }
        } catch (e) {
          errors.push(`Failed to import course folder "${entry.name}": ${e}`);
        }
      }
    }

    return { success: importedCourses.length > 0, courses: importedCourses, errors };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, courses: [], errors: [] }; // User cancelled
    }
    return { success: false, courses: [], errors: [`${error}`] };
  }
}

async function importCourseFromFolder(courseDirHandle: FileSystemDirectoryHandle): Promise<Course | null> {
  let courseName = courseDirHandle.name;
  let courseDescription = '';
  let students: CourseStudent[] = [];
  let createdDate = new Date().toISOString();
  let lastModified = new Date().toISOString();
  let availableLabels: string[] = [];
  const tests: CourseTest[] = [];

  // Try to read course-info.json
  try {
    const courseInfoHandle = await courseDirHandle.getFileHandle('course-info.json');
    const content = await readFileFromHandle(courseInfoHandle);
    const info = JSON.parse(content);
    courseName = info.name || courseName;
    courseDescription = info.description || '';
    students = (info.students || []).map((s: CourseStudent) => ({
      id: s.id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: s.name,
      studentNumber: s.studentNumber,
    }));
    createdDate = info.createdDate || createdDate;
    lastModified = info.lastModified || lastModified;
    availableLabels = info.availableLabels || [];
  } catch {
    // No course-info.json, we'll reconstruct from folder name
  }

  // Iterate through test folders
  // @ts-ignore
  for await (const entry of courseDirHandle.values()) {
    if (entry.kind !== 'directory') continue;

    const testDirHandle = entry as FileSystemDirectoryHandle;
    try {
      const test = await importTestFromFolder(testDirHandle, students);
      if (test) {
        tests.push(test);
      }
    } catch (e) {
      console.error(`Failed to import test folder "${entry.name}":`, e);
    }
  }

  if (tests.length === 0 && students.length === 0) {
    return null; // Empty folder, skip
  }

  return {
    id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: courseName,
    description: courseDescription,
    students,
    tests,
    availableLabels,
    createdDate,
    lastModified,
  };
}

async function importTestFromFolder(
  testDirHandle: FileSystemDirectoryHandle,
  students: CourseStudent[]
): Promise<CourseTest | null> {
  let testName = testDirHandle.name;
  let testDescription = '';
  let testDate = new Date().toISOString();
  let tasks: Task[] = [];
  let generalComment = '';
  let hasTwoParts: boolean | undefined;
  let part1TaskCount: number | undefined;
  let part2TaskCount: number | undefined;
  let restartNumberingInPart2: boolean | undefined;
  let snippets: import('@/types').FeedbackSnippet[] | undefined;
  let testCreatedDate = new Date().toISOString();
  let testLastModified = new Date().toISOString();
  const studentFeedbacks: TestFeedbackData[] = [];

  // Try to read test-config.json
  try {
    const configHandle = await testDirHandle.getFileHandle('test-config.json');
    const content = await readFileFromHandle(configHandle);
    const config = JSON.parse(content);
    testName = config.name || testName;
    testDescription = config.description || '';
    testDate = config.date || testDate;
    tasks = config.tasks || [];
    generalComment = config.generalComment || '';
    hasTwoParts = config.hasTwoParts;
    part1TaskCount = config.part1TaskCount;
    part2TaskCount = config.part2TaskCount;
    restartNumberingInPart2 = config.restartNumberingInPart2;
    snippets = config.snippets;
    testCreatedDate = config.createdDate || testCreatedDate;
    testLastModified = config.lastModified || testLastModified;
  } catch {
    // No test-config.json
  }

  // Read student feedback files
  // @ts-ignore
  for await (const entry of testDirHandle.values()) {
    if (entry.kind !== 'file') continue;
    if (entry.name === 'test-config.json') continue;
    if (!entry.name.endsWith('.json')) continue;

    try {
      const fileHandle = entry as FileSystemFileHandle;
      const content = await readFileFromHandle(fileHandle);
      const data = JSON.parse(content);

      // Try to match student by name
      let studentId = '';
      if (data.name) {
        const matchedStudent = students.find(s =>
          s.name.toLowerCase() === data.name.toLowerCase()
        );
        if (matchedStudent) {
          studentId = matchedStudent.id;
        } else {
          // Create student if not found
          const newStudent: CourseStudent = {
            id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            studentNumber: data.studentNumber,
          };
          students.push(newStudent);
          studentId = newStudent.id;
        }
      }

      if (studentId) {
        studentFeedbacks.push({
          studentId,
          taskFeedbacks: data.taskFeedbacks || [],
          individualComment: data.individualComment || '',
          completedDate: data.completedDate,
        });
      }
    } catch (e) {
      console.error(`Failed to read feedback file "${entry.name}":`, e);
    }
  }

  const test: CourseTest = {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: testName,
    description: testDescription,
    date: testDate,
    tasks,
    generalComment,
    studentFeedbacks,
    createdDate: testCreatedDate,
    lastModified: testLastModified,
  };

  if (hasTwoParts !== undefined) test.hasTwoParts = hasTwoParts;
  if (part1TaskCount !== undefined) test.part1TaskCount = part1TaskCount;
  if (part2TaskCount !== undefined) test.part2TaskCount = part2TaskCount;
  if (restartNumberingInPart2 !== undefined) test.restartNumberingInPart2 = restartNumberingInPart2;
  if (snippets !== undefined) test.snippets = snippets;

  return test;
}

// ==========================================
// EXPORT & IMPORT (improved)
// ==========================================

export function exportAllCourses(): string {
  const courses = loadAllCourses();
  return JSON.stringify(courses, null, 2);
}

export interface ImportResult {
  imported: number;
  skippedDuplicates: number;
  merged: number;
  errors: string[];
}

export function validateCourseData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data is not a valid object');
    return { valid: false, errors };
  }

  const courses = Array.isArray(data) ? data : [data];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    if (!c.name || typeof c.name !== 'string') {
      errors.push(`Course ${i + 1}: missing or invalid name`);
    }
    if (!Array.isArray(c.students)) {
      errors.push(`Course ${i + 1} ("${c.name || 'unknown'}"): missing students array`);
    }
    if (!Array.isArray(c.tests)) {
      errors.push(`Course ${i + 1} ("${c.name || 'unknown'}"): missing tests array`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function importCourses(jsonString: string, options?: {
  skipDuplicates?: boolean;
  mergeExisting?: boolean;
}): ImportResult {
  const result: ImportResult = { imported: 0, skippedDuplicates: 0, merged: 0, errors: [] };

  let imported: Course[];
  try {
    const parsed = JSON.parse(jsonString);
    imported = Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    result.errors.push('Invalid JSON format');
    return result;
  }

  const validation = validateCourseData(imported);
  if (!validation.valid) {
    result.errors = validation.errors;
    return result;
  }

  // Create safety backup before import
  createBackup('before-import');

  const courses = loadAllCourses();
  const skipDuplicates = options?.skipDuplicates ?? true;
  const mergeExisting = options?.mergeExisting ?? false;

  for (const importedCourse of imported) {
    // Check for duplicate by ID or by name
    const existingById = courses.findIndex(c => c.id === importedCourse.id);
    const existingByName = courses.findIndex(c =>
      c.name.toLowerCase() === importedCourse.name.toLowerCase()
    );

    const existingIndex = existingById >= 0 ? existingById : existingByName;

    if (existingIndex >= 0) {
      if (mergeExisting) {
        // Merge: add new tests and students that don't exist
        const existing = courses[existingIndex];

        // Merge students
        for (const student of importedCourse.students) {
          const exists = existing.students.some(s =>
            s.name.toLowerCase() === student.name.toLowerCase()
          );
          if (!exists) {
            existing.students.push(student);
          }
        }

        // Merge tests
        for (const test of importedCourse.tests) {
          const existingTest = existing.tests.find(t =>
            t.name.toLowerCase() === test.name.toLowerCase()
          );
          if (!existingTest) {
            existing.tests.push(test);
          } else {
            // Merge feedback into existing test
            for (const feedback of test.studentFeedbacks) {
              const existingFeedback = existingTest.studentFeedbacks.find(f =>
                f.studentId === feedback.studentId
              );
              if (!existingFeedback && feedback.completedDate) {
                existingTest.studentFeedbacks.push(feedback);
              }
            }
          }
        }

        // Merge labels
        for (const label of (importedCourse.availableLabels || [])) {
          if (!existing.availableLabels.includes(label)) {
            existing.availableLabels.push(label);
          }
        }

        existing.lastModified = new Date().toISOString();
        result.merged++;
      } else if (skipDuplicates) {
        result.skippedDuplicates++;
      } else {
        // Generate new ID to avoid conflict
        importedCourse.id = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        importedCourse.name = `${importedCourse.name} (imported)`;
        courses.push(importedCourse);
        result.imported++;
      }
    } else {
      // Ensure valid ID
      if (!importedCourse.id) {
        importedCourse.id = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      courses.push(importedCourse);
      result.imported++;
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  }

  return result;
}

export function importCoursesFromData(courses: Course[], options?: {
  skipDuplicates?: boolean;
  mergeExisting?: boolean;
}): ImportResult {
  return importCourses(JSON.stringify(courses), options);
}

// ==========================================
// SAFETY: Backup before destructive operations
// ==========================================

export function safeDeleteCourse(courseId: string): { backupId: string | null } {
  const backup = createBackup('before-delete');
  deleteCourse(courseId);
  return { backupId: backup?.id || null };
}

export function safeDeleteTest(courseId: string, testId: string): { backupId: string | null } {
  const backup = createBackup('before-delete');
  deleteTest(courseId, testId);
  return { backupId: backup?.id || null };
}

export function safeDeleteStudent(courseId: string, studentId: string): { backupId: string | null } {
  const backup = createBackup('before-delete');
  deleteStudent(courseId, studentId);
  return { backupId: backup?.id || null };
}
