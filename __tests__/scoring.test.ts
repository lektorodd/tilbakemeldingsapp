import { describe, it, expect } from 'vitest';
import { calculateStudentScore, calculateMaxScore, calculateOralScore } from '@/utils/courseStorage';
import { calculateTotalPoints, calculateMaxPoints } from '@/utils/typstExport';
import { Task, TaskFeedback, OralFeedbackData } from '@/types';

// Test helpers
function makeTask(id: string, label: string, subtasks: { id: string; label: string }[] = []): Task {
  return {
    id,
    label,
    subtasks: subtasks.map(s => ({ ...s, labels: [] })),
    hasSubtasks: subtasks.length > 0,
    labels: [],
  };
}

function makeFeedback(taskId: string, points: number, subtaskId?: string): TaskFeedback {
  return { taskId, subtaskId, points, comment: '' };
}

describe('calculateStudentScore', () => {
  it('returns 0 for no tasks', () => {
    expect(calculateStudentScore([], [])).toBe(0);
  });

  it('calculates score for simple tasks', () => {
    const tasks = [makeTask('t1', '1'), makeTask('t2', '2')];
    const feedbacks = [makeFeedback('t1', 6), makeFeedback('t2', 4)];
    // Average: (6+4)/2 = 5, *10 = 50
    expect(calculateStudentScore(tasks, feedbacks)).toBe(50);
  });

  it('calculates score for tasks with subtasks', () => {
    const tasks = [
      makeTask('t1', '1', [{ id: 's1a', label: 'a' }, { id: 's1b', label: 'b' }]),
    ];
    const feedbacks = [
      makeFeedback('t1', 6, 's1a'),
      makeFeedback('t1', 3, 's1b'),
    ];
    // Average: (6+3)/2 = 4.5, *10 = 45
    expect(calculateStudentScore(tasks, feedbacks)).toBe(45);
  });

  it('calculates score for mixed tasks', () => {
    const tasks = [
      makeTask('t1', '1'),
      makeTask('t2', '2', [{ id: 's2a', label: 'a' }, { id: 's2b', label: 'b' }]),
    ];
    const feedbacks = [
      makeFeedback('t1', 6),
      makeFeedback('t2', 4, 's2a'),
      makeFeedback('t2', 2, 's2b'),
    ];
    // 3 total tasks: (6+4+2)/3 = 4, *10 = 40
    expect(calculateStudentScore(tasks, feedbacks)).toBe(40);
  });

  it('handles zero scores', () => {
    const tasks = [makeTask('t1', '1'), makeTask('t2', '2')];
    const feedbacks = [makeFeedback('t1', 0), makeFeedback('t2', 0)];
    expect(calculateStudentScore(tasks, feedbacks)).toBe(0);
  });

  it('handles perfect scores', () => {
    const tasks = [makeTask('t1', '1')];
    const feedbacks = [makeFeedback('t1', 6)];
    // 6/1 * 10 = 60
    expect(calculateStudentScore(tasks, feedbacks)).toBe(60);
  });
});

describe('calculateMaxScore', () => {
  it('returns 60', () => {
    expect(calculateMaxScore()).toBe(60);
  });
});

describe('calculateOralScore', () => {
  it('returns 0 for empty dimensions', () => {
    const data: OralFeedbackData = {
      studentId: 's1',
      dimensions: [],
      generalObservations: '',
    };
    expect(calculateOralScore(data)).toBe(0);
  });

  it('calculates average * 10 for dimensions', () => {
    const data: OralFeedbackData = {
      studentId: 's1',
      dimensions: [
        { dimension: 'strategy', points: 6, comment: '' },
        { dimension: 'reasoning', points: 4, comment: '' },
      ],
      generalObservations: '',
    };
    // Average: (6+4)/2 = 5, *10 = 50
    expect(calculateOralScore(data)).toBe(50);
  });

  it('rounds correctly', () => {
    const data: OralFeedbackData = {
      studentId: 's1',
      dimensions: [
        { dimension: 'strategy', points: 3, comment: '' },
        { dimension: 'reasoning', points: 4, comment: '' },
        { dimension: 'representations', points: 5, comment: '' },
      ],
      generalObservations: '',
    };
    // Average: (3+4+5)/3 = 4, *10 = 40
    expect(calculateOralScore(data)).toBe(40);
  });
});

describe('calculateTotalPoints', () => {
  it('sums all feedback points', () => {
    const feedbacks: TaskFeedback[] = [
      makeFeedback('t1', 3),
      makeFeedback('t2', 5),
      makeFeedback('t3', 2),
    ];
    expect(calculateTotalPoints(feedbacks)).toBe(10);
  });

  it('returns 0 for empty feedbacks', () => {
    expect(calculateTotalPoints([])).toBe(0);
  });
});

describe('calculateMaxPoints', () => {
  it('calculates max for simple tasks', () => {
    const tasks = [makeTask('t1', '1'), makeTask('t2', '2')];
    expect(calculateMaxPoints(tasks)).toBe(12); // 2 * 6
  });

  it('calculates max for tasks with subtasks', () => {
    const tasks = [
      makeTask('t1', '1', [{ id: 's1a', label: 'a' }, { id: 's1b', label: 'b' }]),
    ];
    expect(calculateMaxPoints(tasks)).toBe(12); // 2 subtasks * 6
  });

  it('respects custom points per task', () => {
    const tasks = [makeTask('t1', '1'), makeTask('t2', '2')];
    expect(calculateMaxPoints(tasks, 10)).toBe(20); // 2 * 10
  });

  it('returns 0 for no tasks', () => {
    expect(calculateMaxPoints([])).toBe(0);
  });
});
