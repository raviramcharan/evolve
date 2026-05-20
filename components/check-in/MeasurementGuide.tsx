'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Ruler } from 'lucide-react'

const STORAGE_KEY = 'evolve_measurement_guide_collapsed'

const GENERAL_RULES = [
  { icon: '🌅', text: 'Measure first thing in the morning, before eating or drinking' },
  { icon: '📏', text: 'Use a soft fabric tape measure — not a metal one' },
  { icon: '👕', text: 'Wear minimal clothing so the tape sits directly on skin' },
  { icon: '🧍', text: "Stand relaxed — don't flex your muscles or hold your breath" },
  { icon: '📍', text: 'Measure the exact same spot every week — consistency beats precision' },
  { icon: '🔄', text: 'Pull the tape snug but not tight — it should not indent the skin' },
  { icon: '✌️', text: 'Measure twice per site and average if they differ by more than 0.5 cm' },
]

const SITE_GUIDES = [
  { site: 'Waist',    instructions: 'Find the narrowest point of your torso, typically 2–3 cm above your navel. Breathe out naturally before reading.' },
  { site: 'Hips',     instructions: 'Stand with feet together. Measure around the widest point of your hips and glutes, usually 20–23 cm below your navel.' },
  { site: 'Chest',    instructions: 'Place the tape under your armpits and across the fullest part of your chest. Keep arms relaxed at your sides.' },
  { site: 'Shoulders',instructions: 'Measure across the widest point of both shoulders with the tape horizontal to the floor. Arms at sides.' },
  { site: 'Neck',     instructions: "Measure around the narrowest part of your neck, just below the larynx (Adam's apple). Look straight ahead." },
  { site: 'Arms',     instructions: 'Measure the largest part of your upper arm (bicep peak) with your arm hanging relaxed at your side. Measure both sides.' },
  { site: 'Thighs',   instructions: 'Stand with feet slightly apart. Measure the largest part of your upper thigh. Measure both sides.' },
]

export function MeasurementGuide() {
  const [collapsed, setCollapsed] = useState(true)
  const [openSite, setOpenSite] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setCollapsed(stored === 'true')
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
      <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Ruler size={16} className="text-accent" />
          How to measure correctly
        </div>
        {collapsed ? <ChevronDown size={16} className="text-muted" /> : <ChevronUp size={16} className="text-muted" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <ol className="space-y-2">
            {GENERAL_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text">
                <span className="text-base leading-tight">{rule.icon}</span>
                <span>{rule.text}</span>
              </li>
            ))}
          </ol>

          <div className="space-y-1">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Per site guidance</p>
            {SITE_GUIDES.map((s) => (
              <div key={s.site} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenSite(openSite === s.site ? null : s.site)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-text"
                >
                  {s.site}
                  <ChevronDown
                    size={14}
                    className={`text-muted transition-transform ${openSite === s.site ? 'rotate-180' : ''}`}
                  />
                </button>
                {openSite === s.site && (
                  <p className="px-3 pb-3 text-sm text-muted">{s.instructions}</p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-text">
            <strong className="text-accent">Pro tip:</strong> Your measurements tell a more accurate story than the scale. Muscle gain and fat loss can cancel out on the scale — but your waist shrinking while your chest grows is exactly what getting shredded looks like.
          </div>
        </div>
      )}
    </div>
  )
}
