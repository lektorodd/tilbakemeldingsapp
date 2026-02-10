'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <ErrorBoundary>
          <Navbar />
          {children}
        </ErrorBoundary>
      </NotificationProvider>
    </LanguageProvider>
  );
}
