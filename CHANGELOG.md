# Changelog

All notable changes to MatteMonitor will be documented in this file.

## [0.7.1] — 2026-02-19

### Fixed
- **Download PDF button** — the download button next to Preview was invisible (only appeared on hover) due to an incompatible Tailwind opacity modifier on CSS-variable-based colors. Fixed on both written and oral test pages.

---

## [0.6.1] — 2026-02-19

### Improved
- **Student dashboard** — absent tests now show a distinct grey "Absent" card instead of misleading "0/60".
- **Progress card** — replaced static "latest score" with a sparkline chart + trend arrow (↗ +N / ↘ -N) across all completed tests.
- **Task-grading layout** — student cards now use a two-column grid on wider screens for better use of space.

---

## [0.6.0] — 2026-02-19

### Added
- **Absent students** — mark students as not present on a per-test basis. Absent students are excluded from progress bars, analytics, heatmap, PDF export, and Excel export. Toggle absence via the person icon in the student list sidebar.
- **Typst math snippets** — pre-defined math snippet buttons for quick insertion of common Typst expressions.

### Changed
- **Removed version badge** from the navbar header for a cleaner look.

---

## [0.5.0] — 2026-02-18

### Added
- **Class progress chart** — new dual-axis chart on the course analytics page showing average score and blank-answer percentage over time.
- **Hierarchical labels** — labels now support parent/child nesting (e.g., `sannsyn/grunnleggande`). Grouped display with collapsible sections in the label manager and throughout analytics.
- **PDF preview modal** — preview generated PDFs before exporting.
- **Inter font** — switched the interface body font from Source Sans Pro to Inter for a cleaner look. Inter font files also bundled for PDF export.
- New `labelUtils.ts` utility module for label grouping and formatting.

### Changed
- **Front page redesign** — courses moved to the top for quick access; admin tools (backup, import/export, folder sync) collapsed into a dedicated panel.
- **PDF template overhaul** — modern table styling with rounded-corner blocks, color-coded scores (green ≥ 5, red ≤ 2), semibold task labels, and scores shown as points only (not fractions).
- **Ungraded tasks** — `TaskFeedback.points` can now be `null` (ungraded) instead of defaulting to `0`. All analytics, scoring, and export logic updated to handle nullable points. Includes an automatic data migration for existing data.
- **SyncContext centralization** — folder-sync initialization moved from the courses page into `SyncContext`, so sync works correctly on all pages.
- **Course deduplication** — `loadAllCourses()` now deduplicates on read as a safety net against prior sync bugs.
- Norwegian PDF translations refined (`student` → `Namn`).
- Updated translations (en, nb, nn) with new i18n keys for labels and charts.

---

## [0.4.0] — 2026-02-16

### Added
- **Task weighting** — each task can now have a custom weight (integer ≥ 1) that controls how much it contributes to the overall score. Tasks without an explicit weight default to 1.
- Weight input field in the task configuration UI, placed beside the task label.
- i18n keys for weight label in English, Bokmål, and Nynorsk.
- 4 new unit tests for weighted scoring scenarios.

### Changed
- **Scoring algorithm**: `calculateStudentScore()` now computes a weighted average. For tasks with subtasks, subtask scores are averaged at the task level first, then each task's average is weighted. This fixes unfairness where tasks with many subtasks dominated the score.
- Updated "mixed tasks" test to reflect the corrected scoring behavior.

---

## [0.3.0] — 2026-02-16

### Added
- **Sync status indicator** in the navbar — shows folder connection state (connected / syncing / saved / error) with hover tooltip displaying folder name and last sync time.
- **Progress grid** on the grading page — student × task heatmap with color-coded cells (green 5-6, amber 3-4, red 1-2, blue comment-only). Click any row to select that student.
- **Dark mode** — sun/moon toggle in navbar, system preference detection, localStorage + folder sync persistence. All existing UI auto-adapts via CSS custom properties.
- **Version display** — `v0.3.0` badge shown in the navbar.
- **Test coverage** — 46 new unit tests (84 total across 6 suites) for merge logic, backup/restore, and import/export.
- `SyncContext` for global sync state management.
- `localStorage` mock setup for Vitest/jsdom test environment.

### Changed
- Exported `mergeFeedbacks` and `mergeTests` from storage barrel for direct unit testing.
- `saveSettingsToFolder` now accepts `Partial<AppSettings>` and merges with existing settings.
- All semantic Tailwind colors converted to CSS custom properties for theme switching.

## [0.2.0] — 2026-02-16

### Fixed
- **Data-loss bug**: `syncFromFolder()` no longer overwrites in-progress feedback on page load. Replaced destructive sync with smart bidirectional merge that preserves work in both localStorage and the connected folder.
- **Port conflict**: Dev server now runs on a fixed port (3333) to prevent localStorage data being split across different ports.

### Changed
- **Refactored storage layer**: Moved `courseStorage.ts` into `utils/storage/` module with barrel `index.ts` re-exporting all functions. All imports updated.
- Removed legacy auto-save system (`autoSaveCourse`, `setupAutoSaveDirectory`, related UI) — superseded by folder sync.

### Removed
- Deleted dead code files: `utils/storage.ts`, `utils/testStorage.ts` (zero imports).

### Added
- Folder connection nudge banner: warns users when courses exist but no folder is connected, encouraging safer storage.
- Translations for nudge banner in English, Norwegian Bokmål, and Norwegian Nynorsk.

## [0.1.0] — Initial Release

- Course, student, and test management
- 0–6 point grading with Typst math notation
- PDF export via Typst CLI
- Oral assessment grading (LK20 dimensions)
- Analytics dashboards (label, category, test part performance)
- localStorage + File System API folder sync
- Auto-backup system (5-minute rolling backups)
- JSON export/import
- Multi-language support (en, nb, nn)
- Keyboard shortcuts for efficient grading
- Reusable snippet library
