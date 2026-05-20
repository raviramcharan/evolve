import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { habitScore } from '@/lib/calculations'
import { formatDate, feelingEmoji, weekLabel } from '@/lib/formatters'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { CheckIn, Program } from '@/types'
import { ChevronRight } from 'lucide-react'

export default async function CheckInHistoryPage() {
  const user = await requireAuth()
  const supabase = createServerSupabaseClient()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!program) redirect('/onboarding')

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('program_id', program.id)
    .order('week_number', { ascending: false })

  const allCheckIns: CheckIn[] = checkIns ?? []
  const typedProgram: Program = program

  return (
    <div>
      <Header showBack title="Check-in History" />
      <div className="px-4 py-5">
        {allCheckIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text font-semibold mb-1">No check-ins yet</p>
            <p className="text-sm text-muted mb-5">Your check-in history will appear here.</p>
            <Link
              href="/check-in"
              className="bg-accent text-black font-semibold rounded-xl px-5 py-3"
            >
              Start First Check-in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allCheckIns.map((checkIn) => {
              const score = habitScore(checkIn, typedProgram)
              return (
                <Link
                  key={checkIn.id}
                  href={`/check-in/${checkIn.id}`}
                  className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 hover:border-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-base font-semibold text-text">
                        {weekLabel(checkIn.week_number)}
                      </span>
                      <span className="text-lg leading-none">{feelingEmoji(checkIn.overall_feeling)}</span>
                    </div>
                    <p className="text-xs text-muted">{formatDate(checkIn.check_in_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text">{checkIn.current_weight.toFixed(1)} kg</p>
                      <HabitScoreBadge score={score} />
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
