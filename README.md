# MathMonitor / MatteMonitor

**Modern web app for math test feedback with PDF export**

A teacher-focused application for managing courses, grading tests, and providing detailed feedback with mathematical notation. Features course-centric organization, flexible scoring, Typst PDF export, and comprehensive analytics.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Key Features

- **Course Management** - Organize by class, add students once, track across multiple tests
- **Flexible Grading** - 0-6 points per task, automatic 0-60 scoring
- **Math Notation** - Full Typst support for mathematical expressions
- **Snippet Library** - Reusable comment templates (Norwegian standards included)
- **PDF Export** - Auto-compile professional feedback documents
- **Analytics** - Track student progress by labels, categories, and performance
- **Multi-Language** - Full support for English, Norwegian Bokmål, and Nynorsk
- **Auto-Save** - Automatic file export to chosen folder (Chrome/Edge)

## Basic Workflow

1. **Create Course** → Add students to roster
2. **Create Test** → Configure tasks and subtasks
3. **Grade Students** → Add points and comments with math notation
4. **Use Snippets** → Quick insert standard feedback
5. **Export PDFs** → Generate and distribute feedback
6. **View Analytics** → Track progress and identify patterns

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Typst** - Mathematical document generation
- **localStorage + File System API** - Data persistence

## Requirements

- Node.js 18+
- Modern browser (Chrome/Edge recommended for auto-save)
- Typst CLI (for PDF compilation)

### Install Typst

```bash
# macOS
brew install typst

# Linux
cargo install --git https://github.com/typst/typst

# Or download from https://github.com/typst/typst/releases
```

## Data Storage

- **Browser**: localStorage (survives restarts, private to your computer)
- **Files**: Auto-save to folder of your choice (JSON format, easy backup)
- **Export**: Manual backup via "Export All" button

## Help & Documentation

Access the in-app help guide from the navbar (? icon) for:
- Complete workflow tutorials
- Typst math notation examples
- Grading system explanation
- Analytics guide
- Keyboard shortcuts
- Troubleshooting tips

## Project Structure

```
app/
  ├── courses/          # Course list
  ├── course/[id]/      # Course detail, students, tests
  ├── test/[id]/        # Grading interface
  └── help/             # In-app help guide
components/            # Reusable UI components
utils/                 # Storage, export, calculations
types/                 # TypeScript definitions
locales/              # EN/NB/NN translations
```

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Core app | ✅ | ✅ | ✅ |
| Auto-save | ✅ | ❌ | ❌ |
| PDF compile | ✅ | ✅ | ✅ |

## License

MIT License

---

**Made for teachers, by teachers** 📚✏️
