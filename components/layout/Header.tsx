'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'

interface HeaderProps {
  showBack?: boolean
  title?: string
}

export function Header({ showBack, title }: HeaderProps) {
  const router = useRouter()
  const isHome = !showBack && !title

  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-bg sticky top-0 z-40">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="mr-3 text-muted hover:text-text transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="flex-1">
        {title ? (
          <h1 className="font-display text-lg font-semibold text-text">{title}</h1>
        ) : (
          <Link href="/dashboard" className="font-display text-xl font-bold text-accent tracking-tight">
            Evolve
          </Link>
        )}
      </div>
      {isHome && (
        <Link href="/settings" className="text-muted hover:text-text transition-colors" aria-label="Settings">
          <Settings size={20} />
        </Link>
      )}
    </header>
  )
}
