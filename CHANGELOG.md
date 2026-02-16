# Changelog

All notable changes to MatteMonitor will be documented in this file.

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
