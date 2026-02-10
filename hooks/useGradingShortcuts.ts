import { useEffect, useCallback } from 'react';

interface UseGradingShortcutsOptions {
  onSetPoints?: (points: number) => void;
  onNextStudent?: () => void;
  onPreviousStudent?: () => void;
  onToggleComplete?: () => void;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for the grading interface:
 * - 0-6: Set points for the focused task
 * - Alt+ArrowRight / Alt+ArrowDown: Next student
 * - Alt+ArrowLeft / Alt+ArrowUp: Previous student
 * - Alt+Enter: Toggle complete
 */
export function useGradingShortcuts({
  onSetPoints,
  onNextStudent,
  onPreviousStudent,
  onToggleComplete,
  enabled = true,
}: UseGradingShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in text inputs/textareas
    const target = e.target as HTMLElement;
    const isTextInput = target.tagName === 'TEXTAREA' ||
      (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text') ||
      target.isContentEditable;

    // Number keys 0-6 for setting points (only when not typing in text fields)
    if (!isTextInput && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const num = parseInt(e.key);
      if (num >= 0 && num <= 6 && onSetPoints) {
        e.preventDefault();
        onSetPoints(num);
        return;
      }
    }

    // Alt+Arrow navigation for students
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && onNextStudent) {
        e.preventDefault();
        onNextStudent();
        return;
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && onPreviousStudent) {
        e.preventDefault();
        onPreviousStudent();
        return;
      }
      if (e.key === 'Enter' && onToggleComplete) {
        e.preventDefault();
        onToggleComplete();
        return;
      }
    }
  }, [enabled, onSetPoints, onNextStudent, onPreviousStudent, onToggleComplete]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
