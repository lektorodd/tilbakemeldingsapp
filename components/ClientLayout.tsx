'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
