import type { Metadata } from 'next'
import './globals.css'

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
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
