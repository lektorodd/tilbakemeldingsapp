'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { SyncProvider } from '@/contexts/SyncContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PreferencesProvider>
        <SyncProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Navbar />
              {children}
            </ErrorBoundary>
          </NotificationProvider>
        </SyncProvider>
      </PreferencesProvider>
    </LanguageProvider>
  );
}
