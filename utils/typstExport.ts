import { Task, TaskFeedback, OralFeedbackData, OralFeedbackDimensionType } from '@/types';

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

interface OralExportData {
  studentName: string;
  studentNumber?: string;
  oralTestName: string;
  oralTestDate: string;
  oralFeedback: OralFeedbackData;
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
    individualFeedback: 'Individual Feedback',
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
    individualFeedback: 'Individuell tilbakemelding',
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
    individualFeedback: 'Individuell tilbakemelding',
    lang: 'nn',
  },
};

// Translations for oral assessments
const oralTranslations = {
  en: {
    oralAssessment: 'Oral Assessment',
    student: 'Student',
    score: 'Score',
    studentNumber: 'Student Number',
    date: 'Date',
    assessmentDate: 'Assessment Date',
    dimensions: 'Assessment Dimensions (LK20)',
    dimension: 'Dimension',
    points: 'Points',
    comment: 'Comment',
    generalObservations: 'General Observations',
    taskReferences: 'Task References',
    lang: 'en',
    strategy: 'Strategy and Method',
    reasoning: 'Reasoning and Argumentation',
    representations: 'Representations',
    modeling: 'Modeling/Application',
    communication: 'Communication',
    subject_knowledge: 'Subject Knowledge',
  },
  nb: {
    oralAssessment: 'Muntlig vurdering',
    student: 'Student',
    score: 'Poengsum',
    studentNumber: 'Studentnummer',
    date: 'Dato',
    assessmentDate: 'Vurderingsdato',
    dimensions: 'Vurderingsdimensjoner (LK20)',
    dimension: 'Dimensjon',
    points: 'Poeng',
    comment: 'Kommentar',
    generalObservations: 'Generelle observasjoner',
    taskReferences: 'Oppgavereferanser',
    lang: 'nb',
    strategy: 'Strategivalg og metode',
    reasoning: 'Resonnering og argumentasjon',
    representations: 'Representasjoner',
    modeling: 'Modellering/anvendelse',
    communication: 'Kommunikasjon',
    subject_knowledge: 'Faglig forståelse',
  },
  nn: {
    oralAssessment: 'Munnleg vurdering',
    student: 'Elev',
    score: 'Poengsum',
    studentNumber: 'Elevnummer',
    date: 'Dato',
    assessmentDate: 'Vurderingsdato',
    dimensions: 'Vurderingsdimensjonar (LK20)',
    dimension: 'Dimensjon',
    points: 'Poeng',
    comment: 'Kommentar',
    generalObservations: 'Generelle observasjonar',
    taskReferences: 'Oppgåvereferansar',
    lang: 'nn',
    strategy: 'Strategival og metode',
    reasoning: 'Resonnering og argumentasjon',
    representations: 'Representasjonar',
    modeling: 'Modellering/anvending',
    communication: 'Kommunikasjon',
    subject_knowledge: 'Fagleg forståing',
  },
};

