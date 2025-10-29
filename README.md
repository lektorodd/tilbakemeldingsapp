# Math Test Feedback App

A simple web application for creating detailed feedback on math tests with flexible task configuration and PDF export using Typst.

## Features

- **Flexible Task Configuration**: Easily add, remove, and customize tasks with or without subtasks (e.g., 1, 2a, 2b, 3, 4a, 4b, 4c)
- **Point System**: Award points from 0-6 for each task/subtask
- **Rich Comments**: Add comments with Typst math notation support
- **General & Individual Comments**: Include both shared and personalized feedback
- **PDF Export**: Generate professional feedback documents using Typst
- **Local Storage**: Automatically saves your task configuration and general comments

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

### 6. Next Student

- Click "Reset Feedback" to clear student-specific data while keeping task configuration

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

The app automatically saves:
- Task configuration
- Test name
- General comment

This data persists across browser sessions using localStorage.

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
│   ├── layout.tsx        # App layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── TaskConfiguration.tsx  # Task setup UI
│   ├── StudentInfo.tsx        # Student info form
│   └── FeedbackForm.tsx       # Feedback input
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   ├── typstExport.ts    # PDF export logic
│   └── storage.ts        # LocalStorage utilities
└── package.json
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
