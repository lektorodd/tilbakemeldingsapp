# Demo Course Data

This directory contains demo data for the tilbakemeldingsapp (feedback app). The demo course is designed to showcase all features of the application with realistic, fictive data.

## Demo Course Overview

**Course Name:** Demo Klasse - Matematikk 1T

**Description:** Demonstrasjonskurs for å vise funksjonalitet i tilbakemeldingsappen. Inneholder fiktive studentar og realistiske tilbakemeldingar.

## Features Demonstrated

### Students (10 fictive students)
The demo course includes 10 students with varying skill levels, representing a realistic classroom distribution:

- **High performers:** Sofia Olsen, Nora Kristiansen, Emma Larsen
- **Above average:** Ella Andersen, Olivia Nielsen
- **Average:** Lukas Hansen, William Johansen
- **Below average:** Noah Pedersen, Filip Sørensen
- **Struggling:** Oscar Berg

Each student has:
- Unique student ID (e.g., 2024001)
- Realistic Norwegian name
- Performance data across both tests

### Tests (2 written tests)

#### Test 1: Algebra og Likningar (September 15, 2024)
- **Focus:** Basic algebra and equations
- **Structure:** Two-part test (without/with aids)
- **Tasks:** 6 tasks with subtasks (9 total subtasks)
- **Topics:**
  - Algebra and factorization
  - Equations
  - ABC formula (quadratic formula)
  - Practical applications
- **Scores range:** 28-57 points (out of 60)

#### Test 2: Funksjonar og Eksponentialfunksjonar (October 20, 2024)
- **Focus:** Functions and exponential functions
- **Structure:** Two-part test (without/with aids)
- **Tasks:** 6 tasks with subtasks (9 total subtasks)
- **Topics:**
  - Functions and graphing
  - Exponential functions
  - Logarithms
  - Growth models
  - Practical applications
- **Scores range:** 33-58 points (out of 60)

### Labels (Topic Tags)
The demo course uses 10 thematic labels to categorize tasks:
- algebra
- likningar (equations)
- funksjonar (functions)
- logaritmar (logarithms)
- eksponentfunksjonar (exponential functions)
- derivasjon (derivation)
- ABC-formelen (quadratic formula)
- faktorisering (factorization)
- grafteikning (graphing)
- praktisk anvendelse (practical application)

### Categories (Difficulty Levels)
Tasks are categorized by difficulty:
- **Category 1:** Easy/Basic tasks
- **Category 2:** Medium difficulty
- **Category 3:** Hard/Challenging tasks

### Feedback
Every student has comprehensive feedback including:
- Points for each task/subtask (0-6 scale)
- Individual comments per task
- General feedback comment
- Completion dates
- Calculated scores (0-60 scale)

Feedback demonstrates:
- Realistic Norwegian language (Nynorsk)
- Varying levels of detail
- Encouraging language
- Constructive criticism
- References to common student errors

## How to Use the Demo Course

### Loading the Demo Course

1. **Via UI:** Click the "Last inn demokurs" (Load Demo Course) button on the courses page
2. **Programmatically:**
   ```typescript
   import { loadDemoCourse } from '@/utils/demoData';

   loadDemoCourse();
   ```

### Exploring Features

After loading the demo course, you can:

1. **View Student Progress**
   - Navigate to individual students to see their performance across tests
   - Explore analytics showing strengths and weaknesses

2. **Analyze Test Results**
   - View test analytics with score distributions
   - Examine task-by-task performance
   - Compare student results

3. **Explore Label Analytics**
   - See which topics students struggle with most
   - Identify patterns in mathematical understanding

4. **Export Data**
   - Test Excel export functionality
   - Try Typst document generation
   - Export individual student feedback

5. **Modify Feedback**
   - Edit existing feedback to see live updates
   - Add new feedback snippets
   - Experiment with scoring

## Data Structure

The demo course is stored in `demoCourse.json` with the following structure:

```json
{
  "id": "course-demo-2024",
  "name": "Demo Klasse - Matematikk 1T",
  "students": [...],  // 10 students
  "tests": [...],      // 2 written tests
  "availableLabels": [...],  // 10 topic labels
  "createdDate": "2024-09-01T08:00:00.000Z",
  "lastModified": "2024-10-25T15:00:00.000Z"
}
```

## Educational Value

This demo course is valuable for:

- **New users:** Understanding how the app works before creating real data
- **Teachers:** Seeing best practices for organizing courses and feedback
- **Developers:** Testing features with realistic data
- **Demonstrations:** Showcasing the app's capabilities

## Removing the Demo Course

To remove the demo course:

```typescript
import { removeDemoCourse } from '@/utils/demoData';

removeDemoCourse();
```

Or delete it manually through the course management UI.

## Notes

- All student names and data are completely fictive
- Performance levels are designed to represent a realistic classroom distribution
- Feedback comments demonstrate various teaching approaches
- The demo course ID is `course-demo-2024` for easy identification
- All dates are set to 2024 for consistency
