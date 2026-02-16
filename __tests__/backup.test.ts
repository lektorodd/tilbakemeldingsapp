import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createBackup,
    listBackups,
    restoreFromBackup,
    deleteBackup,
    startAutoBackup,
    stopAutoBackup,
    isAutoBackupRunning,
    loadAllCourses,
    saveCourse,
    safeDeleteCourse,
} from '@/utils/storage';
import { Course } from '@/types';

// ─── test helpers ─────────────────────────────────────────────────

function makeCourse(id: string, name: string, opts: {
    completedFeedbacks?: number;
} = {}): Course {
    const studentFeedbacks = Array.from(
        { length: opts.completedFeedbacks ?? 0 },
        (_, i) => ({
            studentId: `s${i}`,
            taskFeedbacks: [],
            individualComment: '',
            completedDate: '2026-01-01T00:00:00Z',
        })
    );

    return {
        id,
        name,
        description: '',
        students: [{ id: 's1', name: 'Alice', studentNumber: '1' }],
        tests: [{
            id: 'test1',
            name: 'Test 1',
            date: '2026-01-01',
            tasks: [],
            studentFeedbacks,
            createdDate: '2026-01-01T00:00:00Z',
            lastModified: '2026-01-01T00:00:00Z',
            hasTwoParts: false,
        }],
        createdDate: '2026-01-01T00:00:00Z',
        lastModified: '2026-01-01T00:00:00Z',
        availableLabels: [],
    };
}

// ─── setup / teardown ─────────────────────────────────────────────

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
    stopAutoBackup();
});

afterEach(() => {
    stopAutoBackup();
    vi.useRealTimers();
});

// ─── createBackup ─────────────────────────────────────────────────

describe('createBackup', () => {
    it('returns null when no courses exist', () => {
        expect(createBackup('manual')).toBeNull();
    });

    it('creates a backup entry with correct metadata', () => {
        saveCourse(makeCourse('c1', 'Math 101', { completedFeedbacks: 2 }));

        const entry = createBackup('manual');
        expect(entry).not.toBeNull();
        expect(entry!.courseCount).toBe(1);
        expect(entry!.totalFeedback).toBe(2);
        expect(entry!.label).toBe('manual');
        expect(entry!.sizeBytes).toBeGreaterThan(0);
    });

    it('trims backups to MAX_BACKUPS (10)', () => {
        saveCourse(makeCourse('c1', 'Math 101'));

        // create 12 backups — should keep only 10
        for (let i = 0; i < 12; i++) {
            createBackup('auto');
        }

        const backups = listBackups();
        expect(backups.length).toBeLessThanOrEqual(10);
    });
});

// ─── listBackups ──────────────────────────────────────────────────

describe('listBackups', () => {
    it('returns empty array when no backups exist', () => {
        expect(listBackups()).toEqual([]);
    });

    it('returns all created backups', () => {
        saveCourse(makeCourse('c1', 'Math'));

        createBackup('first');
        createBackup('second');
        createBackup('third');

        const backups = listBackups();
        expect(backups).toHaveLength(3);
        const labels = backups.map(b => b.label);
        expect(labels).toContain('first');
        expect(labels).toContain('second');
        expect(labels).toContain('third');
    });
});

// ─── restoreFromBackup ────────────────────────────────────────────

describe('restoreFromBackup', () => {
    it('restores courses from a backup', () => {
        // Create initial state and backup
        saveCourse(makeCourse('c1', 'Math'));
        saveCourse(makeCourse('c2', 'Science'));
        const backup = createBackup('manual')!;

        // Delete a course
        localStorage.setItem('math-feedback-courses', JSON.stringify([makeCourse('c1', 'Math')]));
        expect(loadAllCourses()).toHaveLength(1);

        // Restore
        const result = restoreFromBackup(backup.id);
        expect(result.success).toBe(true);
        expect(result.courseCount).toBe(2);
        expect(loadAllCourses()).toHaveLength(2);
    });

    it('returns failure for non-existent backup', () => {
        const result = restoreFromBackup('nonexistent-id');
        expect(result.success).toBe(false);
        expect(result.courseCount).toBe(0);
    });

    it('creates safety backup before restoring', () => {
        saveCourse(makeCourse('c1', 'Math'));
        const originalBackup = createBackup('manual')!;

        // Modify state
        saveCourse(makeCourse('c2', 'New Course'));

        restoreFromBackup(originalBackup.id);

        // Should have more backups now (original + before-restore)
        const backups = listBackups();
        const safetyBackup = backups.find(b => b.label === 'before-restore');
        expect(safetyBackup).toBeDefined();
    });
});

// ─── deleteBackup ─────────────────────────────────────────────────

describe('deleteBackup', () => {
    it('removes a backup from the index and localStorage', () => {
        saveCourse(makeCourse('c1', 'Math'));
        const backup = createBackup('manual')!;

        expect(listBackups()).toHaveLength(1);
        deleteBackup(backup.id);
        expect(listBackups()).toHaveLength(0);
    });
});

// ─── autoBackup ───────────────────────────────────────────────────

describe('autoBackup', () => {
    it('starts and stops correctly', () => {
        saveCourse(makeCourse('c1', 'Math'));

        expect(isAutoBackupRunning()).toBe(false);
        startAutoBackup();
        expect(isAutoBackupRunning()).toBe(true);

        // Should have created an initial backup
        expect(listBackups().length).toBeGreaterThanOrEqual(1);

        stopAutoBackup();
        expect(isAutoBackupRunning()).toBe(false);
    });

    it('does not start a second timer if already running', () => {
        saveCourse(makeCourse('c1', 'Math'));

        startAutoBackup();
        startAutoBackup(); // should be a no-op
        expect(isAutoBackupRunning()).toBe(true);

        stopAutoBackup();
        expect(isAutoBackupRunning()).toBe(false);
    });
});

// ─── safeDeleteCourse ─────────────────────────────────────────────

describe('safeDeleteCourse', () => {
    it('creates a backup before deleting', () => {
        saveCourse(makeCourse('c1', 'Math'));
        saveCourse(makeCourse('c2', 'Science'));

        const { backupId } = safeDeleteCourse('c1');
        expect(backupId).not.toBeNull();
        expect(loadAllCourses()).toHaveLength(1);
        expect(loadAllCourses()[0].name).toBe('Science');

        // Backup exists and contains the deleted course
        const backups = listBackups();
        expect(backups.some(b => b.label === 'before-delete')).toBe(true);
    });
});
