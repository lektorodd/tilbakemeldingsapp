# Math Test Feedback App

A comprehensive web application for managing math tests, providing detailed student feedback, and tracking progress over time. Features flexible task configuration, Typst math notation support, and automatic file export.

## Core Concept

The app is organized around **Tests** rather than individual feedback:
1. **Create a Test** (e.g., "October Test - Logarithms")
2. **Configure Tasks** (e.g., 1, 2a, 2b, 3, 4a, 4b, 4c)
3. **Add Students** to the test
4. **Provide Feedback** for each student
5. **Auto-Save** completed feedback to local files

## Features

### Test Management
- **Create Tests**: Organize feedback by test (e.g., "October Test - Logarithms", "Chapter 3-5 Exam")
- **Test Configuration**: Each test has its own task structure and general comment
- **Student Management**: Add students to tests and track their completion status
- **Persistent Storage**: All data saved locally in browser
- **Export/Import**: Backup tests as JSON files

### Scoring System (NEW!)
- **0-60 Scale**: Scores are calculated as **(average points per task) × 10**
- **Example**: 3 tasks, scores of 4, 5, and 6 = average of 5 → **50/60**
- **Integer Results**: Always produces clean integer scores
- **Easy to Interpret**: 50/60 = 83% = good performance

### Feedback Features
- **Flexible Task Configuration**: Tasks with or without subtasks (1, 2a, 2b, 3, etc.)
- **Point System**: 0-6 points per task/subtask
- **Typst Math Notation**: Write mathematical expressions in comments
- **General Comments**: Same for all students in a test
- **Individual Comments**: Personalized feedback per student
- **PDF Export**: Generate professional Typst documents

### Auto-Save to Files
- **Automatic Export**: Completed feedback automatically saved to your chosen folder
- **Organized Structure**: Each test gets its own folder
- **JSON Format**: Easy to backup, share, and process
- **Browser Support**: Works in Chrome and Edge (uses File System Access API)

### Analytics (From Old Archive)
- **Task Difficulty Analysis**: Identify which tasks students struggle with
- **Student Progress Tracking**: Monitor improvement over time
- **Statistical Insights**: View averages, distributions, and trends

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome or Edge recommended for auto-save)
- Typst CLI (for compiling PDFs from exported files)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Installing Typst

To compile Typst files to PDF:

```bash
# macOS (Homebrew)
brew install typst

# Linux (cargo)
cargo install --git https://github.com/typst/typst

# Or download from https://github.com/typst/typst/releases
```

## Usage Guide

### 1. Setup Auto-Save (Recommended)

1. On the main page, click "Setup Auto-Save Folder"
2. Select a folder on your computer (e.g., `Documents/MathFeedback/`)
3. Grant permissions when prompted
4. All completed feedback will now auto-save there

**Folder Structure:**
```
MathFeedback/
├── october_test_logarithms/
│   ├── test-config.json
│   ├── john_doe.json
│   ├── jane_smith.json
│   └── ...
└── chapter_3_5_exam/
    ├── test-config.json
    └── ...
```

**Note**: Auto-save works in Chrome and Edge. Firefox/Safari users can manually export tests.

### 2. Create a Test

1. Click "Create New Test"
2. Enter test name: `"October Test"`
3. Enter description: `"Logarithms"` (optional)
4. Click "Create Test"

### 3. Configure Test Tasks

1. Open your test
2. In the left sidebar, click "Show Config" under Task Configuration
3. Add/remove tasks and subtasks
4. Example setup:
   - Task 1 (no subtasks)
   - Task 2 (subtasks a, b, c)
   - Task 3 (no subtasks)
   - Task 4 (subtasks a, b)

### 4. Add General Comment

In the "General Comment" box, add information relevant to all students:
```
This test covers logarithms and exponential functions.
Important formulas: $log_a(x y) = log_a(x) + log_a(y)$
```

### 5. Add Students

1. Click "+ Add" in the Students section
2. Enter student name (required)
3. Enter student number (optional)
4. Click "Add Student"
5. Repeat for all students

### 6. Provide Feedback

1. Click on a student from the list
2. For each task/subtask:
   - Select points (0-6)
   - Add comments with Typst math notation
3. Add individual comment for the student
4. See live score update (0-60)

### 7. Complete Feedback

1. When done, click "Mark Complete"
2. **Feedback auto-saves** to your selected folder (if enabled)
3. Or click "Export PDF" to download Typst file
4. Compile: `typst compile student_name.typ`

### 8. Next Student

1. Click another student from the list
2. Repeat feedback process
3. All progress auto-saves as you work

## Understanding the 0-60 Scoring System

The new scoring system is designed to give integer scores that are easy to interpret:

### How It Works

1. **Calculate average per task**:
   - Student completes 4 tasks with scores: 3, 4, 5, 6
   - Average: (3+4+5+6)/4 = 4.5

2. **Multiply by 10**:
   - Score: 4.5 × 10 = 45
   - Rounded to nearest integer: **45/60**

3. **Result**: Clean, interpretable score

### Examples

