import { describe, it, expect, beforeEach } from 'vitest';
import { mergeFeedbacks, mergeTests } from '@/utils/storage';
import { TestFeedbackData, CourseTest } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────

function makeFb(
    studentId: string,
    taskCount: number,
    opts: { completed?: boolean; comment?: string } = {}
): TestFeedbackData {
    return {
        studentId,
        taskFeedbacks: Array.from({ length: taskCount }, (_, i) => ({
            taskId: `t${i}`,
            points: 3,
            comment: '',
        })),
        individualComment: opts.comment ?? '',
        completedDate: opts.completed ? '2026-01-01T00:00:00Z' : undefined,
    };
}

function makeTest(
    id: string,
    feedbacks: TestFeedbackData[] = [],
    modified = '2026-01-01T00:00:00Z'
): CourseTest {
    return {
        id,
        name: `Test ${id}`,
        date: '2026-01-01',
        tasks: [],
        studentFeedbacks: feedbacks,
        createdDate: '2026-01-01T00:00:00Z',
        lastModified: modified,
        hasTwoParts: false,
    };
}

// ─── mergeFeedbacks ───────────────────────────────────────────────

describe('mergeFeedbacks', () => {
    it('keeps all local feedback when folder is empty', () => {
        const local = [makeFb('s1', 3), makeFb('s2', 2)];
        const result = mergeFeedbacks(local, []);
        expect(result).toHaveLength(2);
        expect(result.map(f => f.studentId).sort()).toEqual(['s1', 's2']);
    });

    it('adds folder-only students', () => {
        const local = [makeFb('s1', 2)];
        const folder = [makeFb('s3', 4)];
        const result = mergeFeedbacks(local, folder);
        expect(result).toHaveLength(2);
        expect(result.find(f => f.studentId === 's3')!.taskFeedbacks).toHaveLength(4);
    });

    it('keeps local in-progress work over empty folder entry', () => {
        const local = [makeFb('s1', 3)];               // in-progress, 3 tasks graded
        const folder = [makeFb('s1', 0)];               // empty in folder
        const result = mergeFeedbacks(local, folder);
        expect(result).toHaveLength(1);
        expect(result[0].taskFeedbacks).toHaveLength(3); // kept local
    });

    it('takes folder data when local is empty', () => {
        const local = [makeFb('s1', 0)];                // empty local
        const folder = [makeFb('s1', 5)];               // folder has data
        const result = mergeFeedbacks(local, folder);
        expect(result[0].taskFeedbacks).toHaveLength(5); // used folder
    });

    it('prefers completed over not-completed (folder completed)', () => {
        const local = [makeFb('s1', 2)];                     // 2 tasks, not completed
        const folder = [makeFb('s1', 3, { completed: true })]; // 3 tasks, completed
        const result = mergeFeedbacks(local, folder);
        expect(result[0].completedDate).toBeDefined();
        expect(result[0].taskFeedbacks).toHaveLength(3);
    });

    it('keeps local with more feedbacks even if folder is completed', () => {
        const local = [makeFb('s1', 5)];                     // 5 tasks (more work)
        const folder = [makeFb('s1', 3, { completed: true })]; // 3 tasks, completed
        const result = mergeFeedbacks(local, folder);
        // Local has MORE tasks → keep it despite folder being completed
        expect(result[0].taskFeedbacks).toHaveLength(5);
    });

    it('prefers completed local over not-completed folder', () => {
        const local = [makeFb('s1', 3, { completed: true })];
        const folder = [makeFb('s1', 2)];
        const result = mergeFeedbacks(local, folder);
        expect(result[0].completedDate).toBeDefined();
        expect(result[0].taskFeedbacks).toHaveLength(3);
    });

    it('prefers more data when both have same completion status', () => {
        const local = [makeFb('s1', 2)];
        const folder = [makeFb('s1', 5)];  // folder has more
        const result = mergeFeedbacks(local, folder);
        expect(result[0].taskFeedbacks).toHaveLength(5);
    });

    it('keeps local when both have same count and same completion', () => {
        const local = [makeFb('s1', 3, { comment: 'local-comment' })];
        const folder = [makeFb('s1', 3, { comment: 'folder-comment' })];
        const result = mergeFeedbacks(local, folder);
        // Same count → local wins (no replacement happens)
        expect(result[0].individualComment).toBe('local-comment');
    });

    it('considers individualComment as "has data"', () => {
        const local = [makeFb('s1', 0, { comment: 'working on it' })];
        const folder = [makeFb('s1', 0)]; // empty
        const result = mergeFeedbacks(local, folder);
        // Local has comment = has data, folder doesn't → keep local
        expect(result[0].individualComment).toBe('working on it');
    });

    it('handles many students from both sources', () => {
        const local = [makeFb('s1', 1), makeFb('s2', 1)];
        const folder = [makeFb('s2', 2), makeFb('s3', 1)];
        const result = mergeFeedbacks(local, folder);
        expect(result).toHaveLength(3);  // s1, s2, s3
        // s2: folder has more → use folder
        expect(result.find(f => f.studentId === 's2')!.taskFeedbacks).toHaveLength(2);
    });
});

// ─── mergeTests ───────────────────────────────────────────────────

describe('mergeTests', () => {
    it('keeps all local tests when folder is empty', () => {
        const local = [makeTest('t1'), makeTest('t2')];
        const result = mergeTests(local, []);
        expect(result).toHaveLength(2);
    });

    it('adds folder-only tests', () => {
        const local = [makeTest('t1')];
        const folder = [makeTest('t2')];
        const result = mergeTests(local, folder);
        expect(result).toHaveLength(2);
    });

    it('merges feedbacks for overlapping tests', () => {
        const local = [makeTest('t1', [makeFb('s1', 3)])];
        const folder = [makeTest('t1', [makeFb('s2', 4)])];
        const result = mergeTests(local, folder);
        expect(result).toHaveLength(1);
        expect(result[0].studentFeedbacks).toHaveLength(2);
    });

    it('uses newer test config when test exists in both', () => {
        const local = [makeTest('t1', [], '2026-01-01T00:00:00Z')];
        const folder = [makeTest('t1', [], '2026-02-01T00:00:00Z')];
        // Folder is newer → use folder's config (name, tasks, etc.)
        // This test just ensures no crash; actual config preference is based on lastModified
        const result = mergeTests(local, folder);
        expect(result).toHaveLength(1);
    });

    it('handles empty inputs', () => {
        expect(mergeTests([], [])).toEqual([]);
    });
});
