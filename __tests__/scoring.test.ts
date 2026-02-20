import { describe, it, expect } from 'vitest';
import { calculateStudentScore, calculateMaxScore, calculateOralScore } from '@/utils/storage';
import { calculateTotalPoints, calculateMaxPoints } from '@/utils/typstExport';
import { Task, TaskFeedback, OralFeedbackData } from '@/types';

// Test helpers
function makeTask(id: string, label: string, subtasks: { id: string; label: string }[] = [], weight?: number): Task {
  return {
    id,
    label,
    subtasks: subtasks.map(s => ({ ...s, labels: [] })),
    hasSubtasks: subtasks.length > 0,
    labels: [],
    weight,
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
    // With auto-weighting: Task 1 (no subtasks) weight=1, Task 2 (2 subtasks) weight=2
    // Task 1 avg = 6, Task 2 avg = (4+2)/2 = 3
    // Weighted avg: (6*1 + 3*2) / (1+2) = 12/3 = 4, *10 = 40
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

  // --- Weighted scoring tests ---

  it('weighs simple tasks correctly', () => {
    const tasks = [makeTask('t1', '1', [], 2), makeTask('t2', '2', [], 4)];
    const feedbacks = [makeFeedback('t1', 6), makeFeedback('t2', 3)];
    // Weighted avg: (6*2 + 3*4) / (2+4) = (12+12)/6 = 4, *10 = 40
    expect(calculateStudentScore(tasks, feedbacks)).toBe(40);
  });

  it('weighs tasks with subtasks correctly', () => {
    // Task 1 (weight 3) with 2 subtasks, Task 2 (weight 1) standalone
    const tasks = [
      makeTask('t1', '1', [{ id: 's1a', label: 'a' }, { id: 's1b', label: 'b' }], 3),
      makeTask('t2', '2', [], 1),
    ];
    const feedbacks = [
      makeFeedback('t1', 4, 's1a'),
      makeFeedback('t1', 6, 's1b'),
      makeFeedback('t2', 2),
    ];
    // Task 1 has explicit weight=3 with 2 subtasks, Task 2 has explicit weight=1 standalone
    // Explicit weights override auto-weighting
    // Task 1 avg: (4+6)/2 = 5, weighted: 5*3 = 15
    // Task 2 avg: 2, weighted: 2*1 = 2
    // Total: (15+2) / (3+1) = 17/4 = 4.25, *10 = 43 (rounded)
    expect(calculateStudentScore(tasks, feedbacks)).toBe(43);
  });

  it('auto-weights tasks by subtask count when no explicit weight', () => {
    // Task 1 has no subtasks (auto-weight=1)
    // Task 2 has 3 subtasks (auto-weight=3)
    const tasks = [
      makeTask('t1', '1'),
      makeTask('t2', '2', [{ id: 's2a', label: 'a' }, { id: 's2b', label: 'b' }, { id: 's2c', label: 'c' }]),
    ];
    const feedbacks = [
      makeFeedback('t1', 6),
      makeFeedback('t2', 6, 's2a'),
      makeFeedback('t2', 3, 's2b'),
      makeFeedback('t2', 0, 's2c'),
    ];
    // Task 1: 6 (weight 1)
    // Task 2: avg (6+3+0)/3 = 3 (weight 3)
    // Weighted avg: (6*1 + 3*3) / (1+3) = 15/4 = 3.75, *10 = 38 (rounded)
    expect(calculateStudentScore(tasks, feedbacks)).toBe(38);
  });

  it('handles mixed weighted/unweighted tasks', () => {
    // Task 1 has weight 3, Task 2 has no weight (default=1)
    const tasks = [makeTask('t1', '1', [], 3), makeTask('t2', '2')];
    const feedbacks = [makeFeedback('t1', 6), makeFeedback('t2', 2)];
    // Weighted avg: (6*3 + 2*1) / (3+1) = (18+2)/4 = 5, *10 = 50
    expect(calculateStudentScore(tasks, feedbacks)).toBe(50);
  });

  it('single weighted task equals its raw score * 10', () => {
    const tasks = [makeTask('t1', '1', [], 5)];
    const feedbacks = [makeFeedback('t1', 4)];
    // 4*5 / 5 = 4, *10 = 40
    expect(calculateStudentScore(tasks, feedbacks)).toBe(40);
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

  it('uses weighted average when weights are set', () => {
    const data: OralFeedbackData = {
      studentId: 's1',
      dimensions: [
        { dimension: 'strategy', points: 6, comment: '', weight: 2 },
        { dimension: 'reasoning', points: 3, comment: '', weight: 1 },
      ],
      generalObservations: '',
    };
    // Weighted avg: (6*2 + 3*1) / (2+1) = 15/3 = 5, *10 = 50
    expect(calculateOralScore(data)).toBe(50);
  });

  it('defaults missing weights to 1', () => {
    const data: OralFeedbackData = {
      studentId: 's1',
      dimensions: [
        { dimension: 'strategy', points: 6, comment: '', weight: 3 },
        { dimension: 'reasoning', points: 0, comment: '' }, // no weight = 1
      ],
      generalObservations: '',
    };
    // Weighted avg: (6*3 + 0*1) / (3+1) = 18/4 = 4.5, *10 = 45 (rounded)
    expect(calculateOralScore(data)).toBe(45);
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
