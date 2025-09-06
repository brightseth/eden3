import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Providers } from '@/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'EDEN3 Academy',
    template: '%s | EDEN3 Academy',
  },
  description: 'Next Generation AI Agents Platform - Training, Observatory, Portfolio & Showcase',
  keywords: ['AI', 'Agents', 'EDEN3', 'Blockchain', 'NFT', 'Digital Art', 'Training'],
  authors: [{ name: 'EDEN3 Team' }],
  creator: 'EDEN3',
  publisher: 'EDEN3',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://academy.eden3.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://academy.eden3.ai',
    siteName: 'EDEN3 Academy',
    title: 'EDEN3 Academy - Next Generation AI Agents Platform',
    description: 'Train, monitor, and showcase AI agents in the EDEN3 ecosystem',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EDEN3 Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDEN3 Academy - Next Generation AI Agents Platform',
    description: 'Train, monitor, and showcase AI agents in the EDEN3 ecosystem',
    images: ['/og-image.png'],
    creator: '@eden3ai',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}