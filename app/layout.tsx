import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'MD Construction - Project Manager',
  description: 'Professional construction project management system with multi-company support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
