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
  hasChartImage?: boolean;
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
    student: 'Namn',
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
    student: 'Namn',
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
    student: 'Namn',
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
    student: 'Namn',
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
          const pts = feedback.points ?? 0;
          const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
          taskRows.push(`  [#text(weight: "semibold")[${taskLabel}]], [#text(weight: "semibold", fill: ${pts >= 5 ? 'rgb("#16A34A")' : pts >= 3 ? 'rgb("#334155")' : 'rgb("#DC2626")'})[${pts}]], [${comment}],`);
        }
      });
    } else {
      const feedback = getFeedback(task.id, undefined);
      if (feedback) {
        const taskLabel = escapeTypst(task.label);
        const pts = feedback.points ?? 0;
        const comment = feedback.comment ? escapeTypst(feedback.comment) : '';
        taskRows.push(`  [#text(weight: "semibold")[${taskLabel}]], [#text(weight: "semibold", fill: ${pts >= 5 ? 'rgb("#16A34A")' : pts >= 3 ? 'rgb("#334155")' : 'rgb("#DC2626")'})[${pts}]], [${comment}],`);
      }
    }
  });

  const taskTable = taskRows.length > 0 ? `#block(width: 100%, clip: true, radius: 6pt, stroke: 0.75pt + rgb("#E2E8F0"))[
  #table(
    columns: (3.5em, 3.5em, 1fr),
    inset: (x: 0.9em, y: 0.65em),
    stroke: none,
    column-gutter: 0pt,
    align: (center, center, left),
    fill: (_, row) => if row == 0 { rgb("#1E293B") } else if calc.odd(row) { rgb("#F8FAFC") } else { white },
    table.header(
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[\\#]],
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[${t.points.toUpperCase()}]],
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[${t.comment.toUpperCase()}]],
    ),
    table.hline(stroke: 0.75pt + rgb("#E2E8F0")),
${taskRows.join('\n')}
  )
]` : '';

  // Build content sections conditionally
  const sections: string[] = [];

  if (generalComment.trim()) {
    sections.push(`#block(width: 100%)[\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.generalFeedback}]]\n  #v(0.5em)\n  #text(fill: rgb("#334155"))[${escapeTypst(generalComment)}]\n]`);
  }

  if (taskRows.length > 0) {
    sections.push(`#block(width: 100%)[\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.taskComments}]]\n  #v(0.6em)\n  ${taskTable}\n]`);
  }

  if (individualComment.trim()) {
    sections.push(`#block(width: 100%)[\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.individualFeedback}]]\n  #v(0.5em)\n  #text(fill: rgb("#334155"))[${escapeTypst(individualComment)}]\n]`);
  }

  const contentBody = sections.join('\n\n#v(1.2em)\n\n');

  // Score percentage for color coding
  const scorePct = maxPoints > 0 ? totalPoints / maxPoints : 0;
  const scoreColor = scorePct >= 0.8 ? '#16A34A' : scorePct >= 0.5 ? '#D97706' : '#DC2626';

  const typstContent = `#set document(title: "${escapeTypstString(testName)} - ${t.feedback}")
#set page(
  paper: "a4",
  margin: (x: 1cm, top: 1.5cm, bottom: 1.5cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(size: 8.5pt, fill: rgb("#94A3B8"), tracking: 0.3pt)[${escapeTypst(testName).toUpperCase()} #sym.dash.em ${escapeTypst(studentName).toUpperCase()}]
      #h(1fr)
      #text(size: 8.5pt, fill: rgb("#94A3B8"))[${t.feedback}]
      #v(0.4em)
      #line(length: 100%, stroke: 0.4pt + rgb("#E2E8F0"))
    ]
  },
  footer: context {
    let total = counter(page).final().first()
    if total > 1 {
      align(center, text(size: 8.5pt, fill: rgb("#94A3B8"))[
        #counter(page).display("1 / 1", both: true)
      ])
    }
  },
)
#set text(
  size: 11pt,
  weight: "medium",
  lang: "${t.lang}",
  fill: rgb("#334155"),
  font: "Inter",
)
#set par(justify: true, leading: 0.7em)
#show link: underline

// ─── Header ───
#rect(
  width: 100%,
  fill: rgb("#1E293B"),
  inset: (x: 1.8em, y: 1.2em),
  radius: 6pt,
)[
  #align(center)[
    #text(size: 10pt, fill: rgb("#94A3B8"), weight: "regular", tracking: 1pt)[${t.feedback.toUpperCase()}]
    #v(0.25em)
    #text(size: 18pt, weight: "bold", fill: white, tracking: 0.3pt)[${escapeTypst(testName)}]
  ]
]

#v(0.7em)

// ─── Student info ───
#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #text(size: 10pt, fill: rgb("#64748B"))[${t.student}]
    #v(0.1em)
    #text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${escapeTypst(studentName)}]
    ${studentNumber ? `#v(0.15em)\n    #text(size: 9.5pt, fill: rgb("#94A3B8"))[${t.studentNumber}: ${escapeTypst(studentNumber)}]` : ''}
    #v(0.15em)
    #text(size: 9.5pt, fill: rgb("#94A3B8"))[#datetime.today().display()]
  ],
  [
    #rect(
      fill: rgb("${scoreColor}").lighten(90%),
      inset: (x: 1em, y: 0.6em),
      radius: 8pt,
      stroke: 0.75pt + rgb("${scoreColor}").lighten(60%),
    )[
      #align(center)[
        #text(size: 9pt, fill: rgb("${scoreColor}"), weight: "medium")[${t.score}]
        #v(0.1em)
        #text(size: 22pt, weight: "bold", fill: rgb("${scoreColor}"))[${totalPoints}] #text(size: 12pt, fill: rgb("${scoreColor}").lighten(30%))[#sym.slash ${maxPoints}]
      ]
    ]
  ],
)

