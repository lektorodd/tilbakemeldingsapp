import { describe, it, expect, beforeEach } from 'vitest';
import {
    exportAllCourses,
    importCourses,
    importCoursesFromData,
    validateCourseData,
    loadAllCourses,
    saveCourse,
} from '@/utils/storage';
import { Course } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────

function makeCourse(id: string, name: string, opts: {
    students?: { id: string; name: string; studentNumber: string }[];
    tests?: { id: string; name: string }[];
    labels?: string[];
} = {}): Course {
    return {
        id,
        name,
        description: '',
        students: opts.students ?? [{ id: 's1', name: 'Alice', studentNumber: '1' }],
        tests: (opts.tests ?? [{ id: 'test1', name: 'Test 1' }]).map(t => ({
            ...t,
            date: '2026-01-01',
            tasks: [],
            studentFeedbacks: [],
            createdDate: '2026-01-01T00:00:00Z',
            lastModified: '2026-01-01T00:00:00Z',
            hasTwoParts: false,
        })),
        createdDate: '2026-01-01T00:00:00Z',
        lastModified: '2026-01-01T00:00:00Z',
        availableLabels: opts.labels ?? [],
    };
}

// ─── setup ────────────────────────────────────────────────────────

function clearStorage() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
    }
    keys.forEach(k => localStorage.removeItem(k));
}

beforeEach(() => {
    clearStorage();
});

// ─── validateCourseData ───────────────────────────────────────────

describe('validateCourseData', () => {
    it('validates a correct course', () => {
        const result = validateCourseData(makeCourse('c1', 'Math'));
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('validates an array of courses', () => {
        const result = validateCourseData([makeCourse('c1', 'Math'), makeCourse('c2', 'Science')]);
        expect(result.valid).toBe(true);
    });

    it('rejects null/undefined', () => {
        expect(validateCourseData(null).valid).toBe(false);
        expect(validateCourseData(undefined).valid).toBe(false);
    });

    it('rejects course without name', () => {
        const result = validateCourseData({ students: [], tests: [] });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('name');
    });

    it('rejects course without students array', () => {
        const result = validateCourseData({ name: 'Math', tests: [] });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('students');
    });

    it('rejects course without tests array', () => {
        const result = validateCourseData({ name: 'Math', students: [] });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('tests');
    });
});

// ─── exportAllCourses ─────────────────────────────────────────────

describe('exportAllCourses', () => {
    it('returns empty array JSON when no courses', () => {
        expect(exportAllCourses()).toBe('[]');
    });

    it('exports all courses as formatted JSON', () => {
        saveCourse(makeCourse('c1', 'Math'));
        saveCourse(makeCourse('c2', 'Science'));

        const exported = exportAllCourses();
        const parsed = JSON.parse(exported);
        expect(parsed).toHaveLength(2);
        expect(parsed[0].name).toBe('Math');
        expect(parsed[1].name).toBe('Science');
    });
});

// ─── round-trip ───────────────────────────────────────────────────

describe('export → import round-trip', () => {
    it('preserves data through export and re-import', () => {
        const original = makeCourse('c1', 'Algebra', {
            students: [
                { id: 's1', name: 'Alice', studentNumber: '1' },
                { id: 's2', name: 'Bob', studentNumber: '2' },
            ],
            labels: ['equations', 'geometry'],
        });
        saveCourse(original);

        const exported = exportAllCourses();

        // Clear and re-import
        clearStorage();
        expect(loadAllCourses()).toHaveLength(0);

        const result = importCourses(exported);
        expect(result.imported).toBe(1);
        expect(result.errors).toHaveLength(0);

        const courses = loadAllCourses();
        expect(courses).toHaveLength(1);
        expect(courses[0].name).toBe('Algebra');
        expect(courses[0].students).toHaveLength(2);
        expect(courses[0].availableLabels).toEqual(['equations', 'geometry']);
    });
});

// ─── importCourses ────────────────────────────────────────────────

describe('importCourses', () => {
    it('rejects invalid JSON', () => {
        const result = importCourses('not json!!!');
        expect(result.errors).toContain('Invalid JSON format');
        expect(result.imported).toBe(0);
    });

    it('imports a new course', () => {
        const json = JSON.stringify(makeCourse('c1', 'Math'));
        const result = importCourses(json);
        expect(result.imported).toBe(1);
        expect(loadAllCourses()).toHaveLength(1);
    });

    it('imports an array of courses', () => {
        const json = JSON.stringify([makeCourse('c1', 'Math'), makeCourse('c2', 'Science')]);
        const result = importCourses(json);
        expect(result.imported).toBe(2);
    });

    it('skips duplicates by default (same ID)', () => {
        saveCourse(makeCourse('c1', 'Math'));
        const json = JSON.stringify(makeCourse('c1', 'Math'));

        const result = importCourses(json);
        expect(result.skippedDuplicates).toBe(1);
        expect(result.imported).toBe(0);
        expect(loadAllCourses()).toHaveLength(1);
    });

    it('skips duplicates by name (case-insensitive)', () => {
        saveCourse(makeCourse('c1', 'Math'));
        const json = JSON.stringify(makeCourse('c99', 'MATH')); // different ID, same name

        const result = importCourses(json);
        expect(result.skippedDuplicates).toBe(1);
    });

    it('force-imports duplicates with skipDuplicates=false', () => {
        saveCourse(makeCourse('c1', 'Math'));
        const json = JSON.stringify(makeCourse('c1', 'Math'));

        const result = importCourses(json, { skipDuplicates: false });
        expect(result.imported).toBe(1);
        // Should have 2 courses (original + renamed import)
        const courses = loadAllCourses();
        expect(courses).toHaveLength(2);
        expect(courses[1].name).toContain('(imported)');
    });

    it('merges students and tests with mergeExisting=true', () => {
        // Existing course with Alice
        saveCourse(makeCourse('c1', 'Math', {
            students: [{ id: 's1', name: 'Alice', studentNumber: '1' }],
            tests: [{ id: 'test1', name: 'Test 1' }],
            labels: ['algebra'],
        }));

        // Import same course with Bob and a new test
        const incoming = makeCourse('c1', 'Math', {
            students: [
                { id: 's1', name: 'Alice', studentNumber: '1' },
                { id: 's2', name: 'Bob', studentNumber: '2' },
            ],
            tests: [{ id: 'test1', name: 'Test 1' }, { id: 'test2', name: 'Test 2' }],
            labels: ['algebra', 'geometry'],
        });

        const result = importCourses(JSON.stringify(incoming), { mergeExisting: true });
        expect(result.merged).toBe(1);

        const courses = loadAllCourses();
        expect(courses).toHaveLength(1);
        expect(courses[0].students).toHaveLength(2); // Alice + Bob
        expect(courses[0].tests).toHaveLength(2);    // Test 1 + Test 2
        expect(courses[0].availableLabels).toContain('geometry');
    });

    it('generates ID for course without one', () => {
        const course = makeCourse('', 'No-ID Course');
        course.id = '';  // explicitly empty
        const json = JSON.stringify(course);

        const result = importCourses(json);
        expect(result.imported).toBe(1);

        const courses = loadAllCourses();
        expect(courses[0].id).toBeTruthy(); // should have generated an ID
    });
});

// ─── importCoursesFromData ────────────────────────────────────────

describe('importCoursesFromData', () => {
    it('wraps importCourses with object input', () => {
        const course = makeCourse('c1', 'Math');
        const result = importCoursesFromData([course]);
        expect(result.imported).toBe(1);
        expect(loadAllCourses()).toHaveLength(1);
    });
});
