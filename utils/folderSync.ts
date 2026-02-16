/**
 * Folder sync layer — reads/writes all app data to a user-chosen folder.
 * The folder (e.g., in OneDrive) becomes the single source of truth.
 *
 * Folder structure:
 *   chosen-folder/
 *   ├── settings.json          (language, preferences)
 *   ├── snippets.json          (global feedback snippets)
 *   └── courses/
 *       └── course_name/
 *           ├── course-info.json   (course metadata + students + labels)
 *           └── test_name/
 *               ├── test-config.json   (test config + tasks)
 *               └── student_name.json  (all feedback for this student)
 */

import { Course, CourseStudent, CourseTest, FeedbackSnippet, OralTest } from '@/types';
import { saveFolderHandle, loadFolderHandle, verifyFolderHandle, clearFolderHandle } from './folderDB';

// ==========================================
// MODULE STATE
// ==========================================

let activeDirHandle: FileSystemDirectoryHandle | null = null;
let initPromise: Promise<boolean> | null = null;

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Initialize folder sync. Call once on app startup.
 * Tries to restore the saved folder handle from IndexedDB.
 * Returns true if a folder is connected and ready.
 */
export async function initFolderSync(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('showDirectoryPicker' in window)) return false;

  // Deduplicate concurrent init calls
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const savedHandle = await loadFolderHandle();
      if (!savedHandle) return false;

      const verified = await verifyFolderHandle(savedHandle);
      if (!verified) return false;

      activeDirHandle = verified;
      return true;
    } catch {
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Let user pick a new folder and save the handle.
 * Returns true on success.
 */
export async function chooseFolderAndConnect(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('showDirectoryPicker' in window)) return false;

  try {
    // @ts-ignore
    const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });

    // Request write permission
    // @ts-ignore — requestPermission is not in the TS lib types yet
    if (handle.requestPermission) {
      // @ts-ignore
      const perm = await handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return false;
    }

    activeDirHandle = handle;
    await saveFolderHandle(handle);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return false; // User cancelled
    }
    console.error('Failed to choose folder:', error);
    return false;
  }
}

/**
 * Disconnect from the folder. Clears the saved handle.
 */
export async function disconnectFolder(): Promise<void> {
  activeDirHandle = null;
  await clearFolderHandle();
}

/**
 * Check if a folder is currently connected.
 */
export function isFolderConnected(): boolean {
  return activeDirHandle !== null;
}

/**
 * Get the name of the connected folder (for display).
 */
export function getFolderName(): string | null {
  return activeDirHandle?.name || null;
}

// ==========================================
// SETTINGS
// ==========================================

export interface AppSettings {
  language: 'en' | 'nb' | 'nn';
  darkMode?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'nb',
};

