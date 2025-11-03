import { Course } from '@/types';
import { saveCourse, loadAllCourses } from './courseStorage';
import demoCourseData from '../data/demoCourse.json';

/**
 * Loads the demo course into the application.
 * This demo course contains:
 * - 10 fictive students with varying skill levels
 * - 2 written tests with realistic feedback
 * - Labels, categories, and comprehensive feedback
 *
 * @returns The loaded demo course
 */
export function loadDemoCourse(): Course {
  const demoCourse = demoCourseData as Course;

  // Check if demo course already exists
  const existingCourses = loadAllCourses();
  const demoExists = existingCourses.some(course => course.id === demoCourse.id);

  if (demoExists) {
    console.log('Demo course already exists. Updating it...');
  }

  // Save the demo course
  saveCourse(demoCourse);

  return demoCourse;
}

/**
 * Checks if the demo course is already loaded
 * @returns true if demo course exists in storage
 */
export function isDemoCourseLoaded(): boolean {
  const courses = loadAllCourses();
  return courses.some(course => course.id === 'course-demo-2024');
}

/**
 * Removes the demo course from storage
 */
export function removeDemoCourse(): void {
  const courses = loadAllCourses();
  const filtered = courses.filter(course => course.id !== 'course-demo-2024');

  if (typeof window !== 'undefined') {
    localStorage.setItem('math-feedback-courses', JSON.stringify(filtered));
  }
}

/**
 * Gets information about the demo course
 */
export function getDemoCourseInfo() {
  return {
    id: 'course-demo-2024',
    name: 'Demo Klasse - Matematikk 1T',
    description: 'Demonstrasjonskurs for å vise funksjonalitet i tilbakemeldingsappen',
    studentCount: 10,
    testCount: 2,
    features: [
      '10 fiktive studentar med varierande ferdigheitsnivå',
      '2 skriftlege prøver med oppgåver',
      'Realistiske tilbakemeldingar med poenggiving',
      'Merkelappar for ulike matematikk-emne',
      'Kategorisering etter vanskegrad (1-3)',
      'Todelsprøver (utan og med hjelpemiddel)',
    ],
  };
}
