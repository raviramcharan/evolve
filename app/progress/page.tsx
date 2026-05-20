'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { habitScore } from '@/lib/calculations'
import { formatDate, formatWeight } from '@/lib/formatters'
import { WeightChart } from '@/components/dashboard/WeightChart'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { CheckIn, Program } from '@/types'
import Link from 'next/link'

export default function ProgressPage() {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (!programData) { router.push('/onboarding'); return }

      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programData.id)
        .order('week_number', { ascending: true })

      setProgram(programData as Program)
      setCheckIns((checkInsData ?? []) as CheckIn[])
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) {
    return (
      <div>
        <Header title="Progress" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          <div className="h-64 bg-surface border border-border rounded-2xl" />
          <div className="h-40 bg-surface border border-border rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!program) return null

  const totalChange = checkIns.length > 0
    ? program.start_weight - checkIns[checkIns.length - 1].current_weight
    : 0

  return (
    <div>
      <Header title="Progress" />
      <div className="px-4 py-5 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Start</p>
            <p className="font-display text-base font-bold text-text">{formatWeight(program.start_weight)}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Current</p>
            <p className="font-display text-base font-bold text-text">
              {checkIns.length > 0 ? formatWeight(checkIns[checkIns.length - 1].current_weight) : '—'}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-3 text-center">
            <p className="text-xs text-muted mb-1">Lost</p>
            <p className={`font-display text-base font-bold ${totalChange > 0 ? 'text-success' : 'text-text'}`}>
              {totalChange > 0 ? `-${totalChange.toFixed(1)} kg` : '—'}
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-text mb-3">Weight Chart</h2>
          <div className="bg-surface border border-border rounded-2xl p-3">
            <WeightChart checkIns={checkIns} program={program} />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-accent inline-block rounded" />
              <span className="text-xs text-muted">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 inline-block">
                <svg width="24" height="2" viewBox="0 0 24 2">
                  <line x1="0" y1="1" x2="24" y2="1" stroke="#6B6B6B" strokeWidth="1.5" strokeDasharray="5 3" />
                </svg>
              </span>
              <span className="text-xs text-muted">Projected</span>
            </div>
          </div>
        </div>

        {checkIns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-text">All Check-ins</h2>
              <Link href="/check-in/history" className="text-xs text-accent font-medium">History view</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] bg-surface border border-border rounded-2xl overflow-hidden">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs text-muted font-medium px-4 py-3">Week</th>
                    <th className="text-left text-xs text-muted font-medium px-3 py-3">Date</th>
                    <th className="text-right text-xs text-muted font-medium px-3 py-3">Weight</th>
                    <th className="text-right text-xs text-muted font-medium px-3 py-3">Change</th>
                    <th className="text-right text-xs text-muted font-medium px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[...checkIns].reverse().map((checkIn, idx, arr) => {
                    const prev = arr[idx + 1]
                    const change = prev ? checkIn.current_weight - prev.current_weight : null
                    const score = habitScore(checkIn, program)
                    return (
                      <tr key={checkIn.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/check-in/${checkIn.id}`} className="text-sm font-semibold text-text hover:text-accent transition-colors">
                            W{checkIn.week_number}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">{formatDate(checkIn.check_in_date)}</td>
                        <td className="px-3 py-3 text-sm font-semibold text-text text-right">{formatWeight(checkIn.current_weight)}</td>
                        <td className="px-3 py-3 text-sm text-right font-medium">
                          {change !== null ? (
                            <span className={change < 0 ? 'text-success' : change > 0 ? 'text-danger' : 'text-muted'}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <HabitScoreBadge score={score} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {checkIns.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <p className="text-text font-semibold mb-1">No data yet</p>
            <p className="text-sm text-muted">Complete your first check-in to see progress.</p>
          </div>
        )}
      </div>
    </div>
  )
}
