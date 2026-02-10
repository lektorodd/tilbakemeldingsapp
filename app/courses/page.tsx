'use client';

import { useState, useEffect, useRef } from 'react';
import { Course } from '@/types';
import {
  loadAllCourses,
  setupAutoSaveDirectory,
  isAutoSaveEnabled,
  disableAutoSave,
  exportAllCourses,
  importCourses,
  importFromFolder,
  importCoursesFromData,
  safeDeleteCourse,
  createBackup,
  listBackups,
  restoreFromBackup,
  deleteBackup,
  startAutoBackup,
  stopAutoBackup,
  isAutoBackupRunning,
  BackupEntry,
  ImportResult,
} from '@/utils/courseStorage';
import {
  Plus, Trash2, Users, FileText, Settings, Download, FolderOpen,
  Upload, Shield, Clock, RotateCcw, AlertTriangle, ChevronDown,
  ChevronUp, FolderInput, FileUp, History
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [showBackupPanel, setShowBackupPanel] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importPreview, setImportPreview] = useState<Course[] | null>(null);
  const [importMergeMode, setImportMergeMode] = useState<'skip' | 'merge' | 'duplicate'>('skip');
  const [showImportFolderPreview, setShowImportFolderPreview] = useState(false);
  const [folderImportCourses, setFolderImportCourses] = useState<Course[]>([]);
  const [folderImportErrors, setFolderImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    setAutoSaveEnabled(isAutoSaveEnabled());
    setAutoBackupEnabled(isAutoBackupRunning());

    // Start auto-backup on page load
    if (!isAutoBackupRunning()) {
      startAutoBackup();
      setAutoBackupEnabled(true);
    }

    return () => {
      // Don't stop on unmount — keep running
    };
  }, []);

  const loadData = () => {
    const allCourses = loadAllCourses();
    setCourses(allCourses);
    setBackups(listBackups());
  };

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      alert(t('course.courseNameRequired'));
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: newCourseName,
      description: newCourseDescription,
      students: [],
      tests: [],
      availableLabels: [],
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const allCourses = loadAllCourses();
    allCourses.push(newCourse);

    if (typeof window !== 'undefined') {
      localStorage.setItem('math-feedback-courses', JSON.stringify(allCourses));
    }

    setNewCourseName('');
    setNewCourseDescription('');
    setShowCreateModal(false);
    loadData();
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const feedbackCount = course?.tests.reduce((sum, test) =>
      sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0) || 0;

    const warningMsg = feedbackCount > 0
      ? t('course.deleteConfirmFull') + `\n\n${t('backup.warningFeedbackCount').replace('{count}', String(feedbackCount))}\n${t('backup.autoBackupCreated')}`
      : t('course.deleteConfirmFull') + `\n\n${t('backup.autoBackupCreated')}`;

    if (confirm(warningMsg)) {
      safeDeleteCourse(courseId);
      loadData();
    }
  };

  const handleSetupAutoSave = async () => {
    const success = await setupAutoSaveDirectory();
    if (success) {
      setAutoSaveEnabled(true);
      alert(t('course.autoSaveEnabled'));
    }
  };

  const handleDisableAutoSave = () => {
    disableAutoSave();
    setAutoSaveEnabled(false);
    alert(t('course.autoSaveDisabled'));
  };

  const handleExportAll = () => {
    const json = exportAllCourses();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-courses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleManualBackup = () => {
    const backup = createBackup('manual');
    if (backup) {
      setBackups(listBackups());
      alert(t('backup.manualCreated'));
    } else {
      alert(t('backup.createFailed'));
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    const msg = t('backup.restoreConfirm')
      .replace('{date}', new Date(backup.timestamp).toLocaleString('nb-NO'))
      .replace('{courses}', String(backup.courseCount))
      .replace('{feedback}', String(backup.totalFeedback));

    if (confirm(msg)) {
      const result = restoreFromBackup(backupId);
      if (result.success) {
        loadData();
        alert(t('backup.restoreSuccess').replace('{count}', String(result.courseCount)));
      } else {
        alert(t('backup.restoreFailed'));
      }
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm(t('backup.deleteConfirm'))) {
      deleteBackup(backupId);
      setBackups(listBackups());
    }
  };

  // File import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const preview = Array.isArray(parsed) ? parsed : [parsed];
        setImportPreview(preview);
        setImportResult(null);
        setShowImportModal(true);
      } catch {
        alert(t('backup.invalidFileFormat'));
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;

    const options = {
      skipDuplicates: importMergeMode === 'skip',
      mergeExisting: importMergeMode === 'merge',
    };

    // If mode is 'duplicate', neither skip nor merge - it will rename and add
    if (importMergeMode === 'duplicate') {
      options.skipDuplicates = false;
      options.mergeExisting = false;
    }

    const result = importCourses(JSON.stringify(importPreview), options);
    setImportResult(result);
    loadData();
  };

  // Folder import
  const handleFolderImport = async () => {
    const result = await importFromFolder();
    if (result.errors.length === 0 && result.courses.length === 0) {
      return; // User cancelled
    }

    if (result.courses.length > 0) {
      setFolderImportCourses(result.courses);
      setFolderImportErrors(result.errors);
      setShowImportFolderPreview(true);
    } else if (result.errors.length > 0) {
      alert(t('backup.folderImportFailed') + '\n\n' + result.errors.join('\n'));
    }
  };

  const handleConfirmFolderImport = () => {
    const options = {
      skipDuplicates: importMergeMode === 'skip',
      mergeExisting: importMergeMode === 'merge',
    };
    if (importMergeMode === 'duplicate') {
      options.skipDuplicates = false;
      options.mergeExisting = false;
    }

    const result = importCoursesFromData(folderImportCourses, options);
    setImportResult(result);
    setShowImportFolderPreview(false);
    setShowImportModal(true);
    setImportPreview(null);
    loadData();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBackupLabelColor = (label?: string) => {
    switch (label) {
      case 'before-delete': return 'bg-red-100 text-red-700';
      case 'before-import': return 'bg-yellow-100 text-yellow-700';
      case 'before-restore': return 'bg-orange-100 text-orange-700';
      case 'manual': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getBackupLabelText = (label?: string) => {
    switch (label) {
      case 'before-delete': return t('backup.labelBeforeDelete');
      case 'before-import': return t('backup.labelBeforeImport');
      case 'before-restore': return t('backup.labelBeforeRestore');
      case 'manual': return t('backup.labelManual');
      default: return t('backup.labelAuto');
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-text-primary mb-2">{t('home.title')}</h1>
            <p className="text-text-secondary">{t('home.subtitle')}</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Download size={18} />
              {t('course.exportAll')}
            </button>
            <Link
              href="/archive"
              className="flex items-center gap-2 px-4 py-2 bg-text-secondary text-white rounded-lg hover:bg-text-primary transition-colors shadow-sm"
            >
              <FolderOpen size={18} />
              {t('course.oldArchive')}
            </Link>
          </div>
        </div>

        {/* Auto-save & Auto-backup settings */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-text-secondary" />
              <div>
                <h3 className="text-lg font-display font-semibold text-text-primary">{t('course.autoSaveSettings')}</h3>
                <p className="text-sm text-text-secondary">
                  {autoSaveEnabled
                    ? t('course.autoSaveEnabledDesc')
                    : t('course.autoSaveDisabledDesc')}
                </p>
              </div>
            </div>
            {autoSaveEnabled ? (
              <button
                onClick={handleDisableAutoSave}
                className="px-4 py-2 bg-text-secondary text-white rounded-lg hover:bg-text-primary transition-colors"
              >
                {t('course.disableAutoSave')}
              </button>
            ) : (
              <button
                onClick={handleSetupAutoSave}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {t('course.setupAutoSave')}
              </button>
            )}
          </div>

          {/* Auto-backup status */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium text-text-primary">{t('backup.autoBackupTitle')}</p>
                <p className="text-xs text-text-secondary">{t('backup.autoBackupDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${autoBackupEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full ${autoBackupEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {autoBackupEnabled ? t('backup.active') : t('backup.inactive')}
              </span>
            </div>
          </div>
        </div>

        {/* Import / Backup actions */}
        <div className="bg-surface rounded-lg shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">{t('backup.dataManagement')}</h3>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm">
              <FileUp size={18} />
              {t('backup.importFile')}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleFolderImport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FolderInput size={18} />
              {t('backup.importFolder')}
            </button>
            <button
              onClick={handleManualBackup}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Shield size={18} />
              {t('backup.createManual')}
            </button>
            <button
              onClick={() => { setBackups(listBackups()); setShowBackupPanel(!showBackupPanel); }}
              className="flex items-center gap-2 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
            >
              <History size={18} />
              {t('backup.viewBackups')}
              {showBackupPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Backup list panel */}
          {showBackupPanel && (
            <div className="mt-4 border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                {t('backup.savedBackups')} ({backups.length})
              </h4>
              {backups.length === 0 ? (
                <p className="text-sm text-text-secondary">{t('backup.noBackups')}</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backups.map(backup => (
                    <div key={backup.id} className="flex items-center justify-between bg-background rounded-lg p-3 border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-text-secondary flex-shrink-0" />
                          <span className="text-sm font-medium text-text-primary">
                            {new Date(backup.timestamp).toLocaleString('nb-NO')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBackupLabelColor(backup.label)}`}>
                            {getBackupLabelText(backup.label)}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {backup.courseCount} {t('backup.courses')} · {backup.totalFeedback} {t('backup.feedbackEntries')} · {formatBytes(backup.sizeBytes)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
                        >
                          <RotateCcw size={14} />
                          {t('backup.restore')}
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="p-1.5 text-danger hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create new course button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            {t('home.createCourse')}
          </button>
        </div>

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="bg-surface rounded-lg shadow-sm border border-border p-12 text-center">
            <h3 className="text-xl font-display font-semibold text-text-primary mb-2">{t('home.noCourses')}</h3>
            <p className="text-text-secondary mb-6">
              {t('home.subtitle')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium shadow-sm"
            >
              <Plus size={20} />
              {t('home.createCourse')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const completedCount = course.tests.reduce((sum, test) =>
                sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0
              );
              const totalPossible = course.students.length * course.tests.length;

              return (
                <div key={course.id} className="bg-surface rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-text-primary mb-1">{course.name}</h3>
                      {course.description && (
                        <p className="text-sm text-text-secondary mb-2">{course.description}</p>
                      )}
                      <p className="text-xs text-text-disabled">
                        {t('course.createdDate')}: {new Date(course.createdDate).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Users size={18} />
                      <span className="text-sm">
                        {course.students.length} {t('course.students').toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <FileText size={18} />
                      <span className="text-sm">
                        {course.tests.length} {t('course.tests').toLowerCase()}
                      </span>
                    </div>
                    {totalPossible > 0 && (
                      <div className="text-sm text-text-secondary">
                        {completedCount} / {totalPossible} {t('course.completedFeedback')}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/course/${course.id}`}
                    className="block text-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
                  >
                    {t('course.openCourse')}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Create course modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full border border-border">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('course.createCourseTitle')}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('course.courseNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary bg-surface"
                    placeholder={t('home.courseNamePlaceholder')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {t('course.courseDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus text-text-primary bg-surface"
                    placeholder={t('course.courseDescriptionPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCourseName('');
                    setNewCourseDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
                >
                  {t('course.createCourseButton')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import modal (file import preview + results) */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-lg w-full border border-border max-h-[80vh] overflow-y-auto">
              {importResult ? (
                // Show results
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary mb-4">{t('backup.importResults')}</h2>
                  <div className="space-y-3 mb-6">
                    {importResult.imported > 0 && (
                      <div className="flex items-center gap-2 text-success">
                        <Plus size={18} />
                        <span>{t('backup.importedCount').replace('{count}', String(importResult.imported))}</span>
                      </div>
                    )}
                    {importResult.merged > 0 && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <RotateCcw size={18} />
                        <span>{t('backup.mergedCount').replace('{count}', String(importResult.merged))}</span>
                      </div>
                    )}
                    {importResult.skippedDuplicates > 0 && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <AlertTriangle size={18} />
                        <span>{t('backup.skippedCount').replace('{count}', String(importResult.skippedDuplicates))}</span>
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-700 mb-1">{t('backup.importErrors')}:</p>
                        <ul className="text-xs text-red-600 list-disc list-inside">
                          {importResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowImportModal(false); setImportResult(null); setImportPreview(null); }}
                    className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
                  >
                    {t('common.close')}
                  </button>
                </div>
              ) : importPreview ? (
                // Show preview
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{t('backup.importPreviewTitle')}</h2>
                  <p className="text-sm text-text-secondary mb-4">{t('backup.importPreviewDesc')}</p>

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {importPreview.map((course, i) => {
                      const feedbackCount = course.tests?.reduce((sum, test) =>
                        sum + (test.studentFeedbacks?.filter(f => f.completedDate)?.length || 0), 0) || 0;
                      const existing = courses.find(c =>
                        c.id === course.id || c.name.toLowerCase() === course.name?.toLowerCase()
                      );
                      return (
                        <div key={i} className={`p-3 rounded-lg border ${existing ? 'border-yellow-300 bg-yellow-50' : 'border-border bg-background'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-text-primary">{course.name || `Course ${i + 1}`}</span>
                            {existing && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">{t('backup.duplicate')}</span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            {course.students?.length || 0} {t('course.students').toLowerCase()} · {course.tests?.length || 0} {t('course.tests').toLowerCase()} · {feedbackCount} {t('backup.feedbackEntries').toLowerCase()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Duplicate handling mode */}
                  {importPreview.some(c => courses.find(ec => ec.id === c.id || ec.name?.toLowerCase() === c.name?.toLowerCase())) && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">{t('backup.duplicateHandling')}</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="mergeMode" checked={importMergeMode === 'skip'} onChange={() => setImportMergeMode('skip')} />
                          <span className="text-sm text-text-primary">{t('backup.modeSkip')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="mergeMode" checked={importMergeMode === 'merge'} onChange={() => setImportMergeMode('merge')} />
                          <span className="text-sm text-text-primary">{t('backup.modeMerge')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="mergeMode" checked={importMergeMode === 'duplicate'} onChange={() => setImportMergeMode('duplicate')} />
                          <span className="text-sm text-text-primary">{t('backup.modeDuplicate')}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-700">
                      <Shield size={14} className="inline mr-1" />
                      {t('backup.safetyNote')}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                      className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      {t('backup.confirmImport')}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Folder import preview modal */}
        {showImportFolderPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 max-w-lg w-full border border-border max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">{t('backup.folderImportTitle')}</h2>
              <p className="text-sm text-text-secondary mb-4">{t('backup.folderImportDesc')}</p>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {folderImportCourses.map((course, i) => {
                  const feedbackCount = course.tests?.reduce((sum, test) =>
                    sum + (test.studentFeedbacks?.filter(f => f.completedDate)?.length || 0), 0) || 0;
                  const existing = courses.find(c => c.name.toLowerCase() === course.name?.toLowerCase());
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${existing ? 'border-yellow-300 bg-yellow-50' : 'border-border bg-background'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{course.name}</span>
                        {existing && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full">{t('backup.duplicate')}</span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {course.students?.length || 0} {t('course.students').toLowerCase()} · {course.tests?.length || 0} {t('course.tests').toLowerCase()} · {feedbackCount} {t('backup.feedbackEntries').toLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {folderImportErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">{t('backup.partialErrors')}:</p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside">
                    {folderImportErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Duplicate handling */}
              {folderImportCourses.some(c => courses.find(ec => ec.name?.toLowerCase() === c.name?.toLowerCase())) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">{t('backup.duplicateHandling')}</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="folderMergeMode" checked={importMergeMode === 'skip'} onChange={() => setImportMergeMode('skip')} />
                      <span className="text-sm text-text-primary">{t('backup.modeSkip')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="folderMergeMode" checked={importMergeMode === 'merge'} onChange={() => setImportMergeMode('merge')} />
                      <span className="text-sm text-text-primary">{t('backup.modeMerge')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="folderMergeMode" checked={importMergeMode === 'duplicate'} onChange={() => setImportMergeMode('duplicate')} />
                      <span className="text-sm text-text-primary">{t('backup.modeDuplicate')}</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  <Shield size={14} className="inline mr-1" />
                  {t('backup.safetyNote')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowImportFolderPreview(false); setFolderImportCourses([]); }}
                  className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmFolderImport}
                  className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {t('backup.confirmImport')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
