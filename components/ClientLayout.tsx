'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SyncProvider } from '@/contexts/SyncContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SyncProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <Navbar />
            {children}
          </ErrorBoundary>
        </NotificationProvider>
      </SyncProvider>
    </LanguageProvider>
  );
}
