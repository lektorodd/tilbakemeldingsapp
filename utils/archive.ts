import { ArchivedFeedback, TaskFeedback, Task, TaskStatistics, StudentProgress } from '@/types';

const ARCHIVE_KEY = 'math-feedback-archive';

export function saveToArchive(feedback: Omit<ArchivedFeedback, 'id' | 'date'>): ArchivedFeedback {
  const archived: ArchivedFeedback = {
    ...feedback,
    id: `archive-${Date.now()}`,
    date: new Date().toISOString(),
  };

  const archive = loadArchive();
  archive.push(archived);

  if (typeof window !== 'undefined') {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }

  return archived;
}

export function loadArchive(): ArchivedFeedback[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(ARCHIVE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

export function deleteArchivedFeedback(id: string): void {
  const archive = loadArchive();
  const filtered = archive.filter(f => f.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(filtered));
  }
}

export function getArchivedFeedbackById(id: string): ArchivedFeedback | null {
  const archive = loadArchive();
  return archive.find(f => f.id === id) || null;
}

export function clearArchive(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ARCHIVE_KEY);
  }
}

// Analytics functions

export function calculateTaskStatistics(archive: ArchivedFeedback[], testName?: string): TaskStatistics[] {
  // Filter by test name if provided
  const feedbacks = testName
    ? archive.filter(f => f.testName === testName)
    : archive;

  if (feedbacks.length === 0) return [];

  // Create a map to collect statistics
  const statsMap = new Map<string, {
    taskLabel: string;
    taskId: string;
    subtaskId?: string;
    points: number[];
    maxPoints: number;
  }>();

  feedbacks.forEach(feedback => {
    feedback.taskFeedbacks.forEach(tf => {
      // Find the task to get the label
      const task = feedback.tasks.find(t => t.id === tf.taskId);
      if (!task) return;

      const subtask = task.subtasks.find(st => st.id === tf.subtaskId);
      const taskLabel = subtask ? `${task.label}${subtask.label}` : task.label;
      const key = tf.subtaskId ? `${tf.taskId}-${tf.subtaskId}` : tf.taskId;

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          taskLabel,
          taskId: tf.taskId,
          subtaskId: tf.subtaskId,
          points: [],
          maxPoints: 6,
        });
      }

      statsMap.get(key)!.points.push(tf.points);
    });
  });

  // Convert to TaskStatistics array
  const statistics: TaskStatistics[] = [];
  statsMap.forEach(data => {
    const totalPoints = data.points.reduce((sum, p) => sum + p, 0);
    const averagePoints = totalPoints / data.points.length;

    // Calculate distribution
    const distribution = new Array(7).fill(0);
    data.points.forEach(p => {
      distribution[p]++;
    });

    statistics.push({
      taskLabel: data.taskLabel,
      taskId: data.taskId,
      subtaskId: data.subtaskId,
      averagePoints,
      maxPoints: data.maxPoints,
      totalSubmissions: data.points.length,
      pointsDistribution: distribution,
    });
  });

  // Sort by task label
  statistics.sort((a, b) => {
    const aNum = parseFloat(a.taskLabel);
    const bNum = parseFloat(b.taskLabel);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.taskLabel.localeCompare(b.taskLabel);
  });

  return statistics;
}

export function getStudentProgress(archive: ArchivedFeedback[], studentName: string): StudentProgress | null {
  const studentFeedbacks = archive
    .filter(f => f.studentName.toLowerCase() === studentName.toLowerCase())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (studentFeedbacks.length === 0) return null;

  const totalScore = studentFeedbacks.reduce((sum, f) => {
    const percentage = f.maxPoints > 0 ? (f.totalPoints / f.maxPoints) * 100 : 0;
    return sum + percentage;
  }, 0);

  return {
    studentName,
    feedbacks: studentFeedbacks,
    averageScore: totalScore / studentFeedbacks.length,
    totalTests: studentFeedbacks.length,
  };
}

export function getAllStudentNames(archive: ArchivedFeedback[]): string[] {
  const names = new Set<string>();
  archive.forEach(f => names.add(f.studentName));
  return Array.from(names).sort();
}

export function getAllTestNames(archive: ArchivedFeedback[]): string[] {
  const names = new Set<string>();
  archive.forEach(f => names.add(f.testName));
  return Array.from(names).sort();
}

export function exportArchiveToJSON(): string {
  const archive = loadArchive();
  return JSON.stringify(archive, null, 2);
}

export function importArchiveFromJSON(jsonString: string): void {
  try {
    const imported = JSON.parse(jsonString);
    if (Array.isArray(imported)) {
      const currentArchive = loadArchive();
      const merged = [...currentArchive, ...imported];

      if (typeof window !== 'undefined') {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(merged));
      }
    }
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
