import { Course, CourseStudent, CourseTest, TaskAnalytics } from '@/types';
import { calculateStudentScore, getTestTaskAnalytics } from './courseStorage';

/**
 * Export course data to an Excel file with multiple sheets:
 * - One "Students" sheet with student overview and test scores
 * - One sheet per test with task analytics, student performance, and all comments
 */
export async function exportCourseToExcel(course: Course): Promise<void> {
  // Dynamic import for client-side only
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Math Feedback System';
  workbook.lastModifiedBy = 'Math Feedback System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Create Students Overview Sheet
  createStudentsSheet(workbook, course);

  // 2. Create a sheet for each test with detailed feedback
  course.tests.forEach(test => {
    createTestSheet(workbook, course, test);
  });

  // 3. Generate and download the file
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelFile(buffer, `${sanitizeFileName(course.name)}.xlsx`);
}

/**
 * Create the Students overview sheet
 */
function createStudentsSheet(workbook: any, course: Course): void {
  const sheet = workbook.addWorksheet('Students');

  // Define columns
  const columns: any[] = [
    { header: 'Student Name', key: 'name', width: 25 },
    { header: 'Student Number', key: 'studentNumber', width: 15 },
  ];

  // Add a column for each test
  course.tests.forEach(test => {
    columns.push({
      header: test.name,
      key: `test_${test.id}`,
      width: 15,
    });
  });

  // Add average column
  columns.push(
    { header: 'Average Score', key: 'average', width: 15 },
    { header: 'Tests Completed', key: 'completed', width: 15 }
  );

  sheet.columns = columns;

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Add student data
  course.students.forEach(student => {
    const rowData: any = {
      name: student.name,
      studentNumber: student.studentNumber || 'N/A',
    };

    let totalScore = 0;
    let completedCount = 0;

    // Add scores for each test
    course.tests.forEach(test => {
      const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);

      if (feedback && feedback.completedDate) {
        const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
        rowData[`test_${test.id}`] = score;
        totalScore += score;
        completedCount++;
      } else {
        rowData[`test_${test.id}`] = '-';
      }
    });

    // Calculate average
    rowData.average = completedCount > 0 ? (totalScore / completedCount).toFixed(1) : '-';
    rowData.completed = `${completedCount}/${course.tests.length}`;

    sheet.addRow(rowData);
  });

  // Apply color coding to score cells (green for high, red for low)
  course.students.forEach((student, rowIndex) => {
    course.tests.forEach((test, colIndex) => {
      const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);

      if (feedback && feedback.completedDate) {
        const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
        const cell = sheet.getCell(rowIndex + 2, colIndex + 3); // +2 for header, +3 for name/number columns

        if (score >= 50) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' },
          };
        } else if (score < 30) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' },
          };
        }
      }
    });
  });

  // Freeze the first row and first two columns
  sheet.views = [
    { state: 'frozen', xSplit: 2, ySplit: 1 }
  ];
}

/**
 * Create a sheet for a specific test with detailed feedback and comments
 */
