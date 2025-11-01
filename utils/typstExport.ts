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
  language?: 'en' | 'nb' | 'nn';
}

// Translation strings for Typst template
const translations = {
  en: {
    feedback: 'Feedback',
    student: 'Student',
    score: 'Score',
    studentNumber: 'Student Number',
    date: 'Date',
    generalFeedback: 'General Feedback',
    taskComments: 'Task Comments',
    task: 'Task',
    points: 'Points',
    comment: 'Comment',
    noTaskComments: 'No task comments.',
    individualFeedback: 'Individual Feedback',
    generatedWith: 'Generated with Math Test Feedback App',
    lang: 'en',
  },
  nb: {
    feedback: 'Tilbakemelding',
    student: 'Student',
    score: 'Poengsum',
    studentNumber: 'Studentnummer',
    date: 'Dato',
    generalFeedback: 'Generell tilbakemelding',
    taskComments: 'Oppgavekommentarer',
    task: 'Oppgave',
    points: 'Poeng',
    comment: 'Kommentar',
    noTaskComments: 'Ingen oppgavekommentarer.',
    individualFeedback: 'Individuell tilbakemelding',
    generatedWith: 'Generert med Math Test Feedback App',
    lang: 'nb',
  },
  nn: {
    feedback: 'Tilbakemelding',
    student: 'Elev',
    score: 'Poengsum',
    studentNumber: 'Elevnummer',
    date: 'Dato',
    generalFeedback: 'Generell tilbakemelding',
    taskComments: 'Oppgåvekommentarar',
    task: 'Oppgåve',
    points: 'Poeng',
    comment: 'Kommentar',
    noTaskComments: 'Ingen oppgåvekommentarar.',
    individualFeedback: 'Individuell tilbakemelding',
    generatedWith: 'Generert med Math Test Feedback App',
    lang: 'nn',
  },
};

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
    language = 'nb',
  } = data;

  // Get translations for selected language
  const t = translations[language];

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

  // Generate task feedback table rows
  const taskRows: string[] = [];

  tasks.forEach(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        const feedback = getFeedback(task.id, subtask.id);
        if (feedback) {
          const taskLabel = `${task.label}${subtask.label}`;
          const points = `${feedback.points}/6`;
          const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
          taskRows.push(`  [${taskLabel}], [${points}], [${comment}],`);
        }
      });
    } else {
      const feedback = getFeedback(task.id, undefined);
      if (feedback) {
        const taskLabel = task.label;
        const points = `${feedback.points}/6`;
        const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
        taskRows.push(`  [${taskLabel}], [${points}], [${comment}],`);
      }
    }
  });

  const taskTable = taskRows.length > 0 ? `
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt,
  align: (center, center, left),
  [*${t.task}*], [*${t.points}*], [*${t.comment}*],
${taskRows.join('\n')}
)` : t.noTaskComments;

  const typstContent = `#set document(title: "${testName} - ${t.feedback}")
#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
)
#set text(
  size: 11pt,
  lang: "${t.lang}",
)
#set par(justify: true)

// Show links with underline
#show link: underline

#align(center)[
  #text(size: 18pt, weight: "bold")[${testName}]

  #text(size: 14pt)[${t.feedback}]
]

#v(1em)

#grid(
  columns: 2,
  gutter: 1em,
  [*${t.student}:* ${studentName}],
  [*${t.score}:* ${totalPoints}/${maxPoints}],
  ${studentNumber ? `[*${t.studentNumber}:* ${studentNumber}],` : ''}
  [*${t.date}:* #datetime.today().display()],
)

#line(length: 100%, stroke: 0.5pt)

#v(1em)

== ${t.generalFeedback}

${escapeTypst(generalComment)}

#v(1em)

== ${t.taskComments}

${taskTable}

#v(1em)

== ${t.individualFeedback}

${escapeTypst(individualComment)}

#v(2em)

#align(center)[
  #text(size: 9pt, fill: gray)[
    ${t.generatedWith}
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

export async function compileAndDownloadPDF(content: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch('/api/compile-typst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        filename,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Compilation error:', error);

      if (error.error?.includes('not installed')) {
        alert('Typst is not installed!\n\nPlease install it:\n• macOS: brew install typst\n• Linux: cargo install --git https://github.com/typst/typst\n\nOr download from: https://github.com/typst/typst/releases');
      } else {
        alert(`Failed to compile PDF: ${error.error}\n\nDetails: ${error.details || ''}`);
      }
      return false;
    }

    // Download the PDF
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.typ$/, '.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to compile PDF. Make sure the development server is running.');
    return false;
  }
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
