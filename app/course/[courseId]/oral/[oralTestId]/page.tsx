'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Course, OralTest, CourseStudent, OralFeedbackData, OralFeedbackDimension, OralFeedbackDimensionType } from '@/types';
import { loadCourse, updateOralAssessment, getOralAssessment, calculateOralScore } from '@/utils/courseStorage';
import { generateOralTypstDocument, downloadTypstFile, compileAndDownloadPDF } from '@/utils/typstExport';
import OralFeedbackForm from '@/components/OralFeedbackForm';
import { ArrowLeft, Save, CheckCircle, Circle, MessageSquare, BarChart3, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OralAssessmentPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const oralTestId = params.oralTestId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [oralTest, setOralTest] = useState<OralTest | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<OralFeedbackData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [courseId, oralTestId]);

  const loadData = () => {
    const loadedCourse = loadCourse(courseId);
    if (!loadedCourse) {
      alert(t('course.courseNotFound'));
      router.push('/courses');
      return;
    }

    const loadedOralTest = loadedCourse.oralTests?.find(ot => ot.id === oralTestId);
    if (!loadedOralTest) {
      alert(t('test.testNotFound'));
      router.push(`/course/${courseId}`);
      return;
    }

    setCourse(loadedCourse);
    setOralTest(loadedOralTest);
  };

  // Auto-select student from URL parameter
  useEffect(() => {
    if (!course) return;

    const studentIdParam = searchParams.get('student');
    if (studentIdParam) {
      const student = course.students.find(s => s.id === studentIdParam);
      if (student && (!selectedStudent || selectedStudent.id !== studentIdParam)) {
        setSelectedStudent(student);
      }
    }
  }, [course, searchParams, selectedStudent]);

  useEffect(() => {
    if (selectedStudent && course && oralTest) {
      const feedback = getOralAssessment(courseId, oralTestId, selectedStudent.id);

      // Initialize with empty dimensions if no feedback exists
      const dimensions: OralFeedbackDimension[] = [
        { dimension: 'strategy', points: 0, comment: '' },
        { dimension: 'reasoning', points: 0, comment: '' },
        { dimension: 'representations', points: 0, comment: '' },
        { dimension: 'modeling', points: 0, comment: '' },
        { dimension: 'communication', points: 0, comment: '' },
        { dimension: 'subject_knowledge', points: 0, comment: '' },
      ];

      setCurrentFeedback(feedback || {
        studentId: selectedStudent.id,
        dimensions: dimensions,
        generalObservations: '',
        taskReferences: [],
        recordedDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [selectedStudent, course, oralTest, courseId, oralTestId]);

  const handleOralFeedbackChange = (feedback: OralFeedbackData) => {
    setCurrentFeedback(feedback);
  };

  const handleSave = () => {
    if (!currentFeedback || !selectedStudent || !oralTest) return;

    setIsSaving(true);

    // Calculate score
    const score = calculateOralScore(currentFeedback);

    // Update with score
    const feedbackWithScore = {
      ...currentFeedback,
      score: score,
    };

    updateOralAssessment(courseId, oralTestId, selectedStudent.id, feedbackWithScore);

    setIsSaving(false);
    loadData();

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = t('test.feedbackMarkedComplete');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleMarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const feedbackWithCompletion = {
      ...currentFeedback,
      completedDate: new Date().toISOString(),
      score: calculateOralScore(currentFeedback),
    };

    updateOralAssessment(courseId, oralTestId, selectedStudent.id, feedbackWithCompletion);

    loadData();

    // Show success message
    alert(t('oral.markedComplete'));
  };

  const handleUnmarkComplete = () => {
    if (!currentFeedback || !selectedStudent) return;

    const feedbackWithoutCompletion = {
      ...currentFeedback,
      completedDate: undefined,
    };

    updateOralAssessment(courseId, oralTestId, selectedStudent.id, feedbackWithoutCompletion);

    loadData();
  };

  const isStudentCompleted = (studentId: string): boolean => {
    const assessment = oralTest?.studentAssessments.find(a => a.studentId === studentId);
    return !!assessment?.completedDate;
  };

  const handleDownloadTypst = () => {
    if (!selectedStudent || !currentFeedback || !oralTest) return;

    const typstContent = generateOralTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      oralTestName: oralTest.name,
      oralTestDate: oralTest.date,
      oralFeedback: currentFeedback,
      language,
    });

    const filename = `${oralTest.name}-${selectedStudent.name}.typ`;
    downloadTypstFile(typstContent, filename);
  };

  const handleGeneratePDF = async () => {
    if (!selectedStudent || !currentFeedback || !oralTest) return;

    const typstContent = generateOralTypstDocument({
      studentName: selectedStudent.name,
      studentNumber: selectedStudent.studentNumber,
      oralTestName: oralTest.name,
      oralTestDate: oralTest.date,
      oralFeedback: currentFeedback,
      language,
    });

    const filename = `${oralTest.name}-${selectedStudent.name}.pdf`;
    const success = await compileAndDownloadPDF(typstContent, filename);

    if (success) {
      alert(t('test.pdfCompiledSuccess'));
    }
  };

  if (!course || !oralTest) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/course/${courseId}`}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-2"
            >
              <ArrowLeft size={20} />
              {t('test.backToCourse')}
            </Link>
            <div className="flex items-center gap-3">
              <MessageSquare size={28} className="text-purple-600" />
              <div>
                <h1 className="text-3xl font-display font-bold text-text-primary">{oralTest.name}</h1>
                {oralTest.description && <p className="text-text-secondary">{oralTest.description}</p>}
                {oralTest.topics && oralTest.topics.length > 0 && (
                  <p className="text-sm text-purple-600 mt-1">
                    {t('course.topics')}: {oralTest.topics.join(', ')}
                  </p>
                )}
                <p className="text-sm text-text-disabled">
                  {new Date(oralTest.date).toLocaleDateString('nb-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Student List */}
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-display font-bold text-text-primary mb-4 flex items-center gap-2">
                {t('test.studentsCount').replace('{count}', course.students.length.toString())}
              </h2>

              {course.students.length === 0 ? (
                <p className="text-sm text-text-disabled text-center py-8">{t('test.noStudentsInCourse')}</p>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {course.students.map(student => {
                    const isCompleted = isStudentCompleted(student.id);
                    const isSelected = selectedStudent?.id === student.id;

                    return (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-purple-100 border-purple-500 shadow-md'
                            : 'bg-background border-border hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-text-primary text-sm">{student.name}</span>
                          {isCompleted ? (
                            <CheckCircle size={16} className="text-success flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="text-text-disabled flex-shrink-0" />
                          )}
                        </div>
                        {student.studentNumber && (
                          <p className="text-xs text-text-disabled">
                            {t('test.studentNumber').replace('{number}', student.studentNumber)}
                          </p>
                        )}
                        {isCompleted && (
                          <p className="text-xs text-success mt-1">{t('test.completed')}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <Link
                href={`/course/${courseId}/analytics`}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition w-full text-sm"
              >
                <BarChart3 size={16} />
                {t('course.viewAnalytics')}
              </Link>
            </div>
          </div>

          {/* Oral Feedback Form */}
          <div className="lg:col-span-9">
            {!selectedStudent ? (
              <div className="bg-surface rounded-lg shadow-sm p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-purple-300 mb-4" />
                <p className="text-text-secondary text-lg">{t('test.selectStudentPrompt')}</p>
              </div>
            ) : (
              <div className="bg-surface rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-text-primary">
                    {selectedStudent.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                      {t('common.save')}
                    </button>
                    {currentFeedback?.completedDate ? (
                      <button
                        onClick={handleUnmarkComplete}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                      >
                        <CheckCircle size={18} />
                        {t('test.clickToUnmarkComplete')}
                      </button>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition"
                      >
                        <Circle size={18} />
                        {t('test.markComplete')}
                      </button>
                    )}
                    <button
                      onClick={handleGeneratePDF}
                      className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
                      title={t('test.compileToPDF')}
                    >
                      <FileText size={18} />
                      {t('test.generatePDF')}
                    </button>
                    <button
                      onClick={handleDownloadTypst}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition"
                      title={t('test.downloadTypSource')}
                    >
                      <Download size={18} />
                      .typ
                    </button>
                  </div>
                </div>

                {currentFeedback && (
                  <OralFeedbackForm
                    oralFeedback={currentFeedback}
                    onOralFeedbackChange={handleOralFeedbackChange}
                    studentName={selectedStudent.name}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
