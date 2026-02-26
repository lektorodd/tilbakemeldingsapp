import { describe, it, expect, beforeEach } from 'vitest';
import {
    saveCourse,
    loadCourse,
    addObservation,
    updateObservation,
    deleteObservation,
    getStudentObservations,
    deleteStudent,
} from '@/utils/storage';
import type { Course } from '@/types';

const makeCourse = (): Course => ({
    id: 'course-obs-test',
    name: 'Test Course',
    students: [
        { id: 'student-1', name: 'Alice' },
        { id: 'student-2', name: 'Bob' },
    ],
    tests: [],
    oralTests: [],
    observations: [],
    availableLabels: ['algebra', 'geometry'],
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
});

describe('Observation CRUD', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('addObservation creates an observation with generated id', () => {
        saveCourse(makeCourse());
        const obs = addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Great participation today',
            type: 'positive',
            date: '2026-02-26',
        });

        expect(obs.id).toMatch(/^obs-/);
        expect(obs.text).toBe('Great participation today');
        expect(obs.type).toBe('positive');
        expect(obs.createdDate).toBeTruthy();

        const course = loadCourse('course-obs-test');
        expect(course!.observations).toHaveLength(1);
        expect(course!.observations![0].id).toBe(obs.id);
    });

    it('addObservation supports labels', () => {
        saveCourse(makeCourse());
        const obs = addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Solved algebra problem well',
            type: 'positive',
            labels: ['algebra'],
            date: '2026-02-26',
        });

        expect(obs.labels).toEqual(['algebra']);
    });

    it('updateObservation patches fields correctly', () => {
        saveCourse(makeCourse());
        const obs = addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Original text',
            type: 'note',
            date: '2026-02-26',
        });

        updateObservation('course-obs-test', obs.id, {
            text: 'Updated text',
            type: 'constructive',
        });

        const course = loadCourse('course-obs-test');
        const updated = course!.observations!.find(o => o.id === obs.id)!;
        expect(updated.text).toBe('Updated text');
        expect(updated.type).toBe('constructive');
        expect(updated.studentId).toBe('student-1'); // unchanged
    });

    it('deleteObservation removes the correct observation', () => {
        saveCourse(makeCourse());
        const obs1 = addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Obs 1',
            type: 'positive',
            date: '2026-02-25',
        });
        const obs2 = addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Obs 2',
            type: 'note',
            date: '2026-02-26',
        });

        deleteObservation('course-obs-test', obs1.id);

        const course = loadCourse('course-obs-test');
        expect(course!.observations).toHaveLength(1);
        expect(course!.observations![0].id).toBe(obs2.id);
    });

    it('getStudentObservations returns only matching student, sorted newest first', () => {
        saveCourse(makeCourse());
        addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Older obs',
            type: 'positive',
            date: '2026-01-01',
        });
        addObservation('course-obs-test', {
            studentId: 'student-2',
            text: 'Bob obs',
            type: 'note',
            date: '2026-02-15',
        });
        addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Newer obs',
            type: 'constructive',
            date: '2026-02-26',
        });

        const aliceObs = getStudentObservations('course-obs-test', 'student-1');
        expect(aliceObs).toHaveLength(2);
        expect(aliceObs[0].text).toBe('Newer obs'); // newest first
        expect(aliceObs[1].text).toBe('Older obs');

        const bobObs = getStudentObservations('course-obs-test', 'student-2');
        expect(bobObs).toHaveLength(1);
        expect(bobObs[0].text).toBe('Bob obs');
    });

    it('deleteStudent also removes their observations', () => {
        saveCourse(makeCourse());
        addObservation('course-obs-test', {
            studentId: 'student-1',
            text: 'Alice obs',
            type: 'positive',
            date: '2026-02-26',
        });
        addObservation('course-obs-test', {
            studentId: 'student-2',
            text: 'Bob obs',
            type: 'note',
            date: '2026-02-26',
        });

        deleteStudent('course-obs-test', 'student-1');

        const course = loadCourse('course-obs-test');
        expect(course!.observations).toHaveLength(1);
        expect(course!.observations![0].studentId).toBe('student-2');
    });

    it('getStudentObservations returns empty array for course without observations', () => {
        const course = makeCourse();
        delete (course as any).observations;
        saveCourse(course);

        const obs = getStudentObservations('course-obs-test', 'student-1');
        expect(obs).toEqual([]);
    });
});
