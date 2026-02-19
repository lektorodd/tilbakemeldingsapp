/**
 * Server-backed folder sync — used when the File System Access API is unavailable
 * (e.g., in Tauri's WKWebView). Delegates all file operations to /api/folder-sync.
 */

import { Course, CourseStudent, CourseTest, FeedbackSnippet, OralTest } from '@/types';

const API_BASE = '/api/folder-sync';

// ==========================================
// DETECTION
// ==========================================

/** Returns true if we should use the server-backed sync (no browser FS API) */
export function shouldUseServerSync(): boolean {
    if (typeof window === 'undefined') return false;
    return !('showDirectoryPicker' in window);
}

// ==========================================
// CONNECTION
// ==========================================

let serverFolderPath: string | null = null;
let serverFolderName: string | null = null;

export async function serverInitFolderSync(): Promise<boolean> {
    // Try to reconnect from localStorage
    const savedPath = localStorage.getItem('folderSyncPath');
    if (!savedPath) return false;

    try {
        const res = await fetch(`${API_BASE}?action=reconnect&path=${encodeURIComponent(savedPath)}`);
        const data = await res.json();
        if (data.connected) {
            serverFolderPath = data.path;
            serverFolderName = data.path?.split('/').pop() || null;
            return true;
        }
    } catch {
        // Server not available
    }
    return false;
}