// Escape special Typst characters in content, preserving $...$ math expressions
function escapeTypst(text: string): string {
  if (!text) return '';
  const parts = text.split('$');
  return parts.map((part, i) => {
    if (i % 2 === 0) {
      // Outside math — escape Typst content-mode special characters
      return part
        .replace(/\\/g, '\\\\')
        .replace(/#/g, '\\#')
        .replace(/\*/g, '\\*')
        .replace(/_/g, '\\_')
        .replace(/@/g, '\\@')
        .replace(/</g, '\\<')
        .replace(/>/g, '\\>');
    }
    // Inside math — preserve as-is with delimiters
    return '$' + part + '$';
  }).join('');
}

// Escape text for use inside Typst "..." strings (e.g. document title)
function escapeTypstString(text: string): string {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
    language = 'nb',
  } = data;

  const t = translations[language];

  const getFeedback = (taskId: string, subtaskId?: string): TaskFeedback | undefined => {
    return feedbacks.find(f => f.taskId === taskId && f.subtaskId === subtaskId);
  };

  // Generate task feedback table rows
  const taskRows: string[] = [];

  tasks.forEach(task => {
    if (task.hasSubtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        const feedback = getFeedback(task.id, subtask.id);
        if (feedback) {
          const taskLabel = escapeTypst(`${task.label}${subtask.label}`);
          const points = `${feedback.points}/6`;
          const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
          taskRows.push(`  [${taskLabel}], [${points}], [${comment}],`);
        }
      });
    } else {
      const feedback = getFeedback(task.id, undefined);
      if (feedback) {
        const taskLabel = escapeTypst(task.label);
        const points = `${feedback.points}/6`;
        const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
        taskRows.push(`  [${taskLabel}], [${points}], [${comment}],`);
      }
    }
  });

  const taskTable = taskRows.length > 0 ? `#table(
  columns: (auto, auto, 1fr),
  inset: (x: 0.8em, y: 0.55em),
  stroke: 0.5pt + rgb("#E2E8F0"),
  align: (center, center, left),
  fill: (_, row) => if row == 0 { rgb("#2563EB") } else if calc.even(row) { rgb("#F8FAFC") } else { white },
  table.header(
    [#text(fill: white, weight: "bold")[${t.task}]],
    [#text(fill: white, weight: "bold")[${t.points}]],
    [#text(fill: white, weight: "bold")[${t.comment}]],
  ),
${taskRows.join('\n')}
)` : '';

  // Build content sections conditionally
  const sections: string[] = [];

  if (generalComment.trim()) {
    sections.push(`== ${t.generalFeedback}\n\n${escapeTypst(generalComment)}`);
  }

  if (taskRows.length > 0) {
    sections.push(`== ${t.taskComments}\n\n${taskTable}`);
  }

  if (individualComment.trim()) {
    sections.push(`== ${t.individualFeedback}\n\n${escapeTypst(individualComment)}`);
  }

  const contentBody = sections.join('\n\n#v(1em)\n\n');

  const typstContent = `#set document(title: "${escapeTypstString(testName)} - ${t.feedback}")
#set page(
  paper: "a4",
  margin: (x: 2cm, top: 1.8cm, bottom: 2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(size: 9pt, fill: rgb("#6B7280"))[${escapeTypst(testName)} #sym.dash.em ${escapeTypst(studentName)}]
      #h(1fr)
      #text(size: 9pt, fill: rgb("#6B7280"))[${t.feedback}]
      #v(0.3em)
      #line(length: 100%, stroke: 0.3pt + rgb("#D1D5DB"))
    ]
  },
  footer: context {
    let total = counter(page).final().first()
    if total > 1 {
      align(center, text(size: 9pt, fill: rgb("#9CA3AF"))[
        #counter(page).display("1 / 1", both: true)
      ])
    }
  },
)
#set text(
  size: 11pt,
  lang: "${t.lang}",
  font: "Libertinus Sans",
)
#set par(justify: true)
#show heading: set text(fill: rgb("#1E40AF"))
#show link: underline

#rect(
  width: 100%,
  fill: rgb("#2563EB"),
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
)[
  #align(center)[
    #text(size: 16pt, weight: "bold", fill: white)[${escapeTypst(testName)}]
    #v(0.2em)
    #text(size: 12pt, fill: white)[${t.feedback}]
  ]
]

#v(0.8em)

#rect(
  width: 100%,
  fill: rgb("#F8FAFC"),
  inset: (x: 1.2em, y: 0.8em),
  radius: 4pt,
  stroke: 0.5pt + rgb("#E2E8F0"),
)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 0.6em,
    [*${t.student}:* ${escapeTypst(studentName)}],
    [*${t.score}:* ${totalPoints}/${maxPoints}],
    [*${t.date}:* #datetime.today().display()],
    ${studentNumber ? `[*${t.studentNumber}:* ${escapeTypst(studentNumber)}],` : ''}
  )
]

#v(0.8em)

${contentBody}
`;

  return typstContent;
}

