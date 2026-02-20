'use client';

import { useState, useEffect, useRef } from 'react';
import { Course } from '@/types';
import {
  loadAllCourses,
  saveCourse,
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
  migrateToFolder,
  BackupEntry,
  ImportResult,
} from '@/utils/storage';
import {
  chooseFolderAndConnect,
  disconnectFolder,
  getFolderName,
} from '@/utils/folderSync';
import { migrateSnippetsToFolder } from '@/utils/snippetStorage';
import {
  Plus, Trash2, Users, FileText, Settings, Download, FolderOpen,
  Upload, Shield, Clock, RotateCcw, AlertTriangle, ChevronDown,
  ChevronUp, FolderInput, FileUp, History, Cloud, CloudOff, X
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useSync } from '@/contexts/SyncContext';
import CreateCourseModal from '@/components/CreateCourseModal';
import BackupPanel from '@/components/BackupPanel';
import ImportModal from '@/components/ImportModal';

export default function CoursesPage() {
  const { t } = useLanguage();
  const { toast, confirm } = useNotification();
  const { folderConnected, folderName, folderInitDone, refreshFolderStatus } = useSync();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
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

  const [folderSyncing, setFolderSyncing] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [folderNudgeDismissed, setFolderNudgeDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('folder-nudge-dismissed') === 'true';
    }
    return false;
  });

  // Load data once folder init is done (runs on every page, init happens in SyncContext)
  useEffect(() => {
    if (!folderInitDone) return;

    loadData();
    setAutoBackupEnabled(isAutoBackupRunning());

    if (!isAutoBackupRunning()) {
      startAutoBackup();
      setAutoBackupEnabled(true);
    }
  }, [folderInitDone]);

  const loadData = () => {
    const allCourses = loadAllCourses();
    setCourses(allCourses);
    setBackups(listBackups());
  };

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      toast(t('course.courseNameRequired'), 'warning');
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

    saveCourse(newCourse);

    setNewCourseName('');
    setNewCourseDescription('');
    setShowCreateModal(false);
    loadData();
  };

  const handleDeleteCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const feedbackCount = course?.tests.reduce((sum, test) =>
      sum + test.studentFeedbacks.filter(f => f.completedDate).length, 0) || 0;

    const warningMsg = feedbackCount > 0
      ? t('course.deleteConfirmFull') + `\n\n${t('backup.warningFeedbackCount').replace('{count}', String(feedbackCount))}\n${t('backup.autoBackupCreated')}`
      : t('course.deleteConfirmFull') + `\n\n${t('backup.autoBackupCreated')}`;

    if (await confirm(warningMsg)) {
      safeDeleteCourse(courseId);
      loadData();
    }
  };

  const handleConnectFolder = async () => {
    setFolderSyncing(true);
    try {
      const success = await chooseFolderAndConnect();
      if (success) {
        // Migrate existing localStorage data to the folder
        await migrateToFolder();
        await migrateSnippetsToFolder();
        // Save current language setting
        const lang = localStorage.getItem('language') || 'nb';
        const { saveSettingsToFolder } = await import('@/utils/folderSync');
        await saveSettingsToFolder({ language: lang as 'en' | 'nb' | 'nn' });

        refreshFolderStatus();
        toast(t('course.folderConnected'), 'success');
      }
    } catch (e) {
      console.error('Failed to connect folder:', e);
    } finally {
      setFolderSyncing(false);
    }
  };

  const handleDisconnectFolder = async () => {
    if (await confirm(t('course.folderDisconnectConfirm'))) {
      await disconnectFolder();
      refreshFolderStatus();
    }
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
      toast(t('backup.manualCreated'), 'success');
    } else {
      toast(t('backup.createFailed'), 'error');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    const msg = t('backup.restoreConfirm')
      .replace('{date}', new Date(backup.timestamp).toLocaleString('nb-NO'))
      .replace('{courses}', String(backup.courseCount))
      .replace('{feedback}', String(backup.totalFeedback));

    if (await confirm(msg)) {
      const result = restoreFromBackup(backupId);
      if (result.success) {
        loadData();
        toast(t('backup.restoreSuccess').replace('{count}', String(result.courseCount)), 'success');
      } else {
        toast(t('backup.restoreFailed'), 'error');
      }
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (await confirm(t('backup.deleteConfirm'))) {
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
        toast(t('backup.invalidFileFormat'), 'error');
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
      toast(t('backup.folderImportFailed') + '\n\n' + result.errors.join('\n'), 'error');
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

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header — title + primary action */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-text-primary mb-2">{t('home.title')}</h1>
            <p className="text-text-secondary">{t('home.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            {t('home.createCourse')}
          </button>
        </div>

        {/* Folder nudge banner — shown when courses exist but no folder connected */}
        {!folderConnected && !folderNudgeDismissed && courses.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">{t('course.folderNudgeTitle')}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{t('course.folderNudgeDesc')}</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleConnectFolder}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  {t('course.folderConnect')}
                </button>
                <button
                  onClick={() => {
                    setFolderNudgeDismissed(true);
                    localStorage.setItem('folder-nudge-dismissed', 'true');
                  }}
                  className="px-4 py-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 text-sm"
                >
                  {t('course.folderNudgeDismiss')}
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setFolderNudgeDismissed(true);
                localStorage.setItem('folder-nudge-dismissed', 'true');
              }}
              className="text-amber-400 hover:text-amber-600 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Courses grid — PRIMARY CONTENT */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map(course => {
              const completedCount = course.tests.reduce((sum, test) =>
                sum + test.studentFeedbacks.filter(f => f.completedDate && !f.absent).length, 0
              );
              const absentCount = course.tests.reduce((sum, test) =>
                sum + test.studentFeedbacks.filter(f => f.absent).length, 0
              );
              const totalPossible = course.students.length * course.tests.length - absentCount;
              const progressPercent = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

              return (
                <div key={course.id} className="bg-surface rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-text-primary mb-1">{course.name}</h3>
                      {course.description && (
                        <p className="text-sm text-text-secondary mb-2 line-clamp-2">{course.description}</p>
                      )}
                      <p className="text-xs text-text-disabled">
                        {t('course.createdDate')}: {new Date(course.createdDate).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-danger hover:bg-danger-bg dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={16} />
                      {course.students.length} {t('course.students').toLowerCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText size={16} />
                      {course.tests.length} {t('course.tests').toLowerCase()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {totalPossible > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                        <span>{completedCount} / {totalPossible} {t('course.completedFeedback')}</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-success' : progressPercent > 50 ? 'bg-brand' : 'bg-brand'
                            }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/course/${course.id}`}
                    className="block text-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium mt-auto"
                  >
                    {t('course.openCourse')}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsible Settings & Tools panel */}
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden mt-8">
          <button
            onClick={() => setShowToolsPanel(!showToolsPanel)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-text-secondary" />
              <span className="text-lg font-display font-semibold text-text-primary">{t('home.settingsAndTools')}</span>
              {/* Status pills */}
              <div className="flex items-center gap-2">
                {folderConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Cloud size={12} />
                    {folderName}
                  </span>
                )}
                {autoBackupEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {t('backup.active')}
                  </span>
                )}
              </div>
            </div>
            {showToolsPanel ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
          </button>

          {showToolsPanel && (
            <div className="border-t border-border p-6 space-y-6">
              {/* Row 1: Folder storage + Auto-backup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Folder storage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {folderConnected ? (
                      <Cloud size={22} className="text-success" />
                    ) : (
                      <CloudOff size={22} className="text-text-secondary" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{t('course.folderStorageTitle')}</h4>
                      <p className="text-xs text-text-secondary">
                        {folderConnected
                          ? t('course.folderStorageConnectedDesc').replace('{folder}', folderName || '')
                          : t('course.folderStorageDisconnectedDesc')}
                      </p>
                    </div>
                  </div>
                  {folderSyncing ? (
                    <span className="px-3 py-1.5 text-xs text-text-secondary">{t('course.folderSyncing')}</span>
                  ) : folderConnected ? (
                    <button
                      onClick={handleDisconnectFolder}
                      className="px-3 py-1.5 text-xs bg-text-secondary text-white rounded-lg hover:bg-text-primary transition-colors"
                    >
                      {t('course.folderDisconnect')}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectFolder}
                      className="px-3 py-1.5 text-xs bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      {t('course.folderConnect')}
                    </button>
                  )}
                </div>

                {/* Auto-backup status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-success" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{t('backup.autoBackupTitle')}</p>
                      <p className="text-xs text-text-secondary">{t('backup.autoBackupDesc')}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${autoBackupEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-surface-alt dark:bg-neutral-800 text-text-secondary dark:text-text-disabled'}`}>
                    <span className={`w-2 h-2 rounded-full ${autoBackupEnabled ? 'bg-green-500' : 'bg-text-disabled'}`}></span>
                    {autoBackupEnabled ? t('backup.active') : t('backup.inactive')}
                  </span>
                </div>
              </div>

              {/* Row 2: Action buttons */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">{t('backup.dataManagement')}</h4>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-success text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm">
                    <FileUp size={16} />
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    <FolderInput size={16} />
                    {t('backup.importFolder')}
                  </button>
                  <button
                    onClick={handleManualBackup}
                    className="flex items-center gap-2 px-3 py-1.5 bg-info text-white rounded-lg hover:bg-info transition-colors text-sm"
                  >
                    <Shield size={16} />
                    {t('backup.createManual')}
                  </button>
                  <button
                    onClick={() => { setBackups(listBackups()); setShowBackupPanel(!showBackupPanel); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-surface-alt dark:hover:bg-neutral-700 transition-colors text-sm"
                  >
                    <History size={16} />
                    {t('backup.viewBackups')}
                    {showBackupPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={handleExportAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm"
                  >
                    <Download size={16} />
                    {t('course.exportAll')}
                  </button>
                  <Link
                    href="/archive"
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-surface-alt dark:hover:bg-neutral-700 transition-colors text-sm"
                  >
                    <FolderOpen size={16} />
                    {t('course.oldArchive')}
                  </Link>
                </div>
              </div>

              {/* Backup list panel */}
              {showBackupPanel && (
                <BackupPanel
                  backups={backups}
                  onRestore={handleRestoreBackup}
                  onDelete={handleDeleteBackup}
                />
              )}
            </div>
          )}
        </div>

        {/* Create course modal */}
        {showCreateModal && (
          <CreateCourseModal
            onClose={() => { setShowCreateModal(false); setNewCourseName(''); setNewCourseDescription(''); }}
            onCreate={(name, description) => {
              if (!name.trim()) {
                toast(t('course.courseNameRequired'), 'warning');
                return;
              }
              const newCourse: Course = {
                id: `course-${Date.now()}`,
                name,
                description,
                students: [],
                tests: [],
                availableLabels: [],
                createdDate: new Date().toISOString(),
                lastModified: new Date().toISOString(),
              };
              saveCourse(newCourse);
              setShowCreateModal(false);
              loadData();
            }}
          />
        )}

        {/* Import modal (file import preview + results) */}
        {showImportModal && (
          <ImportModal
            importResult={importResult}
            importPreview={importPreview}
            existingCourses={courses}
            importMergeMode={importMergeMode}
            onMergeModeChange={setImportMergeMode}
            onConfirmImport={handleConfirmImport}
            onClose={() => { setShowImportModal(false); setImportResult(null); setImportPreview(null); }}
          />
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
                    <div key={i} className={`p-3 rounded-lg border ${existing ? 'border-warning bg-warning-bg' : 'border-border bg-background'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{course.name}</span>
                        {existing && (
                          <span className="text-xs px-2 py-0.5 bg-warning-bg text-warning rounded-full">{t('backup.duplicate')}</span>
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
                <div className="bg-warning-bg border border-warning rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-warning mb-1">{t('backup.partialErrors')}:</p>
                  <ul className="text-xs text-warning list-disc list-inside">
                    {folderImportErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Duplicate handling */}
              {folderImportCourses.some(c => courses.find(ec => ec.name?.toLowerCase() === c.name?.toLowerCase())) && (
                <div className="mb-4 p-3 bg-warning-bg border border-warning rounded-lg">
                  <p className="text-sm font-medium text-warning mb-2">{t('backup.duplicateHandling')}</p>
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

              <div className="bg-info-bg border border-info rounded-lg p-3 mb-4">
                <p className="text-xs text-info">
                  <Shield size={14} className="inline mr-1" />
                  {t('backup.safetyNote')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowImportFolderPreview(false); setFolderImportCourses([]); }}
                  className="flex-1 px-4 py-2 bg-surface-alt text-text-primary border border-border rounded-lg hover:bg-surface-alt transition-colors font-medium"
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