export async function serverChooseFolderAndConnect(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}?action=browse`);
        const data = await res.json();
        if (data.cancelled) return false;
        if (data.path) {
            serverFolderPath = data.path;
            serverFolderName = data.name;
            localStorage.setItem('folderSyncPath', data.path);
            return true;
        }
    } catch (e) {
        console.error('Server folder browse failed:', e);
    }
    return false;
}

export async function serverDisconnectFolder(): Promise<void> {
    serverFolderPath = null;
    serverFolderName = null;
    localStorage.removeItem('folderSyncPath');
    await fetch(`${API_BASE}?action=disconnect`).catch(() => { });
}

export function serverIsFolderConnected(): boolean {
    return serverFolderPath !== null;
}

export function serverGetFolderName(): string | null {
    return serverFolderName;
}

// ==========================================
// SETTINGS
// ==========================================

export interface AppSettings {
    language: 'en' | 'nb' | 'nn';
    darkMode?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = { language: 'nb' };

export async function serverLoadSettingsFromFolder(): Promise<AppSettings | null> {
    if (!serverFolderPath) return null;
    try {
        const res = await fetch(`${API_BASE}?action=read&path=settings.json`);
        if (!res.ok) return null;
        const data = await res.json();
        return { ...DEFAULT_SETTINGS, ...data };
    } catch {
        return null;
    }
}

export async function serverSaveSettingsToFolder(settings: Partial<AppSettings>): Promise<void> {
    if (!serverFolderPath) return;
    const existing = await serverLoadSettingsFromFolder() ?? DEFAULT_SETTINGS;
    const merged = { ...existing, ...settings };
    await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', path: 'settings.json', data: merged }),
    });
}

// ==========================================
// SNIPPETS
// ==========================================

export async function serverLoadSnippetsFromFolder(): Promise<FeedbackSnippet[] | null> {
    if (!serverFolderPath) return null;
    try {
        const res = await fetch(`${API_BASE}?action=read&path=snippets.json`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function serverSaveSnippetsToFolder(snippets: FeedbackSnippet[]): Promise<void> {
    if (!serverFolderPath) return;
    await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', path: 'snippets.json', data: snippets }),
    });
}

// ==========================================
// COURSES
// ==========================================

function sanitizeFileName(name: string): string {
    return name
        .replace(/[^a-z0-9æøåÆØÅ_\-\s]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
}

export async function serverLoadCoursesFromFolder(): Promise<Course[] | null> {
    if (!serverFolderPath) return null;

    try {
        // Check if courses directory exists
        const existsRes = await fetch(`${API_BASE}?action=exists&path=courses`);
        const { exists } = await existsRes.json();
        if (!exists) return [];

        // List course directories
        const listRes = await fetch(`${API_BASE}?action=list&path=courses`);
        const entries: { name: string; isDirectory: boolean }[] = await listRes.json();

        const courses: Course[] = [];

        for (const entry of entries) {
            if (!entry.isDirectory) continue;
            try {
                const course = await readCourseFolderServer(entry.name);
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

async function readCourseFolderServer(courseFolderName: string): Promise<Course | null> {
    const basePath = `courses/${courseFolderName}`;
    let courseName = courseFolderName;
    let courseId = '';
    let courseDescription = '';
    let students: CourseStudent[] = [];
    let createdDate = new Date().toISOString();
    let lastModified = new Date().toISOString();
    let availableLabels: string[] = [];
    let oralTests: OralTest[] = [];

    // Read course-info.json
    try {
        const res = await fetch(`${API_BASE}?action=read&path=${encodeURIComponent(`${basePath}/course-info.json`)}`);
        if (res.ok) {
            const info = await res.json();
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
        }
    } catch { /* No course-info.json */ }

    // List test subfolders
    const tests: CourseTest[] = [];
    try {
        const listRes = await fetch(`${API_BASE}?action=list&path=${encodeURIComponent(basePath)}`);
        const entries: { name: string; isDirectory: boolean }[] = await listRes.json();

        for (const entry of entries) {
            if (!entry.isDirectory) continue;
            try {
                const test = await readTestFolderServer(basePath, entry.name, students);
                if (test) tests.push(test);
            } catch (e) {
                console.error(`Failed to read test folder "${entry.name}":`, e);
            }
        }
    } catch { /* No test subfolders */ }

    if (!courseId && tests.length === 0 && students.length === 0) return null;

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

async function readTestFolderServer(
    courseBasePath: string,
    testFolderName: string,
    students: CourseStudent[]
): Promise<CourseTest | null> {
    const testBasePath = `${courseBasePath}/${testFolderName}`;
    let testName = testFolderName;
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
        const res = await fetch(`${API_BASE}?action=read&path=${encodeURIComponent(`${testBasePath}/test-config.json`)}`);
        if (res.ok) {
            const config = await res.json();
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
        }
    } catch { /* No test-config.json */ }

    // Read student feedback files
    try {
        const listRes = await fetch(`${API_BASE}?action=list&path=${encodeURIComponent(testBasePath)}`);
        const entries: { name: string; isDirectory: boolean }[] = await listRes.json();

        for (const entry of entries) {
            if (entry.isDirectory) continue;
            if (entry.name === 'test-config.json') continue;
            if (!entry.name.endsWith('.json')) continue;

            try {
                const res = await fetch(`${API_BASE}?action=read&path=${encodeURIComponent(`${testBasePath}/${entry.name}`)}`);
                if (!res.ok) continue;
                const data = await res.json();

                let studentId = data.studentId || '';
                if (!studentId && data.name) {
                    const matched = students.find(s => s.name.toLowerCase() === data.name.toLowerCase());
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
    } catch { /* No feedback files */ }

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
// WRITE OPERATIONS
// ==========================================

export async function serverSaveAllCoursesToFolder(courses: Course[]): Promise<void> {
    if (!serverFolderPath) return;
    for (const course of courses) {
        await serverSaveCourseToFolder(course);
    }
}

export async function serverSaveCourseToFolder(course: Course): Promise<void> {
    if (!serverFolderPath) return;

    const courseFolderName = sanitizeFileName(course.name);
    const basePath = `courses/${courseFolderName}`;

    // Write course-info.json
    await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'write',
            path: `${basePath}/course-info.json`,
            data: {
                id: course.id,
                name: course.name,
                description: course.description,
                students: course.students,
                availableLabels: course.availableLabels,
                oralTests: course.oralTests || [],
                createdDate: course.createdDate,
                lastModified: course.lastModified,
            },
        }),
    });

    // Write each test
    for (const test of course.tests) {
        const testFolderName = sanitizeFileName(test.name);
        const testPath = `${basePath}/${testFolderName}`;

        // Write test-config.json
        await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'write',
                path: `${testPath}/test-config.json`,
                data: {
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
                },
            }),
        });

        // Write student feedback files
        for (const feedback of test.studentFeedbacks) {
            const student = course.students.find(s => s.id === feedback.studentId);
            if (!student) continue;

            const studentFileName = `${sanitizeFileName(student.name)}.json`;
            await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'write',
                    path: `${testPath}/${studentFileName}`,
                    data: {
                        studentId: student.id,
                        name: student.name,
                        studentNumber: student.studentNumber,
                        taskFeedbacks: feedback.taskFeedbacks,
                        individualComment: feedback.individualComment,
                        completedDate: feedback.completedDate,
                    },
                }),
            });
        }
    }
}

export async function serverDeleteCourseFromFolder(courseName: string): Promise<void> {
    if (!serverFolderPath) return;
    const folderName = sanitizeFileName(courseName);
    await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', path: `courses/${folderName}` }),
    });
}
