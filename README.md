# Math Test Feedback App

A comprehensive web application for managing math courses, tracking student progress, and providing detailed feedback. Features course-centric organization, flexible task configuration, Typst math notation support, and automatic file export.

## Core Concept: Course-Centric Organization

The app is organized around **Courses** (classes), not individual tests:

1. **Create a Course** (e.g., "Math 10A - Fall 2024")
2. **Add Students** to the course roster (once, they stay in the course)
3. **Create Tests** within the course (multiple tests over the term)
4. **Provide Feedback** for each student on each test
5. **Track Progress** across all tests in the course

### Why Course-Centric?

- ✅ **Matches Real Teaching**: How you actually organize your classes
- ✅ **Student Roster**: Add students once, not per test
- ✅ **Progress Tracking**: See how each student improves over time
- ✅ **Class Analytics**: Compare test difficulty and student performance
- ✅ **Timeline**: Tests ordered by date show progression

## Features

### Course Management
- **Create Courses**: Organize by class (e.g., "Math 10A", "Algebra II - Spring 2024")
- **Student Roster**: Manage students at the course level
- **Multiple Tests**: Add unlimited tests per course
- **Progress View**: Track student improvement across all tests
- **Test Analysis**: See which tests were hardest for the class

### Scoring System (0-60 Scale)
- **Formula**: (average points per task) × 10 = **integer score 0-60**
- **Example**: 4 tasks with scores 3, 4, 5, 6 → average 4.5 → **45/60**
- **Benefits**: Always integers, consistent scale, easy to interpret
- **Fair**: Independent of number of tasks on test

### Feedback Features
- **Flexible Tasks**: Configure tasks with or without subtasks (1, 2a, 2b, 3, etc.)
- **Point System**: 0-6 points per task/subtask
- **Typst Math**: Write mathematical expressions in all comments
- **General Comments**: Same for all students on a test
- **Individual Comments**: Personalized feedback per student
- **PDF Export**: Generate professional Typst documents

### Auto-Save to Files
- **Automatic Export**: Completed feedback saves to your chosen folder
- **Organized by Course**: Each course gets its own folder
- **Organized by Test**: Each test within course gets a subfolder
- **JSON Format**: Easy to backup, share, and process
- **Browser Support**: Chrome and Edge (File System Access API)

### Analytics (Coming Soon)
- **Student Progress**: View all test scores for each student
- **Test Results**: View all student scores for each test
- **Course Statistics**: Overall performance metrics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome or Edge recommended for auto-save)
- Typst CLI (for compiling PDFs from exported files)

### Installation

1. Navigate to the project folder:
```bash
cd /home/user/tilbakemeldingsapp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: Always run npm commands from the `/home/user/tilbakemeldingsapp/` directory.

### Installing Typst (Required for PDF Generation)

**Important**: The app exports `.typ` files (Typst source code). You must manually compile them to PDF.

Install Typst CLI:

```bash
# macOS (Homebrew)
brew install typst

# Linux (cargo)
cargo install --git https://github.com/typst/typst

# Or download from https://github.com/typst/typst/releases
```

**Workflow**:
1. In app: Click "Export PDF" → downloads `student_name.typ`
2. In terminal: `typst compile student_name.typ` → generates `student_name.pdf`
3. Distribute the PDF to students

**The app does NOT auto-compile to PDF** - this is a manual step.

## Complete Workflow

### 1. Setup Auto-Save (Recommended)

1. On the main page, click "Setup Auto-Save Folder"
2. Select a folder (e.g., `Documents/MathFeedback/`)
3. Grant permissions
4. Done! All completed feedback auto-saves

**Folder Structure:**
```
MathFeedback/
├── math_10a_fall_2024/
│   ├── course-info.json
│   ├── october_test_logarithms/
│   │   ├── test-config.json
│   │   ├── john_doe.json
│   │   ├── jane_smith.json
│   │   └── ...
│   └── november_test_derivatives/
│       ├── test-config.json
│       └── ...
└── algebra_ii_spring_2024/
    └── ...