#v(0.4em)
#line(length: 100%, stroke: 0.5pt + rgb("#E2E8F0"))
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
    hasChartImage = false,
  } = data;

  const t = oralTranslations[language];

  const getDimensionLabel = (dimension: OralFeedbackDimensionType): string => {
    return t[dimension] || dimension;
  };

  const totalScore = oralFeedback.score || 0;

  // Generate dimension rows for table
  const dimensionRows = oralFeedback.dimensions.map(dim => {
    const label = getDimensionLabel(dim.dimension);
    const pts = dim.points ?? 0;
    const comment = dim.comment ? escapeTypst(dim.comment) : '';
    return `  [${label}], [#text(weight: "semibold", fill: ${pts >= 5 ? 'rgb("#16A34A")' : pts >= 3 ? 'rgb("#334155")' : 'rgb("#DC2626")'})[${pts}]], [${comment}],`;
  }).join('\n');

  const dimensionTable = `#block(width: 100%, clip: true, radius: 6pt, stroke: 0.75pt + rgb("#E2E8F0"))[
  #table(
    columns: (2fr, 3.5em, 3fr),
    inset: (x: 0.9em, y: 0.65em),
    stroke: none,
    column-gutter: 0pt,
    align: (left, center, left),
    fill: (_, row) => if row == 0 { rgb("#1E293B") } else if calc.odd(row) { rgb("#F8FAFC") } else { white },
    table.header(
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[${t.dimension.toUpperCase()}]],
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[${t.points.toUpperCase()}]],
      [#text(fill: white, weight: "bold", size: 9pt, tracking: 0.5pt)[${t.comment.toUpperCase()}]],
    ),
    table.hline(stroke: 0.75pt + rgb("#E2E8F0")),
${dimensionRows}
  )
]`;

  // Build content sections conditionally
  const sections: string[] = [];

  if (oralFeedback.dimensions.length > 0) {
    const radarChartBlock = hasChartImage
      ? `\n  #v(0.6em)\n  #grid(\n    columns: (1fr, auto),\n    gutter: 1.5em,\n    [${dimensionTable}],\n    [\n      #align(center + horizon)[\n        #image("radar-chart.png", width: 180pt)\n      ]\n    ]\n  )`
      : `\n  #v(0.6em)\n  ${dimensionTable}`;
    sections.push(`#block(width: 100%)[\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.dimensions}]]${radarChartBlock}\n]`);
  }

  if (oralFeedback.generalObservations?.trim()) {
    sections.push(`#block(width: 100%)[\\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.generalObservations}]]\\n  #v(0.5em)\\n  #text(fill: rgb("#334155"))[${escapeTypst(oralFeedback.generalObservations)}]\\n]`);
  }

  if (oralFeedback.taskReferences && oralFeedback.taskReferences.length > 0) {
    sections.push(`#block(width: 100%)[\\n  #block(inset: (left: 0.6em), stroke: (left: 2.5pt + rgb("#0D9488")))[#text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${t.taskReferences}]]\\n  #v(0.5em)\\n  #text(fill: rgb("#334155"))[${escapeTypst(oralFeedback.taskReferences.join(', '))}]\\n]`);
  }

  const contentBody = sections.join('\n\n#v(1.2em)\n\n');

  // Score color
  const maxOralScore = oralFeedback.dimensions.length * 6;
  const scorePct = maxOralScore > 0 ? totalScore / maxOralScore : 0;
  const scoreColor = scorePct >= 0.8 ? '#16A34A' : scorePct >= 0.5 ? '#D97706' : '#DC2626';

  const typstContent = `#set document(title: "${escapeTypstString(oralTestName)} - ${t.oralAssessment}")
#set page(
  paper: "a4",
  margin: (x: 1cm, top: 1.5cm, bottom: 1.5cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(size: 8.5pt, fill: rgb("#94A3B8"), tracking: 0.3pt)[${escapeTypst(oralTestName).toUpperCase()} #sym.dash.em ${escapeTypst(studentName).toUpperCase()}]
      #h(1fr)
      #text(size: 8.5pt, fill: rgb("#94A3B8"))[${t.oralAssessment}]
      #v(0.4em)
      #line(length: 100%, stroke: 0.4pt + rgb("#E2E8F0"))
    ]
  },
  footer: context {
    let total = counter(page).final().first()
    if total > 1 {
      align(center, text(size: 8.5pt, fill: rgb("#94A3B8"))[
        #counter(page).display("1 / 1", both: true)
      ])
    }
  },
)
#set text(
  size: 11pt,
  weight: "medium",
  lang: "${t.lang}",
  fill: rgb("#334155"),
  font: "Inter",
)
#set par(justify: true, leading: 0.7em)
#show link: underline

// ─── Header ───
#rect(
  width: 100%,
  fill: rgb("#1E293B"),
  inset: (x: 1.8em, y: 1.2em),
  radius: 6pt,
)[
  #align(center)[
    #text(size: 10pt, fill: rgb("#94A3B8"), weight: "regular", tracking: 1pt)[${t.oralAssessment.toUpperCase()}]
    #v(0.25em)
    #text(size: 18pt, weight: "bold", fill: white, tracking: 0.3pt)[${escapeTypst(oralTestName)}]
  ]
]

#v(0.7em)

// ─── Student info ───
#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #text(size: 10pt, fill: rgb("#64748B"))[${t.student}]
    #v(0.1em)
    #text(size: 13pt, weight: "bold", fill: rgb("#1E293B"))[${escapeTypst(studentName)}]
    ${studentNumber ? `#v(0.15em)\n    #text(size: 9.5pt, fill: rgb("#94A3B8"))[${t.studentNumber}: ${escapeTypst(studentNumber)}]` : ''}
    #v(0.15em)
    #text(size: 9.5pt, fill: rgb("#94A3B8"))[${oralTestDate || '#datetime.today().display()'}]
  ],
  [
    #rect(
      fill: rgb("${scoreColor}").lighten(90%),
      inset: (x: 1em, y: 0.6em),
      radius: 8pt,
      stroke: 0.75pt + rgb("${scoreColor}").lighten(60%),
    )[
      #align(center)[
        #text(size: 9pt, fill: rgb("${scoreColor}"), weight: "medium")[${t.score}]
        #v(0.1em)
        #text(size: 22pt, weight: "bold", fill: rgb("${scoreColor}"))[${totalScore}] #text(size: 12pt, fill: rgb("${scoreColor}").lighten(30%))[#sym.slash ${maxOralScore}]
      ]
    ]
  ],
)

