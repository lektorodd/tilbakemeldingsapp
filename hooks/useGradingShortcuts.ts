import { useEffect, useCallback } from 'react';

export interface TaskSlot {
  taskId: string;
  subtaskId?: string;
}

interface UseGradingShortcutsOptions {
  onSetPoints?: (points: number) => void;
  onNextStudent?: () => void;
  onPreviousStudent?: () => void;
  onToggleComplete?: () => void;
  onNextTask?: () => void;
  onPreviousTask?: () => void;
  onFocusComment?: () => void;
  onFocusPoints?: () => void;
  onSwitchToTaskGrading?: () => void;
  onNextTaskSlot?: () => void;
  onPrevTaskSlot?: () => void;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for the grading interface:
 * - 0-6: Set points for the active task
 * - Tab / Shift+Tab: Next / previous task
 * - Enter: Switch from points to comment (when not in textarea)
 * - Escape: Switch from comment back to points
 * - Alt+ArrowRight / Alt+ArrowDown: Next student
 * - Alt+ArrowLeft / Alt+ArrowUp: Previous student
 * - Alt+Enter: Toggle complete
 */
export function useGradingShortcuts({
  onSetPoints,
  onNextStudent,
  onPreviousStudent,
  onToggleComplete,
  onNextTask,
  onPreviousTask,
  onFocusComment,
  onFocusPoints,
  onSwitchToTaskGrading,
  onNextTaskSlot,
  onPrevTaskSlot,
  enabled = true,
}: UseGradingShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === 'TEXTAREA';
    const isTextInput = isTextarea ||
      (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text') ||
      target.isContentEditable;

    // Alt+key combinations (work everywhere)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if ((e.key === 'ArrowRight') && onNextTaskSlot) {
        e.preventDefault();
        onNextTaskSlot();
        return;
      }
      if ((e.key === 'ArrowLeft') && onPrevTaskSlot) {
        e.preventDefault();
        onPrevTaskSlot();
        return;
      }
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !onNextTaskSlot && onNextStudent) {
        e.preventDefault();
        onNextStudent();
        return;
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !onPrevTaskSlot && onPreviousStudent) {
        e.preventDefault();
        onPreviousStudent();
        return;
      }
      if ((e.key === 'ArrowDown') && onNextStudent) {
        e.preventDefault();
        onNextStudent();
        return;
      }
      if ((e.key === 'ArrowUp') && onPreviousStudent) {
        e.preventDefault();
        onPreviousStudent();
        return;
      }
      if (e.key === 'Enter' && onToggleComplete) {
        e.preventDefault();
        onToggleComplete();
        return;
      }
      if (e.code === 'KeyT' && onSwitchToTaskGrading) {
        e.preventDefault();
        onSwitchToTaskGrading();
        return;
      }
    }

    // Escape from textarea: go back to points mode
    if (isTextarea && e.key === 'Escape' && onFocusPoints) {
      e.preventDefault();
      (target as HTMLTextAreaElement).blur();
      onFocusPoints();
      return;
    }

    // Don't trigger remaining shortcuts when typing in text fields
    if (isTextInput) return;

    // Number keys 0-6 for setting points
    if (!e.altKey && !e.ctrlKey && !e.metaKey) {
      const num = parseInt(e.key);
      if (num >= 0 && num <= 6 && onSetPoints) {
        e.preventDefault();
        onSetPoints(num);
        return;
      }
    }

    // Tab / Shift+Tab for task navigation
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.shiftKey && onPreviousTask) {
        e.preventDefault();
        onPreviousTask();
        return;
      }
      if (!e.shiftKey && onNextTask) {
        e.preventDefault();
        onNextTask();
        return;
      }
    }

    // Enter to switch to comment textarea
    if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.metaKey && onFocusComment) {
      e.preventDefault();
      onFocusComment();
      return;
    }
  }, [enabled, onSetPoints, onNextStudent, onPreviousStudent, onToggleComplete, onNextTask, onPreviousTask, onFocusComment, onFocusPoints, onSwitchToTaskGrading, onNextTaskSlot, onPrevTaskSlot]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
