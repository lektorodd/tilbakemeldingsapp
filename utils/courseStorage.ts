import { Course, CourseStudent, CourseTest, OralTest, CourseSummary, TestFeedbackData, Task, TaskFeedback, StudentCourseProgress, StudentTestResult, TestResultsSummary, LabelPerformance, CategoryPerformance, OralFeedbackData } from '@/types';

const COURSES_KEY = 'math-feedback-courses';
let autoSaveDirHandle: FileSystemDirectoryHandle | null = null;

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

  // Auto-save completed feedback
  autoSaveCourse(course);
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
  const filtered = courses.filter(c => c.id !== courseId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
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

// Auto-save functionality
export async function setupAutoSaveDirectory(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (!('showDirectoryPicker' in window)) {
    alert('Auto-save to folder is not supported in this browser. Use Chrome or Edge for this feature.');
    return false;
  }

  try {
    // @ts-ignore
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });

    autoSaveDirHandle = dirHandle;

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

async function autoSaveCourse(course: Course): Promise<void> {
  if (!autoSaveDirHandle) return;

  try {
    const courseFolderName = sanitizeFileName(course.name);
    const courseDirHandle = await autoSaveDirHandle.getDirectoryHandle(courseFolderName, { create: true });

    // Save course info
    const courseInfoFile = await courseDirHandle.getFileHandle('course-info.json', { create: true });
    const courseInfoWritable = await courseInfoFile.createWritable();
    await courseInfoWritable.write(JSON.stringify({
      name: course.name,
      description: course.description,
      students: course.students,
      createdDate: course.createdDate,
      lastModified: course.lastModified,
    }, null, 2));
    await courseInfoWritable.close();

    // Save each test
    for (const test of course.tests) {
      const testFolderName = sanitizeFileName(test.name);
      const testDirHandle = await courseDirHandle.getDirectoryHandle(testFolderName, { create: true });

      // Save test config
      const testConfigFile = await testDirHandle.getFileHandle('test-config.json', { create: true });
      const testConfigWritable = await testConfigFile.createWritable();
      await testConfigWritable.write(JSON.stringify({
        name: test.name,
        description: test.description,
        date: test.date,
        tasks: test.tasks,
        generalComment: test.generalComment,
        createdDate: test.createdDate,
        lastModified: test.lastModified,
      }, null, 2));
      await testConfigWritable.close();

      // Save completed student feedback
      for (const feedback of test.studentFeedbacks) {
        if (feedback.completedDate) {
          const student = course.students.find(s => s.id === feedback.studentId);
          if (!student) continue;

          const studentFileName = `${sanitizeFileName(student.name)}.json`;
          const studentFile = await testDirHandle.getFileHandle(studentFileName, { create: true });
          const studentWritable = await studentFile.createWritable();

          const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);

          await studentWritable.write(JSON.stringify({
            name: student.name,
            studentNumber: student.studentNumber,
            score: score,
            maxScore: 60,
            taskFeedbacks: feedback.taskFeedbacks,
            individualComment: feedback.individualComment,
            completedDate: feedback.completedDate,
          }, null, 2));
          await studentWritable.close();
        }
      }
    }
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// Export
export function exportAllCourses(): string {
  const courses = loadAllCourses();
  return JSON.stringify(courses, null, 2);
}

export function importCourses(jsonString: string): void {
  try {
    const imported = JSON.parse(jsonString);
    const courses = loadAllCourses();

    if (Array.isArray(imported)) {
      courses.push(...imported);
    } else {
      courses.push(imported);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    }
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
