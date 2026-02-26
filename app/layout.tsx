import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'MathMonitor',
  description: 'Modern app for giving feedback on math tests with PDF export',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts are self-hosted via @font-face in globals.css — no external requests */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