```

### 2. Create a Course

1. Click "Create New Course"
2. Enter name: `"Math 10A - Fall 2024"`
3. Enter description: `"Advanced mathematics"` (optional)
4. Click "Create Course"

### 3. Add Students to Course

1. Open your course
2. Click "+ Add" under Students
3. Enter student name (required)
4. Enter student number (optional)
5. Repeat for all students in the class

**Benefits**: Add students once, they're in all tests automatically!

### 4. Create a Test

1. In your course, click "+ Add" under Tests
2. Enter test name: `"October Test"`
3. Enter description: `"Logarithms"` (optional)
4. Select test date
5. Click "Add Test"

### 5. Configure Test

1. Click "Give Feedback" on the test
2. Click "Show Config" under Task Configuration
3. Add/remove tasks and subtasks as needed
4. Set up general comment (same for all students)
5. Click "Save Test Config"

**Example Task Setup:**
- Task 1 (no subtasks)
- Task 2 (subtasks a, b, c)
- Task 3 (no subtasks)
- Task 4 (subtasks a, b)

### 6. Provide Feedback

1. Select a student from the left sidebar
2. For each task/subtask:
   - Choose points (0-6)
   - Add comments with Typst math notation
3. Add individual comment for the student
4. See score update live (0-60)

### 7. Complete Feedback

1. Click "Mark Complete"
2. **Feedback auto-saves** to your folder
3. Move to next student
4. Repeat

### 8. Export and Compile PDF

1. Click "Export PDF" button
2. Downloads `student_name_test_name.typ` file
3. **Manual step**: Open terminal and run:
   ```bash
   typst compile student_name_test_name.typ
   ```
4. This creates `student_name_test_name.pdf`
5. Distribute PDF to student

**Note**: The app exports Typst source code (`.typ`), not PDFs. You must compile manually.

### 9. Next Test

1. Back to course page
2. Create new test
3. All students already there!
4. Provide feedback as before

### 10. Track Progress

- View Analytics (coming soon)
- See each student's scores across all tests
- Identify difficult tests for the class
- Monitor improvement over time

## Understanding the 0-60 Scoring System

### How It Works

1. **Calculate average per task**:
   - Student completes 4 tasks with scores: 3, 4, 5, 6
   - Average: (3+4+5+6)/4 = 4.5

2. **Multiply by 10**:
   - Score: 4.5 × 10 = 45
   - Rounded to nearest integer: **45/60**

### Examples

| # Tasks | Individual Scores | Average | Final Score | Percentage |
|---------|-------------------|---------|-------------|------------|
| 3 | 6, 6, 6 | 6.0 | **60/60** | 100% |
| 3 | 5, 5, 5 | 5.0 | **50/60** | 83% |
| 4 | 4, 5, 5, 6 | 5.0 | **50/60** | 83% |
| 5 | 3, 3, 4, 4, 4 | 3.6 | **36/60** | 60% |
| 3 | 0, 3, 6 | 3.0 | **30/60** | 50% |

### Why This System?

- ✅ **Consistent**: Same scale regardless of number of tasks
- ✅ **Integer Scores**: No decimals to round
- ✅ **Easy to Understand**: 45/60 is immediately clear
- ✅ **Fair**: Average prevents task count bias
- ✅ **Comparable**: Can compare across different tests

## Typst Math Notation

Use Typst syntax in all comment fields:

| Math Expression | Typst Code |
|----------------|------------|
| x² + y² = r² | `$x^2 + y^2 = r^2$` |
| Fraction | `$x/y$` or `$frac(x, y)$` |
| Square root | `$sqrt(x)$` |
| Logarithm | `$log_2(x)$` |
| Limit | `$lim_(x arrow infinity) f(x)$` |
| Integral | `$integral_0^1 x^2 d x$` |
| Derivative | `$f'(x)$ or $(d f)/(d x)$` |
| Sum | `$sum_(i=1)^n i$` |
| Greek letters | `$alpha$, $beta$, $Delta$` |

