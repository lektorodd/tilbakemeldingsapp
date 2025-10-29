# Math Test Feedback App

A simple web application for creating detailed feedback on math tests with flexible task configuration and PDF export using Typst.

## Features

### Core Feedback Features
- **Flexible Task Configuration**: Easily add, remove, and customize tasks with or without subtasks (e.g., 1, 2a, 2b, 3, 4a, 4b, 4c)
- **Point System**: Award points from 0-6 for each task/subtask
- **Rich Comments**: Add comments with Typst math notation support
- **General & Individual Comments**: Include both shared and personalized feedback
- **PDF Export**: Generate professional feedback documents using Typst
- **Local Storage**: Automatically saves your task configuration and general comments

### Archive & Analytics Features
- **Feedback Archive**: Save all feedback to a local archive for future reference
- **Task Difficulty Analysis**: Identify which tasks students struggle with most
- **Student Progress Tracking**: Monitor individual student improvement over time
- **Statistical Insights**: View average scores, point distributions, and success rates
- **Data Export/Import**: Backup and restore your entire archive as JSON
- **Filter & Search**: Easily find feedback by student name or test name

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Typst CLI (for compiling the exported .typ files to PDF)

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

To compile the exported Typst files to PDF:

```bash
# On macOS (using Homebrew)
brew install typst

# On Linux (using cargo)
cargo install --git https://github.com/typst/typst

# Or download from https://github.com/typst/typst/releases
```

## Usage

### 1. Configure Your Test

- Set the test name at the top
- Click "Show Config" to customize tasks
- Add or remove tasks and subtasks as needed
- Task labels can be customized (e.g., "1", "2a", "2b")

### 2. Enter General Information

- **General Comment**: This comment will be the same for all students (useful for overall test information)
- You can use Typst math notation in comments

### 3. Enter Student Information

- Student name (required)
- Student number (optional)
- Individual comment specific to this student

### 4. Provide Task Feedback

- For each task/subtask:
  - Select points (0-6)
  - Add comments with mathematical notation

### 5. Export to Typst

- Click "Export Typst File" to download a `.typ` file
- Compile to PDF using: `typst compile filename.typ`

### 6. Save to Archive

- Click "Save to Archive" to store the feedback for future analysis
- This allows you to track student progress and identify difficult tasks

### 7. Next Student

- Click "Reset Feedback" to clear student-specific data while keeping task configuration

## Archive & Analytics

### Viewing the Archive

1. Click "View Archive" in the top right corner
2. Browse all saved feedback
3. Filter by student name or test name
4. Click on any feedback to view full details
5. Export archive as JSON for backup
6. Import previously exported archives

### Analyzing Task Difficulty

1. From the Archive page, click "View Analytics & Statistics"
2. View task difficulty analysis:
   - **Average Points**: See mean score for each task
   - **Success Rate**: Percentage of maximum points achieved
   - **Difficulty Rating**: Automatic classification (Easy/Moderate/Hard/Very Hard)
   - **Point Distribution**: Visual histogram showing how many students got each score
3. Filter by specific test to compare task difficulty across tests
4. Identify problematic tasks that need better teaching or clarification

### Tracking Student Progress

1. In the Analytics page, select a student from the dropdown
2. View:
   - **Total Tests**: Number of tests completed
   - **Average Score**: Overall performance across all tests
   - **Latest Score**: Most recent test result
   - **Test History**: Chronological list of all tests with trend indicators
3. Monitor improvement or identify students needing extra support

## Typst Math Notation Examples

The app supports Typst's mathematical notation:

| Math Expression | Typst Code |
|----------------|------------|
| x² + y² = r² | `$x^2 + y^2 = r^2$` |
| Fraction | `$x/y$` or `$frac(x, y)$` |
| Greek letters | `$alpha$, $beta$, $gamma$` |
| Limits | `$lim_(x arrow infinity) f(x)$` |
| Integrals | `$integral x^2 d x$` |
| Derivatives | `$f'(x)$` or `$(d y)/(d x)$` |
| Square root | `$sqrt(x)$` |
| Sum | `$sum_(i=1)^n i$` |

For more Typst math syntax, see the [Typst documentation](https://typst.app/docs/reference/math/).

## Example Workflow

1. Configure test with tasks: 1, 2a, 2b, 3
2. Enter general comment: "This test covers derivatives and integrals from Chapter 4."
3. For each student:
   - Enter name and student number
   - Fill in points and comments for each task
   - Add individual feedback
   - Export Typst file
   - Compile: `typst compile student_name.typ`
   - Click "Reset Feedback" for next student

## Data Persistence

The app automatically saves to localStorage:
- **Task configuration**: Persists across sessions
- **Test name**: Remembered for future feedback
- **General comment**: Saved for reuse
- **Archive**: All saved feedback is stored locally

**Important**: Data is stored in your browser's localStorage. To backup your data:
1. Go to Archive page
2. Click "Export Archive" to download a JSON file
3. Keep this file safe - you can re-import it anytime

## Technology Stack

- **Framework**: Next.js 14 with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: Typst
- **Icons**: Lucide React

## Project Structure

```
tilbakemeldingsapp/
├── app/
│   ├── layout.tsx         # App layout
│   ├── page.tsx           # Main feedback page
│   ├── archive/
│   │   └── page.tsx       # Archive viewer
│   ├── analytics/
│   │   └── page.tsx       # Analytics & statistics
│   └── globals.css        # Global styles
├── components/
│   ├── TaskConfiguration.tsx  # Task setup UI
│   ├── StudentInfo.tsx        # Student info form
│   └── FeedbackForm.tsx       # Feedback input
├── types/
│   └── index.ts           # TypeScript types
├── utils/
│   ├── typstExport.ts     # PDF export logic
│   ├── storage.ts         # LocalStorage utilities
│   └── archive.ts         # Archive & analytics utilities
└── package.json
```

## Use Cases

### For Teachers
- **Grading Efficiency**: Quickly grade multiple student tests with consistent formatting
- **Student Progress**: Track individual student improvement across multiple tests
- **Curriculum Improvement**: Identify difficult topics that need more teaching time
- **Professional Feedback**: Generate professional-looking PDF feedback with mathematical notation

### For Students
- Clear, detailed feedback with mathematical expressions properly formatted
- Consistent grading structure across all tests
- Individual and general comments for comprehensive understanding

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
