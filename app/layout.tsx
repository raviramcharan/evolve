import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { NavWrapper } from '@/components/layout/NavWrapper'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Evolve — Personal Fitness Coaching',
  description: 'Your 12-week personal fitness coaching companion.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text font-sans min-h-screen">
        <main className="max-w-lg mx-auto min-h-screen pb-24">
          {children}
        </main>
        <NavWrapper />
      </body>
    </html>
  )
}