Full documentation: [Typst Math Documentation](https://typst.app/docs/reference/math/)

## Real-World Example

### Scenario: Teaching Math 10A

**Setup (Beginning of Term):**
1. Create course "Math 10A - Fall 2024"
2. Add 25 students to the roster
3. Enable auto-save to `Documents/Math10A/`

**First Test (October):**
1. Create test "October Test - Logarithms" (date: Oct 15)
2. Configure 5 tasks (some with subtasks)
3. Add general comment about logarithm rules
4. Grade all 25 students
5. All feedback auto-saved to `Documents/Math10A/october_test_logarithms/`

**Second Test (November):**
1. Create test "November Test - Derivatives" (date: Nov 12)
2. Configure 6 tasks
3. Same 25 students automatically available
4. Grade all students
5. Auto-saved to `Documents/Math10A/november_test_derivatives/`

**Progress Tracking:**
- View Analytics (coming soon)
- See that John improved from 35/60 to 48/60
- Notice that Task 3 on October test was hardest for class
- Identify students needing extra help

## File Storage

### Browser Storage
All course data stored in localStorage:
- Survives browser restarts
- Private to your computer
- No server needed

### File System (with auto-save)
You choose the folder location:
- Organized by course and test
- JSON files for each student
- Easy to backup
- Can sync to cloud (Dropbox, OneDrive, etc.)

**Recommendation**: Enable auto-save and store in a synced folder for automatic backups.

## Data Structure

```
Course
  ├── Students (roster)
  │     ├── Student 1
  │     ├── Student 2
  │     └── ...
  └── Tests
        ├── Test 1
        │     ├── Feedback for Student 1
        │     ├── Feedback for Student 2
        │     └── ...
        └── Test 2
              ├── Feedback for Student 1
              └── ...
```

## Export/Import

### Export All Courses
1. Click "Export All" on main page
2. Downloads JSON file with everything
3. Safe backup of all data

### Export Single Course
- Auto-save handles this automatically
- Or manually export from course page (coming soon)

### Import Courses
- Coming soon
- Will allow importing from JSON backup

## Typical Use Cases

### Semester-Long Course

1. **Week 1**: Create course, add all students
2. **Throughout term**: Create test before each exam
3. **After each exam**: Grade all students, feedback auto-saves
4. **End of term**: Have complete history of all tests and progress

### Multiple Classes

1. **Setup**: Create course for each class (10A, 10B, 10C)
2. **Add students** to each course roster
3. **Create same tests** in each course (or different ones)
4. **Compare**: See which class struggles with which topics

### Special Education

1. **Create course** for small group
2. **Frequent tests**: Add new test after each unit
3. **Detailed feedback**: Extensive comments with math notation
4. **Track progress**: See improvement over many tests

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Core app | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ |
| Auto-save | ✅ | ❌ | ❌ |
| Manual export | ✅ | ✅ | ✅ |

**Recommendation**: Use Chrome or Edge for best experience with auto-save.

## Project Structure

```
tilbakemeldingsapp/
├── app/
│   ├── page.tsx                          # Redirect to /courses
│   ├── courses/
│   │   └── page.tsx                      # Course list
│   ├── course/
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Course detail (students + tests)
│   │   └── [courseId]/
│   │       ├── test/
│   │       │   └── [testId]/page.tsx     # Test feedback page
│   │       └── analytics/page.tsx        # Course analytics (coming soon)
│   ├── tests/page.tsx                    # Legacy test management
│   ├── archive/page.tsx                  # Legacy archive
│   └── analytics/page.tsx                # Legacy analytics
├── components/
│   ├── TaskConfiguration.tsx             # Task setup UI
│   ├── StudentInfo.tsx                   # (Legacy)
│   └── FeedbackForm.tsx                  # (Legacy)
├── types/
│   └── index.ts                          # TypeScript types
├── utils/
│   ├── courseStorage.ts                  # Course-centric storage (NEW)
│   ├── testStorage.ts                    # Legacy test storage
│   ├── typstExport.ts                    # PDF generation
│   ├── storage.ts                        # Legacy storage
│   └── archive.ts                        # Legacy archive
└── package.json
```

## Technology Stack

- **Framework**: Next.js 14 with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: Typst
- **File System**: File System Access API (Chrome/Edge)
- **Storage**: Browser localStorage + JSON files

## FAQ

**Q: Where is my data stored?**
A: In two places:
1. Browser localStorage (for the app interface)
2. Your chosen folder (for auto-saved files)

**Q: Can I teach multiple courses?**
A: Yes! Create one course per class. Each has its own students and tests.

**Q: What if I lose browser data?**
A: Your auto-saved files are safe. Also export regularly via "Export All".

**Q: Can I move the auto-save folder?**
A: Yes, just setup auto-save again and choose the new folder.

**Q: How do I add a student mid-semester?**
A: Open the course, click "+ Add" under Students. They'll appear in all future tests.

**Q: Can I edit completed feedback?**
A: Yes! Just click the student again and make changes. Mark complete to re-save.

**Q: Can I delete a test?**
A: Yes, but this deletes all feedback for that test. Be careful!

**Q: Can I reuse tasks across tests?**
A: Currently each test has its own task configuration. Copy-paste recommended.

**Q: How do I compare students across tests?**
A: Use the Analytics page (coming soon) to see progress over time.

## Tips & Best Practices

1. **Setup Auto-Save First**: Prevents data loss and saves time
2. **Use Descriptive Names**: "Math 10A - Fall 2024" better than "Course1"
3. **Add Students Early**: Get the roster in at the start of term
4. **Set Test Dates**: Helps track timeline and progression
5. **Write General Comment**: Saves time, shared across all students
6. **Use Typst Math**: Makes feedback professional and clear
7. **Export Regularly**: Backup via "Export All" weekly
8. **Sync Auto-Save Folder**: Use Dropbox/OneDrive for automatic backups
9. **Mark Complete**: Triggers auto-save and marks as done
10. **Check Analytics**: Identify problem areas and track improvement

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Support

Having issues? Check the FAQ above or create an issue on GitHub.

---

**Made for teachers, by teachers** (with help from Claude) 📚✏️
