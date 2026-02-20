'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// --- Toast types ---
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// --- Confirm types ---
interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface NotificationContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string, title?: string, options?: { confirmLabel?: string; cancelLabel?: string }) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Toast Component ---
function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle size={18} className="text-danger flex-shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />,
    info: <Info size={18} className="text-info flex-shrink-0" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={`flex items-start gap-3 bg-surface border border-border border-l-4 ${borderColors[t.type]} rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-[440px] animate-slide-in`}
      role="alert"
    >
      {icons[t.type]}
      <p className="text-sm text-text-primary flex-1 break-words">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-text-disabled hover:text-text-secondary transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// --- Confirm Modal Component ---
function ConfirmModal({
  state,
  onConfirm,
  onCancel,
}: {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]" onClick={onCancel}>
      <div
        className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {state.title && (
          <h2 className="text-lg font-display font-bold text-text-primary mb-3">{state.title}</h2>
        )}
        <p className="text-text-secondary whitespace-pre-line mb-6">{state.message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition"
          >
            {state.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
            autoFocus
          >
            {state.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Provider ---
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
  });

  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback(
    (message: string, title?: string, options?: { confirmLabel?: string; cancelLabel?: string }): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        confirmResolveRef.current = resolve;
        setConfirmState({
          open: true,
          title: title || '',
          message,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    confirmResolveRef.current?.(true);
    confirmResolveRef.current = null;
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    confirmResolveRef.current?.(false);
    confirmResolveRef.current = null;
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        state={confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