export function generateOralTypstDocument(data: OralExportData): string {
  const {
    studentName,
    studentNumber,
    oralTestName,
    oralTestDate,
    oralFeedback,
    language = 'nb',
  } = data;

  const t = oralTranslations[language];

  const getDimensionLabel = (dimension: OralFeedbackDimensionType): string => {
    return t[dimension] || dimension;
  };

  const totalScore = oralFeedback.score || 0;

  // Generate dimension rows for table
  const dimensionRows = oralFeedback.dimensions.map(dim => {
    const label = getDimensionLabel(dim.dimension);
    const points = `${dim.points}/6`;
    const comment = dim.comment ? escapeTypst(dim.comment) : '';
    return `  [${label}], [${points}], [${comment}],`;
  }).join('\n');

  const dimensionTable = `#table(
  columns: (2fr, auto, 3fr),
  inset: (x: 0.8em, y: 0.55em),
  stroke: 0.5pt + rgb("#E2E8F0"),
  align: (left, center, left),
  fill: (_, row) => if row == 0 { rgb("#2563EB") } else if calc.even(row) { rgb("#F8FAFC") } else { white },
  table.header(
    [#text(fill: white, weight: "bold")[${t.dimension}]],
    [#text(fill: white, weight: "bold")[${t.points}]],
    [#text(fill: white, weight: "bold")[${t.comment}]],
  ),
${dimensionRows}
)`;

  // Build content sections conditionally
  const sections: string[] = [];

  if (oralFeedback.dimensions.length > 0) {
    sections.push(`== ${t.dimensions}\n\n${dimensionTable}`);
  }

  if (oralFeedback.generalObservations?.trim()) {
    sections.push(`== ${t.generalObservations}\n\n${escapeTypst(oralFeedback.generalObservations)}`);
  }

  if (oralFeedback.taskReferences && oralFeedback.taskReferences.length > 0) {
    sections.push(`== ${t.taskReferences}\n\n${escapeTypst(oralFeedback.taskReferences.join(', '))}`);
  }

  const contentBody = sections.join('\n\n#v(1em)\n\n');

  const typstContent = `#set document(title: "${escapeTypstString(oralTestName)} - ${t.oralAssessment}")
#set page(
  paper: "a4",
  margin: (x: 2cm, top: 1.8cm, bottom: 2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(size: 9pt, fill: rgb("#6B7280"))[${escapeTypst(oralTestName)} #sym.dash.em ${escapeTypst(studentName)}]
      #h(1fr)
      #text(size: 9pt, fill: rgb("#6B7280"))[${t.oralAssessment}]
      #v(0.3em)
      #line(length: 100%, stroke: 0.3pt + rgb("#D1D5DB"))
    ]
  },
  footer: context {
    let total = counter(page).final().first()
    if total > 1 {
      align(center, text(size: 9pt, fill: rgb("#9CA3AF"))[
        #counter(page).display("1 / 1", both: true)
      ])
    }
  },
)
#set text(
  size: 11pt,
  lang: "${t.lang}",
  font: "Libertinus Sans",
)
#set par(justify: true)
#show heading: set text(fill: rgb("#1E40AF"))
#show link: underline

#rect(
  width: 100%,
  fill: rgb("#2563EB"),
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
)[
  #align(center)[
    #text(size: 16pt, weight: "bold", fill: white)[${escapeTypst(oralTestName)}]
    #v(0.2em)
    #text(size: 12pt, fill: white)[${t.oralAssessment}]
  ]
]

#v(0.8em)

#rect(
  width: 100%,
  fill: rgb("#F8FAFC"),
  inset: (x: 1.2em, y: 0.8em),
  radius: 4pt,
  stroke: 0.5pt + rgb("#E2E8F0"),
)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 0.6em,
    [*${t.student}:* ${escapeTypst(studentName)}],
    [*${t.score}:* ${totalScore}/60],
    [*${t.date}:* #datetime.today().display()],
    ${studentNumber ? `[*${t.studentNumber}:* ${escapeTypst(studentNumber)}],` : ''}
  )
]

#v(0.8em)

${contentBody}
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
