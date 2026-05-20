import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireCoach } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { CheckInSummary } from '@/components/check-in/CheckInSummary'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { habitScore } from '@/lib/calculations'
import { formatDate, feelingEmoji, weekLabel } from '@/lib/formatters'
import { CheckIn, Program } from '@/types'

interface Props { params: { id: string } }

export default async function CoachClientCheckInsPage({ params }: Props) {
  const coach = await requireCoach()
  const supabase = createServerSupabaseClient()

  const { data: client } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', params.id)
    .eq('coach_id', coach.id)
    .maybeSingle()

  if (!client) notFound()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', client.id)
    .eq('is_active', true)
    .maybeSingle()

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', client.id)
    .order('week_number', { ascending: false })

  const allCheckIns: CheckIn[] = checkIns ?? []
  const typedProgram: Program | null = program as Program | null

  return (
    <div>
      <Header showBack title={`${client.name ?? 'Client'} — Check-ins`} />
      <div className="px-4 py-5">
        {allCheckIns.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No check-ins submitted yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allCheckIns.map((ci) => {
              const score = typedProgram ? habitScore(ci, typedProgram) : 0
              return (
                <details key={ci.id} className="bg-surface border border-border rounded-2xl overflow-hidden group">
                  <summary className="flex items-center gap-4 p-4 cursor-pointer list-none">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-base font-semibold text-text">
                          {weekLabel(ci.week_number)}
                        </span>
                        <span className="text-lg leading-none">{feelingEmoji(ci.overall_feeling)}</span>
                      </div>
                      <p className="text-xs text-muted">{formatDate(ci.check_in_date)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text">{ci.current_weight.toFixed(1)} kg</p>
                        <HabitScoreBadge score={score} />
                      </div>
                      <span className="text-muted text-xs group-open:rotate-90 transition-transform inline-block">▶</span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    {typedProgram && <CheckInSummary checkIn={ci} program={typedProgram} />}
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