export async function loadSettingsFromFolder(): Promise<AppSettings | null> {
  if (!activeDirHandle) return null;
  try {
    const fileHandle = await activeDirHandle.getFileHandle('settings.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    return { ...DEFAULT_SETTINGS, ...JSON.parse(text) };
  } catch {
    return null;
  }
}

export async function saveSettingsToFolder(settings: Partial<AppSettings>): Promise<void> {
  if (!activeDirHandle) return;
  try {
    // Load existing settings to merge
    const existing = await loadSettingsFromFolder() ?? DEFAULT_SETTINGS;
    const merged = { ...existing, ...settings };
    const fileHandle = await activeDirHandle.getFileHandle('settings.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(merged, null, 2));
    await writable.close();
  } catch (e) {
    console.error('Failed to save settings to folder:', e);
  }
}

// ==========================================
// SNIPPETS
// ==========================================

export async function loadSnippetsFromFolder(): Promise<FeedbackSnippet[] | null> {
  if (!activeDirHandle) return null;
  try {
    const fileHandle = await activeDirHandle.getFileHandle('snippets.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function saveSnippetsToFolder(snippets: FeedbackSnippet[]): Promise<void> {
  if (!activeDirHandle) return;
  try {
    const fileHandle = await activeDirHandle.getFileHandle('snippets.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(snippets, null, 2));
    await writable.close();
  } catch (e) {
    console.error('Failed to save snippets to folder:', e);
  }
}

// ==========================================
// COURSES — FULL READ/WRITE
// ==========================================

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Load ALL courses from the folder.
 * Reads the folder structure and reconstructs complete Course objects.
 */
export async function loadCoursesFromFolder(): Promise<Course[] | null> {
  if (!activeDirHandle) return null;

  try {
    let coursesDirHandle: FileSystemDirectoryHandle;
    try {
      coursesDirHandle = await activeDirHandle.getDirectoryHandle('courses');
    } catch {
      // No courses directory yet — empty state
      return [];
    }

    const courses: Course[] = [];

    // @ts-ignore - for await on directory handle
    for await (const entry of coursesDirHandle.values()) {
      if (entry.kind !== 'directory') continue;

      try {
        const course = await readCourseFolder(entry as FileSystemDirectoryHandle);
        if (course) courses.push(course);
      } catch (e) {
        console.error(`Failed to read course folder "${entry.name}":`, e);
      }
    }

    return courses;
  } catch (e) {
    console.error('Failed to load courses from folder:', e);
    return null;
  }
}

/**
 * Save ALL courses to the folder.
 * Overwrites the entire courses directory structure.
 */
export async function saveAllCoursesToFolder(courses: Course[]): Promise<void> {
  if (!activeDirHandle) return;

  try {
    const coursesDirHandle = await activeDirHandle.getDirectoryHandle('courses', { create: true });

    for (const course of courses) {
      await writeCourseFolder(coursesDirHandle, course);
    }
  } catch (e) {
    console.error('Failed to save courses to folder:', e);
  }
}

/**
 * Save a single course to the folder.
 */
export async function saveCourseToFolder(course: Course): Promise<void> {
  if (!activeDirHandle) return;

  try {
    const coursesDirHandle = await activeDirHandle.getDirectoryHandle('courses', { create: true });
    await writeCourseFolder(coursesDirHandle, course);
  } catch (e) {
    console.error('Failed to save course to folder:', e);
  }
}

/**
 * Delete a course folder.
 */
export async function deleteCourseFromFolder(courseName: string): Promise<void> {
  if (!activeDirHandle) return;

  try {
    const coursesDirHandle = await activeDirHandle.getDirectoryHandle('courses');
    const folderName = sanitizeFileName(courseName);
    await coursesDirHandle.removeEntry(folderName, { recursive: true });
  } catch (e) {
    // Folder may not exist, that's fine
    console.error('Failed to delete course folder:', e);
  }
}

// ==========================================
// INTERNAL — READ COURSE FOLDER
// ==========================================

async function readCourseFolder(courseDirHandle: FileSystemDirectoryHandle): Promise<Course | null> {
  let courseName = courseDirHandle.name;
  let courseId = '';
  let courseDescription = '';
  let students: CourseStudent[] = [];
  let createdDate = new Date().toISOString();
  let lastModified = new Date().toISOString();
  let availableLabels: string[] = [];
  let oralTests: OralTest[] = [];

  // Read course-info.json
  try {
    const infoHandle = await courseDirHandle.getFileHandle('course-info.json');
    const file = await infoHandle.getFile();
    const info = JSON.parse(await file.text());
    courseId = info.id || '';
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
    oralTests = info.oralTests || [];
  } catch {
    // No course-info.json
  }

  // Read test subfolders
  const tests: CourseTest[] = [];
  // @ts-ignore
  for await (const entry of courseDirHandle.values()) {
    if (entry.kind !== 'directory') continue;
    try {
      const test = await readTestFolder(entry as FileSystemDirectoryHandle, students);
      if (test) tests.push(test);
    } catch (e) {
      console.error(`Failed to read test folder "${entry.name}":`, e);
    }
  }

  if (!courseId && tests.length === 0 && students.length === 0) {
    return null;
  }

  return {
    id: courseId || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: courseName,
    description: courseDescription,
    students,
    tests,
    oralTests,
    availableLabels,
    createdDate,
    lastModified,
  };
}

async function readTestFolder(
  testDirHandle: FileSystemDirectoryHandle,
  students: CourseStudent[]
): Promise<CourseTest | null> {
  let testName = testDirHandle.name;
  let testId = '';
  let testDescription = '';
  let testDate = new Date().toISOString();
  let tasks: CourseTest['tasks'] = [];
  let generalComment = '';
  let hasTwoParts: boolean | undefined;
  let part1TaskCount: number | undefined;
  let part2TaskCount: number | undefined;
  let restartNumberingInPart2: boolean | undefined;
  let snippets: FeedbackSnippet[] | undefined;
  let testCreatedDate = new Date().toISOString();
  let testLastModified = new Date().toISOString();
  const studentFeedbacks: CourseTest['studentFeedbacks'] = [];

  // Read test-config.json
  try {
    const configHandle = await testDirHandle.getFileHandle('test-config.json');
    const file = await configHandle.getFile();
    const config = JSON.parse(await file.text());
    testId = config.id || '';
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
      const file = await fileHandle.getFile();
      const data = JSON.parse(await file.text());

      let studentId = data.studentId || '';

      // Try to match by name if no studentId
      if (!studentId && data.name) {
        const matched = students.find(s =>
          s.name.toLowerCase() === data.name.toLowerCase()
        );
        if (matched) {
          studentId = matched.id;
        } else {
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
    id: testId || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
// INTERNAL — WRITE COURSE FOLDER
// ==========================================

async function writeCourseFolder(
  parentDirHandle: FileSystemDirectoryHandle,
  course: Course
): Promise<void> {
  const courseFolderName = sanitizeFileName(course.name);
  const courseDirHandle = await parentDirHandle.getDirectoryHandle(courseFolderName, { create: true });

  // Write course-info.json (complete metadata)
  const courseInfoFile = await courseDirHandle.getFileHandle('course-info.json', { create: true });
  const courseInfoWritable = await courseInfoFile.createWritable();
  await courseInfoWritable.write(JSON.stringify({
    id: course.id,
    name: course.name,
    description: course.description,
    students: course.students,
    availableLabels: course.availableLabels,
    oralTests: course.oralTests || [],
    createdDate: course.createdDate,
    lastModified: course.lastModified,
  }, null, 2));
  await courseInfoWritable.close();

  // Write each test
  for (const test of course.tests) {
    await writeTestFolder(courseDirHandle, course, test);
  }
}

async function writeTestFolder(
  courseDirHandle: FileSystemDirectoryHandle,
  course: Course,
  test: CourseTest
): Promise<void> {
  const testFolderName = sanitizeFileName(test.name);
  const testDirHandle = await courseDirHandle.getDirectoryHandle(testFolderName, { create: true });

  // Write test-config.json (complete config)
  const configFile = await testDirHandle.getFileHandle('test-config.json', { create: true });
  const configWritable = await configFile.createWritable();
  await configWritable.write(JSON.stringify({
    id: test.id,
    name: test.name,
    description: test.description,
    date: test.date,
    tasks: test.tasks,
    generalComment: test.generalComment,
    createdDate: test.createdDate,
    lastModified: test.lastModified,
    ...(test.hasTwoParts !== undefined && { hasTwoParts: test.hasTwoParts }),
    ...(test.part1TaskCount !== undefined && { part1TaskCount: test.part1TaskCount }),
    ...(test.part2TaskCount !== undefined && { part2TaskCount: test.part2TaskCount }),
    ...(test.restartNumberingInPart2 !== undefined && { restartNumberingInPart2: test.restartNumberingInPart2 }),
    ...(test.snippets !== undefined && { snippets: test.snippets }),
  }, null, 2));
  await configWritable.close();

  // Write ALL student feedback (not just completed)
  for (const feedback of test.studentFeedbacks) {
    const student = course.students.find(s => s.id === feedback.studentId);
    if (!student) continue;

    const studentFileName = `${sanitizeFileName(student.name)}.json`;
    const studentFile = await testDirHandle.getFileHandle(studentFileName, { create: true });
    const studentWritable = await studentFile.createWritable();
    await studentWritable.write(JSON.stringify({
      studentId: student.id,
      name: student.name,
      studentNumber: student.studentNumber,
      taskFeedbacks: feedback.taskFeedbacks,
      individualComment: feedback.individualComment,
      completedDate: feedback.completedDate,
    }, null, 2));
    await studentWritable.close();
  }
}