function createTestSheet(workbook: any, course: Course, test: CourseTest): void {
  const sanitizedTestName = sanitizeSheetName(test.name);
  const sheet = workbook.addWorksheet(sanitizedTestName);

  // Get task analytics
  const taskAnalytics = getTestTaskAnalytics(course.id, test.id);

  // Section 1: Test Information
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = test.name;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  sheet.getRow(1).height = 30;

  sheet.getCell('A2').value = 'Test Date:';
  sheet.getCell('A2').font = { bold: true };
  sheet.getCell('B2').value = new Date(test.date).toLocaleDateString();

  sheet.getCell('A3').value = 'Description:';
  sheet.getCell('A3').font = { bold: true };
  sheet.getCell('B3').value = test.description || 'N/A';

  sheet.getCell('A4').value = 'Students Completed:';
  sheet.getCell('A4').font = { bold: true };
  const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
  sheet.getCell('B4').value = `${completedCount}/${course.students.length}`;

  // General comment
  if (test.generalComment) {
    sheet.getCell('A5').value = 'General Comment:';
    sheet.getCell('A5').font = { bold: true };
    sheet.mergeCells('B5:F5');
    const generalCommentCell = sheet.getCell('B5');
    generalCommentCell.value = test.generalComment;
    generalCommentCell.alignment = { wrapText: true, vertical: 'top' };
    sheet.getRow(5).height = Math.max(30, Math.ceil(test.generalComment.length / 60) * 15);
  }

  // Add spacing
  let currentRow = 7;
  sheet.getRow(currentRow - 1).height = 5;

  // Section 2: Task Analytics
  sheet.mergeCells(`A${currentRow}:H${currentRow}`);
  const analyticsTitle = sheet.getCell(`A${currentRow}`);
  analyticsTitle.value = 'Task Performance Analytics';
  analyticsTitle.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  analyticsTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  analyticsTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  };
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  // Task analytics header
  const analyticsHeaderRow = sheet.getRow(currentRow);
  analyticsHeaderRow.values = [
    'Task',
    'Part',
    'Category',
    'Labels',
    'Avg Score',
    'Attempts',
    'Attempt %',
    'Distribution (0-6)',
  ];
  analyticsHeaderRow.font = { bold: true };
  analyticsHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' },
  };
  analyticsHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  // Task analytics data
  const analyticsStartRow = currentRow;
  taskAnalytics.forEach(analytics => {
    const row = sheet.getRow(currentRow);

    const distribution = Object.entries(analytics.scoreDistribution)
      .map(([points, count]) => `${points}:${count}`)
      .join(' | ');

    row.values = [
      analytics.fullLabel,
      analytics.part ? `Part ${analytics.part}` : 'N/A',
      analytics.category ? `Cat ${analytics.category}` : 'N/A',
      analytics.labels.join(', ') || 'N/A',
      analytics.averageScore.toFixed(2),
      analytics.attemptCount,
      `${analytics.attemptPercentage.toFixed(1)}%`,
      distribution,
    ];

    currentRow++;
  });

  // Set column widths
  sheet.getColumn(1).width = 20; // Task
  sheet.getColumn(2).width = 12; // Part
  sheet.getColumn(3).width = 12; // Category
  sheet.getColumn(4).width = 30; // Labels
  sheet.getColumn(5).width = 12; // Avg Score
  sheet.getColumn(6).width = 12; // Attempts
  sheet.getColumn(7).width = 12; // Attempt %
  sheet.getColumn(8).width = 45; // Distribution

  // Add borders to analytics section
  for (let row = analyticsStartRow - 1; row < currentRow; row++) {
    const currentRowObj = sheet.getRow(row);
    currentRowObj.eachCell({ includeEmpty: false }, (cell: any) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  // Add spacing
  currentRow++;
  sheet.getRow(currentRow).height = 5;
  currentRow++;

  // Section 3: Detailed Student Feedback with Comments
  sheet.mergeCells(`A${currentRow}:H${currentRow}`);
  const feedbackTitle = sheet.getCell(`A${currentRow}`);
  feedbackTitle.value = 'Detailed Student Feedback';
  feedbackTitle.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  feedbackTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  feedbackTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  };
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  // Process each student's feedback
  course.students.forEach(student => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);

    if (feedback && feedback.completedDate) {
      const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
      const percentage = (score / 60) * 100;

      // Student header
      sheet.mergeCells(`A${currentRow}:H${currentRow}`);
      const studentHeader = sheet.getCell(`A${currentRow}`);
      studentHeader.value = `${student.name} (${student.studentNumber || 'N/A'}) - Score: ${score}/60 (${percentage.toFixed(1)}%)`;
      studentHeader.font = { bold: true, size: 12 };
      studentHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: percentage >= 80 ? { argb: 'FFC6EFCE' } : percentage >= 50 ? { argb: 'FFFFF4CC' } : { argb: 'FFFFC7CE' },
      };
      studentHeader.alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getRow(currentRow).height = 20;
      currentRow++;

      // Task feedback header
      const taskFeedbackHeader = sheet.getRow(currentRow);
      taskFeedbackHeader.values = ['Task', 'Points', 'Comment'];
      taskFeedbackHeader.font = { bold: true };
      taskFeedbackHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };
      currentRow++;

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

        const row = sheet.getRow(currentRow);
        row.values = [
          taskLabel,
          `${taskFeedback.points}/6`,
          taskFeedback.comment || '-',
        ];

        // Merge comment cells for better readability
        sheet.mergeCells(`C${currentRow}:H${currentRow}`);
        const commentCell = sheet.getCell(`C${currentRow}`);
        commentCell.alignment = { wrapText: true, vertical: 'top' };

        // Auto-adjust row height based on comment length
        if (taskFeedback.comment) {
          const estimatedLines = Math.ceil(taskFeedback.comment.length / 100);
          row.height = Math.max(15, estimatedLines * 15);
        }

        currentRow++;
      });

      // Individual comment
      if (feedback.individualComment) {
        const commentRow = sheet.getRow(currentRow);
        commentRow.getCell(1).value = 'Individual Comment:';
        commentRow.getCell(1).font = { bold: true, italic: true };
        sheet.mergeCells(`B${currentRow}:H${currentRow}`);
        const individualCommentCell = sheet.getCell(`B${currentRow}`);
        individualCommentCell.value = feedback.individualComment;
        individualCommentCell.alignment = { wrapText: true, vertical: 'top' };
        individualCommentCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF9E6' },
        };

        const estimatedLines = Math.ceil(feedback.individualComment.length / 100);
        commentRow.height = Math.max(20, estimatedLines * 15);
        currentRow++;
      }

      // Add spacing between students
      currentRow++;
      sheet.getRow(currentRow).height = 3;
      currentRow++;
    } else {
      // Student not completed
      sheet.mergeCells(`A${currentRow}:H${currentRow}`);
      const studentHeader = sheet.getCell(`A${currentRow}`);
      studentHeader.value = `${student.name} (${student.studentNumber || 'N/A'}) - Not Completed`;
      studentHeader.font = { bold: true, size: 12, color: { argb: 'FF999999' } };
      studentHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
      currentRow++;
      currentRow++;
    }
  });
}

/**
 * Sanitize sheet name (Excel has restrictions)
 */
function sanitizeSheetName(name: string): string {
  // Remove invalid characters: : \ / ? * [ ]
  let sanitized = name.replace(/[:\\\/\?\*\[\]]/g, '-');

  // Limit to 31 characters
  if (sanitized.length > 31) {
    sanitized = sanitized.substring(0, 31);
  }

  return sanitized;
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
 * Trigger download of Excel file
 */
function downloadExcelFile(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
