import { Course } from '@/types';
import { calculateStudentScore, getTestTaskAnalytics } from './storage';

/**
 * Export course data to a CSV file that Excel can open
 * The CSV will contain:
 * - Students overview with scores across all tests
 * - Detailed breakdown for each test with analytics and comments
 */
export function exportCourseToExcel(course: Course): void {
  const csv = generateCourseCSV(course);
  downloadCSVFile(csv, `${sanitizeFileName(course.name)}.csv`);
}

/**
 * Generate comprehensive CSV content
 */
function generateCourseCSV(course: Course): string {
  const lines: string[] = [];

  // Title
  lines.push(`"Course: ${escapeCsv(course.name)}"`);
  if (course.description) {
    lines.push(`"Description: ${escapeCsv(course.description)}"`);
  }
  lines.push('');

  // Section 1: Students Overview
  lines.push('"========== STUDENTS OVERVIEW =========="');
  lines.push('');

  // Students overview header
  const studentHeaders = ['Student Name', 'Student Number'];
  course.tests.forEach(test => {
    studentHeaders.push(test.name);
  });
  studentHeaders.push('Average Score', 'Tests Completed');
  lines.push(studentHeaders.map(escapeCsv).join(','));

  // Students overview data
  course.students.forEach(student => {
    const row: string[] = [
      student.name,
      student.studentNumber || 'N/A',
    ];

    let totalScore = 0;
    let completedCount = 0;

    course.tests.forEach(test => {
      const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);
      if (feedback && feedback.completedDate) {
        const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
        row.push(score.toString());
        totalScore += score;
        completedCount++;
      } else {
        row.push('-');
      }
    });

    const average = completedCount > 0 ? (totalScore / completedCount).toFixed(1) : '-';
    row.push(average);
    row.push(`${completedCount}/${course.tests.length}`);

    lines.push(row.map(escapeCsv).join(','));
  });

  lines.push('');
  lines.push('');

  // Section 2: Detailed Test Data
  course.tests.forEach((test, testIndex) => {
    lines.push(`"========== TEST ${testIndex + 1}: ${escapeCsv(test.name)} =========="}`);
    lines.push('');

    // Test information
    lines.push(`"Test Date:","${new Date(test.date).toLocaleDateString()}"`);
    if (test.description) {
      lines.push(`"Description:","${escapeCsv(test.description)}"`);
    }
    const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
    lines.push(`"Students Completed:","${completedCount}/${course.students.length}"`);

    if (test.generalComment) {
      lines.push(`"General Comment:","${escapeCsv(test.generalComment)}"`);
    }
    lines.push('');

    // Task Analytics
    lines.push('"--- Task Performance Analytics ---"');
    const taskAnalytics = getTestTaskAnalytics(course.id, test.id);

    if (taskAnalytics.length > 0) {
      lines.push(['Task', 'Part', 'Category', 'Labels', 'Avg Score', 'Attempts', 'Attempt %', 'Score Distribution (0-6)'].map(escapeCsv).join(','));

      taskAnalytics.forEach(analytics => {
        const distribution = Object.entries(analytics.scoreDistribution)
          .map(([points, count]) => `${points}:${count}`)
          .join(' | ');

        lines.push([
          analytics.fullLabel,
          analytics.part ? `Part ${analytics.part}` : 'N/A',
          analytics.category ? `Cat ${analytics.category}` : 'N/A',
          analytics.labels.join('; ') || 'N/A',
          analytics.averageScore.toFixed(2),
          analytics.attemptCount.toString(),
          `${analytics.attemptPercentage.toFixed(1)}%`,
          distribution,
        ].map(escapeCsv).join(','));
      });
    }

    lines.push('');

    // Detailed Student Feedback
    lines.push('"--- Detailed Student Feedback ---"');
    lines.push('');

    course.students.forEach(student => {
      const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);

      if (feedback && feedback.completedDate) {
        const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
        const percentage = (score / 60) * 100;

        // Student header
        lines.push(`"${student.name} (${student.studentNumber || 'N/A'}) - Score: ${score}/60 (${percentage.toFixed(1)}%)"`);

        // Task feedback header
        lines.push(['Task', 'Points', 'Comment'].map(escapeCsv).join(','));

        // Task feedbacks
        feedback.taskFeedbacks.forEach(taskFeedback => {
          const task = test.tasks.find(t => t.id === taskFeedback.taskId);
          if (!task) return;

          let taskLabel = task.label;
          if (taskFeedback.subtaskId) {
            const subtask = task.subtasks.find(st => st.id === taskFeedback.subtaskId);
            if (subtask) {
              taskLabel += subtask.label;
            }
          }

          lines.push([
            taskLabel,
            `${taskFeedback.points}/6`,
            taskFeedback.comment || '-',
          ].map(escapeCsv).join(','));
        });

        // Individual comment
        if (feedback.individualComment) {
          lines.push(`"Individual Comment:","${escapeCsv(feedback.individualComment)}"`);
        }

        lines.push('');
      } else {
        lines.push(`"${student.name} (${student.studentNumber || 'N/A'}) - Not Completed"`);
        lines.push('');
      }
    });

    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Escape CSV values (handle quotes, commas, newlines)
 */
function escapeCsv(value: string): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return `"${stringValue}"`;
}

/**
 * Sanitize file name for download
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Trigger download of CSV file
 */
function downloadCSVFile(content: string, filename: string): void {
  // Add BOM for proper Excel encoding (handles special characters)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
