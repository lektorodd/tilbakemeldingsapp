import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
