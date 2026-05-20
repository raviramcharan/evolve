'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, Dumbbell, Utensils, TrendingUp } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/check-in', label: 'Check-in', icon: ClipboardCheck },
  { href: '/training', label: 'Training', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
]

const HIDDEN_ON = ['/login', '/onboarding', '/signup', '/coach']

export function MobileNav() {
  const pathname = usePathname()

  const isHidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))
  if (isHidden) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                isActive ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