#v(0.4em)
#line(length: 100%, stroke: 0.5pt + rgb("#E2E8F0"))
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

export async function compileAndDownloadPDF(content: string, filename: string, chartImage?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/compile-typst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        filename,
        chartImage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Compilation error:', error);

      if (error.error?.includes('not installed')) {
        alert('Typst is not installed!\n\nPlease install it:\n• macOS: brew install typst\n• Linux: cargo install --git https://github.com/typst/typst\n\nOr download from: https://github.com/typst/typst/releases');
      } else {
        alert(`Failed to compile PDF: ${error.error} \n\nDetails: ${error.details || ''} `);
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

export async function compileAndGetPDFBlob(content: string, filename: string, chartImage?: string): Promise<Blob | null> {
  try {
    const response = await fetch('/api/compile-typst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        filename,
        chartImage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Compilation error:', error);

      if (error.error?.includes('not installed')) {
        alert('Typst is not installed!\n\nPlease install it:\n• macOS: brew install typst\n• Linux: cargo install --git https://github.com/typst/typst\n\nOr download from: https://github.com/typst/typst/releases');
      } else {
        alert(`Failed to compile PDF: ${error.error} \n\nDetails: ${error.details || ''} `);
      }
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to compile PDF. Make sure the development server is running.');
    return null;
  }
}

export function calculateTotalPoints(feedbacks: TaskFeedback[]): number {
  return feedbacks.reduce((sum, f) => sum + (f.points ?? 0), 0);
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
