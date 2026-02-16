# MatteMonitor v0.2.0

A web app for math teachers to grade tests, write feedback with mathematical notation, and export professional PDF reports. Built around a course-based workflow where students are added once and tracked across multiple assessments.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3333
```

For PDF export, you also need [Typst](https://github.com/typst/typst/releases) installed:

```bash
# macOS
brew install typst

# Linux
cargo install --git https://github.com/typst/typst

# Windows / other — download from https://github.com/typst/typst/releases
```

## Features

**Grading & Feedback**
- Score tasks 0–6 points with automatic total (0–60 scale)
- Write comments with Typst math notation (`$x^2 + y^2 = r^2$`)
- Reusable snippet library for common feedback phrases
- Keyboard-driven grading — number keys for points, Tab to move between tasks

**Course & Test Management**
- Organize students into courses, create multiple tests per course
- Configure tasks with subtasks, topic labels, and difficulty categories
- Two-part test support (no aids / all aids)

**Oral Assessments**
- Grade across six LK20 curriculum dimensions (strategy, reasoning, representations, modeling, communication, subject knowledge)
- Track duration and link to specific topics

**Analytics**
- Student progress over time
- Performance breakdown by topic label, difficulty category, and test part
- Task-level statistics: attempt rates, score distributions, averages
- Course-wide and test-specific views

**PDF Export**
- Generate professional feedback documents via Typst
- Full math rendering in exported PDFs
- Supports English, Norwegian Bokmål, and Nynorsk

**Data & Backup**
- All data stored in the browser (localStorage) — nothing leaves your machine
- Optional folder sync via File System API (Chrome/Edge) for auto-saving to disk
- Manual JSON export/import for backup and transfer between machines
- Auto-backup every 5 minutes (up to 10 rolling backups)

## Workflow

1. **Create a course** — add students (individually or bulk paste)
2. **Set up a test** — define tasks, subtasks, labels, and categories
3. **Grade** — enter points and feedback per student per task
4. **Export** — generate PDFs and distribute to students
5. **Review** — use analytics to spot patterns and track progress

## Project Structure

```
app/
  courses/                 Course list (home page)
  course/[courseId]/        Course detail, student roster, test list
    test/[testId]/          Grading interface
      analytics/            Test-level analytics
    oral/[oralTestId]/      Oral assessment interface
    student/[studentId]/    Individual student progress
    analytics/              Course-level analytics
  analytics/               Global analytics
  archive/                 Archived feedback
  help/                    In-app help guide
  api/compile-typst/       PDF compilation endpoint

components/                UI components (modals, forms, charts, sidebars)
utils/                     Storage, scoring, export, folder sync
types/                     TypeScript type definitions
contexts/                  React contexts (language, notifications)
hooks/                     Custom hooks (keyboard shortcuts)
locales/                   Translations (en, nb, nn)
fonts/                     Bundled fonts for PDF export
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| PDF engine | Typst (external CLI) |
| Storage | localStorage + File System API + IndexedDB |
| Testing | Vitest + Testing Library |
| Icons | Lucide React |

## Development

```bash
npm run dev          # Start dev server (http://localhost:3333)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

### Requirements

- Node.js 18+
- Typst CLI (for PDF compilation only)
- Chrome or Edge recommended (required for folder auto-save)

### Browser Support

| Feature | Chrome/Edge | Firefox | Safari |
|---------|:-----------:|:-------:|:------:|
| Core app | Yes | Yes | Yes |
| Folder auto-save | Yes | No | No |
| PDF export | Yes | Yes | Yes |

## Keyboard Shortcuts (Grading)

| Key | Action |
|-----|--------|
| `0`–`6` | Set points for current task |
| `Tab` / `Shift+Tab` | Next / previous task |
| `Alt + Arrow` | Next / previous student |
| `Enter` | Focus comment field |
| `Escape` | Back to points mode |
| `Alt + Enter` | Toggle student completion |

## Data Storage

All data stays in the browser by default. No server, no account, no cloud.

- **localStorage** — primary storage, persists across sessions
- **Folder sync** — optionally connect a local folder (Chrome/Edge) to auto-save JSON files; works well with OneDrive or similar sync services
- **Export/Import** — download all data as JSON, or import from another machine

## Multi-Language Support

The app is fully translated in three languages, selectable from the navbar:

- English
- Norwegian Bokmål
- Norwegian Nynorsk

## License

MIT

See [CHANGELOG.md](CHANGELOG.md) for release history.
