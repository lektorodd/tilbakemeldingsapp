import { describe, it, expect } from 'vitest';
import { calculateTaskStatistics, getStudentProgress, getAllStudentNames, getAllTestNames } from '@/utils/archive';
import { ArchivedFeedback, Task } from '@/types';

function makeArchivedFeedback(overrides: Partial<ArchivedFeedback> = {}): ArchivedFeedback {
  const tasks: Task[] = [
    { id: 't1', label: '1', subtasks: [], hasSubtasks: false, labels: [] },
    { id: 't2', label: '2', subtasks: [{ id: 's2a', label: 'a', labels: [] }], hasSubtasks: true, labels: [] },
  ];
  return {
    id: `fb-${Date.now()}-${Math.random()}`,
    date: '2024-10-15',
    testName: 'October Test',
    studentName: 'Ola Nordmann',
    tasks,
    taskFeedbacks: [
      { taskId: 't1', points: 5, comment: '' },
      { taskId: 't2', subtaskId: 's2a', points: 3, comment: '' },
    ],
    generalComment: '',
    individualComment: '',
    totalPoints: 8,
    maxPoints: 12,
    ...overrides,
  };
}

describe('calculateTaskStatistics', () => {
  it('returns empty array for no archive', () => {
    expect(calculateTaskStatistics([])).toEqual([]);
  });

  it('computes per-task statistics correctly', () => {
    const archive = [makeArchivedFeedback()];
    const stats = calculateTaskStatistics(archive);
    expect(stats.length).toBe(2);

    const task1Stat = stats.find(s => s.taskLabel === '1');
    expect(task1Stat).toBeDefined();
    expect(task1Stat!.averagePoints).toBe(5);
    expect(task1Stat!.totalSubmissions).toBe(1);
    expect(task1Stat!.pointsDistribution[5]).toBe(1);
  });

  it('filters by test name', () => {
    const archive = [
      makeArchivedFeedback({ testName: 'October Test' }),
      makeArchivedFeedback({ testName: 'December Test' }),
    ];
    const stats = calculateTaskStatistics(archive, 'October Test');
    stats.forEach(s => expect(s.totalSubmissions).toBe(1));
  });

  it('averages across multiple students', () => {
    const archive = [
      makeArchivedFeedback({
        studentName: 'Student A',
        taskFeedbacks: [{ taskId: 't1', points: 6, comment: '' }, { taskId: 't2', subtaskId: 's2a', points: 4, comment: '' }],
      }),
      makeArchivedFeedback({
        studentName: 'Student B',
        taskFeedbacks: [{ taskId: 't1', points: 2, comment: '' }, { taskId: 't2', subtaskId: 's2a', points: 6, comment: '' }],
      }),
    ];
    const stats = calculateTaskStatistics(archive);
    const task1 = stats.find(s => s.taskLabel === '1');
    expect(task1!.averagePoints).toBe(4); // (6+2)/2
    expect(task1!.totalSubmissions).toBe(2);
  });
});

describe('getStudentProgress', () => {
  it('returns null for unknown student', () => {
    expect(getStudentProgress([], 'Unknown')).toBeNull();
  });

  it('computes progress for a student', () => {
    const archive = [
      makeArchivedFeedback({ studentName: 'Ola Nordmann', totalPoints: 8, maxPoints: 12 }),
      makeArchivedFeedback({ studentName: 'Ola Nordmann', totalPoints: 10, maxPoints: 12, testName: 'December Test' }),
    ];
    const progress = getStudentProgress(archive, 'Ola Nordmann');
    expect(progress).not.toBeNull();
    expect(progress!.totalTests).toBe(2);
    expect(progress!.feedbacks.length).toBe(2);
  });

  it('is case-insensitive', () => {
    const archive = [makeArchivedFeedback({ studentName: 'Ola Nordmann' })];
    const progress = getStudentProgress(archive, 'ola nordmann');
    expect(progress).not.toBeNull();
  });
});

describe('getAllStudentNames', () => {
  it('returns sorted unique names', () => {
    const archive = [
      makeArchivedFeedback({ studentName: 'Cecilia' }),
      makeArchivedFeedback({ studentName: 'Arne' }),
      makeArchivedFeedback({ studentName: 'Cecilia' }),
      makeArchivedFeedback({ studentName: 'Bjorn' }),
    ];
    expect(getAllStudentNames(archive)).toEqual(['Arne', 'Bjorn', 'Cecilia']);
  });

  it('returns empty for no archive', () => {
    expect(getAllStudentNames([])).toEqual([]);
  });
});

describe('getAllTestNames', () => {
  it('returns sorted unique test names', () => {
    const archive = [
      makeArchivedFeedback({ testName: 'October Test' }),
      makeArchivedFeedback({ testName: 'December Test' }),
      makeArchivedFeedback({ testName: 'October Test' }),
    ];
    expect(getAllTestNames(archive)).toEqual(['December Test', 'October Test']);
  });
});
