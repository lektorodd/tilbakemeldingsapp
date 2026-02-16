// Barrel re-export: all storage functions from courseStorage
export {
    // Course CRUD
    saveCourse,
    loadAllCourses,
    loadCourse,
    deleteCourse,
    updateCourse,
    getCourseSummaries,

    // Student operations
    addStudentToCourse,
    updateStudent,
    deleteStudent,

    // Test operations
    addTestToCourse,
    updateTest,
    deleteTest,

    // Feedback operations
    updateStudentFeedback,
    getStudentFeedback,

    // Oral Test CRUD
    addOralTest,
    updateOralTest,
    deleteOralTest,

    // Oral Assessment
    updateOralAssessment,
    getOralAssessment,
    deleteOralAssessment,
    calculateOralScore,

    // Scoring
    calculateStudentScore,
    calculateMaxScore,

    // Analytics
    getStudentProgress,
    getTestResults,
    getLabelPerformance,
    getCategoryPerformance,
    getStudentDetailedAnalytics,
    getTestTaskAnalytics,
    getTaskStudentScores,

    // Folder sync
    syncFromFolder,
    migrateToFolder,

    // Backup system
    createBackup,
    listBackups,
    restoreFromBackup,
    deleteBackup,
    startAutoBackup,
    stopAutoBackup,
    isAutoBackupRunning,

    // Import / Export
    importFromFolder,
    exportAllCourses,
    importCourses,
    importCoursesFromData,
    validateCourseData,

    // Safe delete
    safeDeleteCourse,
    safeDeleteTest,
    safeDeleteStudent,
} from './courseStorage';

// Re-export types/interfaces
export type { BackupEntry, ImportResult } from './courseStorage';
