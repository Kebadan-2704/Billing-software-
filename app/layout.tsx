import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mdsystems.com'),
  title: {
    default: 'MD SYSTEMS | Enterprise Intelligence',
    template: '%s | MD SYSTEMS'
  },
  description: 'Professional construction project management system and enterprise billing solution with multi-company support.',
  keywords: ['billing software', 'enterprise intelligence', 'construction management', 'invoice generation', 'MD Systems', 'business tools'],
  authors: [{ name: 'MD Systems' }],
  creator: 'MD Systems',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mdsystems.com',
    title: 'MD SYSTEMS | Enterprise Intelligence',
    description: 'Professional construction project management system and enterprise billing solution.',
    siteName: 'MD Systems',
    images: [{
      url: '/md-logo-01.png',
      width: 800,
      height: 600,
      alt: 'MD Systems Logo'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MD SYSTEMS | Enterprise Intelligence',
    description: 'Professional construction project management system and enterprise billing solution.',
    images: ['/md-logo-01.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
