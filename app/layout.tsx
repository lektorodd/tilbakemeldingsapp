import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export const metadata: Metadata = {
  title: 'Math Test Feedback App',
  description: 'Simple app for giving feedback on math tests with PDF export',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <LanguageProvider>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSelector />
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