| Tasks | Scores | Average | Final Score | Percentage |
|-------|--------|---------|-------------|------------|
| 3 | 6, 6, 6 | 6.0 | **60/60** | 100% |
| 3 | 5, 5, 5 | 5.0 | **50/60** | 83% |
| 4 | 4, 5, 5, 6 | 5.0 | **50/60** | 83% |
| 5 | 3, 3, 4, 4, 4 | 3.6 | **36/60** | 60% |
| 3 | 0, 3, 6 | 3.0 | **30/60** | 50% |

### Why This System?

- ✅ **Consistent**: Same scale regardless of number of tasks
- ✅ **Integer scores**: No decimals to round
- ✅ **Easy to understand**: 50/60 is immediately clear
- ✅ **Fair**: Average prevents task count bias

## Typst Math Notation

Use Typst syntax in all comment fields:

| Math | Typst Code |
|------|------------|
| x² + y² | `$x^2 + y^2$` |
| Fraction | `$x/y$` or `$frac(x, y)$` |
| Square root | `$sqrt(x)$` |
| Logarithm | `$log_2(x)$` |
| Limit | `$lim_(x arrow infinity) f(x)$` |
| Integral | `$integral_0^1 x^2 d x$` |
| Sum | `$sum_(i=1)^n i$` |
| Greek | `$alpha$, $beta$, $Delta$` |

Full documentation: [Typst Math Documentation](https://typst.app/docs/reference/math/)

## File Storage Location

**Browser Storage**: All data is stored in your browser's localStorage
- Survives browser restarts
- Private to your computer
- No server/cloud needed

**File System** (with auto-save):
- You choose the folder
- JSON files for each student
- Easy to backup/version control
- Can be synced to cloud (Dropbox, OneDrive, etc.)

**Recommendation**: Enable auto-save and keep the folder in a synced directory for automatic backups.

## Data Export/Import

### Export Single Test
1. Click download icon on test card
2. Choose folder location
3. Creates folder with all student data

### Export All Tests
1. Click "Export All" in top bar
2. Downloads JSON file with everything
3. Safe backup of all data

### Import Tests
1. Use the import function (coming soon)
2. Or manually edit localStorage

## Typical Workflow

### Starting a New Test
1. Create test: "November Test - Derivatives"
2. Configure 5 tasks (some with subtasks)
3. Add general comment about test content
4. Add 25 students to the test

### Grading Session
1. Open test
2. Have papers ready
3. Click first student
4. Grade each task (0-6 points + comments)
5. Add individual feedback
6. Click "Mark Complete" → auto-saves
7. Move to next student

### After Grading
1. All feedback automatically saved to folder
2. Compile PDFs: `typst compile *.typ`
3. Distribute PDFs to students
4. Review analytics to identify difficult tasks

## Analytics

Access the old archive system for:
- **Task difficulty analysis**: Which tasks were hardest?
- **Student progress**: How is each student improving?
- **Class statistics**: Overall performance trends

## Technology Stack

- **Framework**: Next.js 14 with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: Typst
- **File System**: File System Access API (Chrome/Edge)
- **Storage**: Browser localStorage + JSON files

## Project Structure

```
tilbakemeldingsapp/
├── app/
│   ├── page.tsx              # Redirect to /tests
│   ├── tests/
│   │   └── page.tsx          # Test management page
│   ├── test/
│   │   └── [id]/page.tsx     # Test detail + feedback
│   ├── archive/
│   │   └── page.tsx          # Old archive viewer
│   └── analytics/
│       └── page.tsx          # Statistics & analysis
├── components/
│   ├── TaskConfiguration.tsx # Task setup UI
│   ├── StudentInfo.tsx       # (Legacy)
│   └── FeedbackForm.tsx      # (Legacy)
├── types/
│   └── index.ts              # TypeScript definitions
├── utils/
│   ├── testStorage.ts        # New test-centric storage
│   ├── typstExport.ts        # PDF generation
│   ├── storage.ts            # Legacy storage
│   └── archive.ts            # Archive utilities
└── package.json
```

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Core app | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ |
| Auto-save | ✅ | ❌ | ❌ |
| Manual export | ✅ | ✅ | ✅ |

**Recommendation**: Use Chrome or Edge for best experience with auto-save feature.

## FAQ

**Q: Where are my files stored?**
A: In two places:
1. Browser localStorage (for the app interface)
2. Your chosen folder (for auto-saved JSON/Typst files)

**Q: Can I move the auto-save folder?**
A: Yes, just setup auto-save again with the new folder.

**Q: What if I lose my browser data?**
A: Your files in the auto-save folder are safe. Use "Export All" regularly as extra backup.

**Q: Can multiple teachers use this?**
A: Each browser/computer has its own data. Share via exported JSON files.

**Q: How do I edit a completed feedback?**
A: Just click the student again and make changes. Mark complete again to re-save.

## Tips

1. **Enable auto-save first** - saves time and prevents data loss
2. **Use descriptive test names** - "October Test - Logarithms" vs "Test 1"
3. **Write general comments first** - shared across all students
4. **Use Typst math freely** - makes feedback professional
5. **Export regularly** - backup your data
6. **Check analytics** - identify problem areas

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
