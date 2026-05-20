'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings } from 'lucide-react'

const TABS = [
  { href: '/coach/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/coach/clients',   icon: Users,            label: 'Clients'   },
  { href: '/coach/settings',  icon: Settings,         label: 'Settings'  },
]

const HIDDEN_ON = ['/coach/signup', '/coach/onboarding']

export function CoachNav() {
  const pathname = usePathname()

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/coach/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                active ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
