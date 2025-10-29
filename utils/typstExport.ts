import { Task, TaskFeedback } from '@/types';

interface ExportData {
  studentName: string;
  studentNumber?: string;
  testName: string;
  tasks: Task[];
  feedbacks: TaskFeedback[];
  generalComment: string;
  individualComment: string;
  totalPoints: number;
  maxPoints: number;
}

export function generateTypstDocument(data: ExportData): string {
  const {
    studentName,
    studentNumber,
    testName,
    tasks,
    feedbacks,
    generalComment,
    individualComment,
    totalPoints,
    maxPoints,
  } = data;

  // Helper function to get feedback for a task/subtask
  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback | undefined => {
    return feedbacks.find(f => f.taskId === taskId && f.subtaskId === subtaskId);
  };

  // Helper function to escape special Typst characters
  const escapeTypst = (text: string): string => {
    // Don't escape math expressions (content between $ symbols)
    // This is a simple approach - in production you might need more sophisticated parsing
    return text;
  };

  // Generate task feedback sections
  const taskSections = tasks.map(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      const subtaskContent = task.subtasks.map(subtask => {
        const feedback = getFeedback(task.id, subtask.id);
        if (!feedback) return '';

        return `
=== Oppgave ${task.label}${subtask.label}

*Poeng:* ${feedback.points}/6

${feedback.comment ? `*Kommentar:* ${escapeTypst(feedback.comment)}` : ''}
`;
      }).join('\n');

      return subtaskContent;
    } else {
      const feedback = getFeedback(task.id, undefined);
      if (!feedback) return '';

      return `
=== Oppgave ${task.label}

*Poeng:* ${feedback.points}/6

${feedback.comment ? `*Kommentar:* ${escapeTypst(feedback.comment)}` : ''}
`;
    }
  }).join('\n');

  const typstContent = `#set document(title: "${testName} - Tilbakemelding")
#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
)
#set text(
  font: "Linux Libertine",
  size: 11pt,
  lang: "nb",
)
#set par(justify: true)

#align(center)[
  #text(size: 18pt, weight: "bold")[${testName}]

  #text(size: 14pt)[Tilbakemelding]
]

#v(1em)

#grid(
  columns: 2,
  gutter: 1em,
  [*Student:* ${studentName}],
  [*Total:* ${totalPoints}/${maxPoints} poeng],
  ${studentNumber ? `[*Studentnummer:* ${studentNumber}],` : ''}
  [*Dato:* #datetime.today().display()],
)

#line(length: 100%, stroke: 0.5pt)

#v(1em)

== Generell tilbakemelding

${escapeTypst(generalComment)}

#v(1em)

== Oppgavekommentarer

${taskSections}

#v(1em)

== Individuell tilbakemelding

${escapeTypst(individualComment)}

#v(2em)

#align(center)[
  #text(size: 9pt, fill: gray)[
    Generert med Math Test Feedback App
  ]
]
`;

  return typstContent;
}

export function downloadTypstFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function calculateTotalPoints(feedbacks: TaskFeedback[]): number {
  return feedbacks.reduce((sum, f) => sum + f.points, 0);
}

export function calculateMaxPoints(tasks: Task[], pointsPerTask: number = 6): number {
  let total = 0;
  tasks.forEach(task => {
    if (task.hasSubtasks) {
      total += task.subtasks.length * pointsPerTask;
    } else {
      total += pointsPerTask;
    }
  });
  return total;
}
