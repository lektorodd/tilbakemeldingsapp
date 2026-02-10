import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGradingShortcuts } from '@/hooks/useGradingShortcuts';

describe('useGradingShortcuts', () => {
  let addEventSpy: ReturnType<typeof vi.spyOn>;
  let removeEventSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventSpy = vi.spyOn(window, 'addEventListener');
    removeEventSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventSpy.mockRestore();
    removeEventSpy.mockRestore();
  });

  it('registers keydown listener when enabled', () => {
    renderHook(() => useGradingShortcuts({ enabled: true }));
    expect(addEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('does not register listener when disabled', () => {
    renderHook(() => useGradingShortcuts({ enabled: false }));
    expect(addEventSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls onSetPoints for number keys 0-6', () => {
    const onSetPoints = vi.fn();
    renderHook(() => useGradingShortcuts({ onSetPoints, enabled: true }));

    for (let i = 0; i <= 6; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: String(i) }));
    }
    expect(onSetPoints).toHaveBeenCalledTimes(7);
    expect(onSetPoints).toHaveBeenCalledWith(0);
    expect(onSetPoints).toHaveBeenCalledWith(6);
  });

  it('does not call onSetPoints for keys 7-9', () => {
    const onSetPoints = vi.fn();
    renderHook(() => useGradingShortcuts({ onSetPoints, enabled: true }));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '8' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));
    expect(onSetPoints).not.toHaveBeenCalled();
  });

  it('calls onNextStudent for Alt+ArrowRight', () => {
    const onNextStudent = vi.fn();
    renderHook(() => useGradingShortcuts({ onNextStudent, enabled: true }));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true }));
    expect(onNextStudent).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviousStudent for Alt+ArrowLeft', () => {
    const onPreviousStudent = vi.fn();
    renderHook(() => useGradingShortcuts({ onPreviousStudent, enabled: true }));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }));
    expect(onPreviousStudent).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleComplete for Alt+Enter', () => {
    const onToggleComplete = vi.fn();
    renderHook(() => useGradingShortcuts({ onToggleComplete, enabled: true }));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', altKey: true }));
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useGradingShortcuts({ enabled: true }));
    unmount();
    expect(removeEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
