import ExcelJS from 'exceljs';
import { Course, CourseStudent, CourseTest, TaskAnalytics } from '@/types';
import { calculateStudentScore, getTestTaskAnalytics } from './courseStorage';

/**
 * Export course data to an Excel file with multiple sheets:
 * - One "Students" sheet with student overview and test scores
 * - One sheet per test with task analytics and student performance
 */
export async function exportCourseToExcel(course: Course): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Math Feedback System';
  workbook.lastModifiedBy = 'Math Feedback System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Create Students Overview Sheet
  createStudentsSheet(workbook, course);

  // 2. Create a sheet for each test
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
function createStudentsSheet(workbook: ExcelJS.Workbook, course: Course): void {
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
 * Create a sheet for a specific test
 */
function createTestSheet(workbook: ExcelJS.Workbook, course: Course, test: CourseTest): void {
  const sanitizedTestName = sanitizeSheetName(test.name);
  const sheet = workbook.addWorksheet(sanitizedTestName);

  // Get task analytics
  const taskAnalytics = getTestTaskAnalytics(course.id, test.id);

  // Section 1: Test Information
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = test.name;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  sheet.getCell('A2').value = 'Test Date:';
  sheet.getCell('B2').value = new Date(test.date).toLocaleDateString();
  sheet.getCell('A3').value = 'Description:';
  sheet.getCell('B3').value = test.description || 'N/A';
  sheet.getCell('A4').value = 'Students Completed:';
  const completedCount = test.studentFeedbacks.filter(f => f.completedDate).length;
  sheet.getCell('B4').value = `${completedCount}/${course.students.length}`;

  // Add spacing
  sheet.getRow(5).height = 5;

  // Section 2: Task Analytics
  sheet.mergeCells('A6:H6');
  const analyticsTitle = sheet.getCell('A6');
  analyticsTitle.value = 'Task Performance Analytics';
  analyticsTitle.font = { bold: true, size: 14 };
  analyticsTitle.alignment = { horizontal: 'center' };
  analyticsTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  };

  // Task analytics header
  const analyticsHeaderRow = sheet.getRow(7);
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

  // Task analytics data
  let currentRow = 8;
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
  sheet.getColumn(4).width = 25; // Labels
  sheet.getColumn(5).width = 12; // Avg Score
  sheet.getColumn(6).width = 12; // Attempts
  sheet.getColumn(7).width = 12; // Attempt %
  sheet.getColumn(8).width = 40; // Distribution

  // Add spacing
  currentRow++;
  sheet.getRow(currentRow).height = 5;
  currentRow++;

  // Section 3: Student Scores
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const scoresTitle = sheet.getCell(`A${currentRow}`);
  scoresTitle.value = 'Student Scores';
  scoresTitle.font = { bold: true, size: 14 };
  scoresTitle.alignment = { horizontal: 'center' };
  scoresTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  };
  currentRow++;

  // Student scores header
  const scoresHeaderRow = sheet.getRow(currentRow);
  scoresHeaderRow.values = [
    'Student Name',
    'Student Number',
    'Score',
    'Max Score',
    'Percentage',
    'Status',
  ];
  scoresHeaderRow.font = { bold: true };
  scoresHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' },
  };
  currentRow++;

  // Student scores data
  const studentsStartRow = currentRow;
  course.students.forEach(student => {
    const feedback = test.studentFeedbacks.find(f => f.studentId === student.id);
    const row = sheet.getRow(currentRow);

    if (feedback && feedback.completedDate) {
      const score = calculateStudentScore(test.tasks, feedback.taskFeedbacks);
      const percentage = (score / 60) * 100;

      row.values = [
        student.name,
        student.studentNumber || 'N/A',
        score,
        60,
        `${percentage.toFixed(1)}%`,
        'Completed',
      ];

      // Color code based on percentage
      const scoreCell = row.getCell(3);
      if (percentage >= 80) {
        scoreCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' },
        };
      } else if (percentage < 50) {
        scoreCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' },
        };
      }
    } else {
      row.values = [
        student.name,
        student.studentNumber || 'N/A',
        '-',
        60,
        '-',
        'Not Completed',
      ];
    }

    currentRow++;
  });

  // Set column widths for student section
  sheet.getColumn(9).width = 25; // Student Name (if needed)
  sheet.getColumn(10).width = 15; // Student Number

  // Add borders to all data cells
  const lastRow = currentRow - 1;
  for (let row = 7; row <= lastRow; row++) {
    const currentRowObj = sheet.getRow(row);
    currentRowObj.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }
}

/**
 * Helper function to get Excel column letter from index
 */
function getColumnLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
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
