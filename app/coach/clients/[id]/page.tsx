import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireCoach } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { CheckInSummary } from '@/components/check-in/CheckInSummary'
import { habitScore, getCurrentWeek, isOnTrack, projectedWeights } from '@/lib/calculations'
import { formatDate, weekLabel } from '@/lib/formatters'
import { CheckIn, Program } from '@/types'
import { FileText, ClipboardList, StickyNote, Target } from 'lucide-react'

interface Props { params: { id: string } }

export default async function CoachClientDetailPage({ params }: Props) {
  const coach = await requireCoach()
  const supabase = createServerSupabaseClient()

  // Verify client belongs to this coach
  const { data: client } = await supabase
    .from('users')
    .select('id, name, email, coach_id')
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
  const lastCheckIn = allCheckIns[0] ?? null
  const currentWeek = typedProgram ? getCurrentWeek(typedProgram.start_date) : null
  const score = lastCheckIn && typedProgram ? habitScore(lastCheckIn, typedProgram) : null
  const status = typedProgram && lastCheckIn
    ? isOnTrack(typedProgram.start_weight, typedProgram.goal_weight, lastCheckIn.current_weight, lastCheckIn.week_number)
    : null

  const statusColor = status === 'on_track' ? 'text-success' : status === 'ahead' ? 'text-accent' : status === 'behind' ? 'text-warning' : 'text-muted'
  const statusLabel = status === 'on_track' ? 'On Track' : status === 'ahead' ? 'Ahead of Schedule' : status === 'behind' ? 'Behind Schedule' : '—'

  const NAV_LINKS = [
    { href: `/coach/clients/${client.id}/checkins`, icon: ClipboardList, label: 'Check-ins', count: allCheckIns.length },
    { href: `/coach/clients/${client.id}/notes`, icon: StickyNote, label: 'Notes', count: null },
    { href: `/coach/clients/${client.id}/program`, icon: Target, label: 'Program', count: null },
  ]

  return (
    <div>
      <Header showBack title={client.name ?? client.email} />
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Client summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display text-lg font-semibold text-text">{client.name ?? 'Client'}</p>
              <p className="text-xs text-muted">{client.email}</p>
            </div>
            {score !== null && <HabitScoreBadge score={score} className="text-base" />}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold font-display text-text">{currentWeek ?? '—'}</p>
              <p className="text-xs text-muted">Current week</p>
            </div>
            <div>
              <p className={`text-sm font-bold font-display ${statusColor}`}>{statusLabel.split(' ')[0]}</p>
              <p className="text-xs text-muted">Status</p>
            </div>
            <div>
              <p className="text-lg font-bold font-display text-text">
                {lastCheckIn ? `${lastCheckIn.current_weight.toFixed(1)}` : '—'}
              </p>
              <p className="text-xs text-muted">kg</p>
            </div>
          </div>
          {typedProgram && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted">Goal: {typedProgram.goal_weight} kg</span>
              <span className="text-xs text-muted">{formatDate(typedProgram.start_date)} → {formatDate(typedProgram.end_date)}</span>
            </div>
          )}
        </Card>

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-3">
          {NAV_LINKS.map(({ href, icon: Icon, label, count }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-2 bg-surface border border-border rounded-2xl p-4 hover:border-accent transition-colors"
            >
              <Icon size={20} className="text-accent" />
              <span className="text-xs font-medium text-text">{label}</span>
              {count !== null && <span className="text-xs text-muted">{count}</span>}
            </Link>
          ))}
        </div>

        {/* Latest check-in */}
        {lastCheckIn && typedProgram && (
          <div>
            <p className="text-sm font-semibold text-muted mb-3">{weekLabel(lastCheckIn.week_number)} Check-in</p>
            <CheckInSummary checkIn={lastCheckIn} program={typedProgram} />
          </div>
        )}

        {!typedProgram && (
          <Card>
            <p className="text-sm text-muted text-center mb-3">No active program.</p>
            <Link href={`/coach/clients/${client.id}/program`} className="block">
              <div className="w-full bg-accent text-black font-semibold rounded-xl px-5 py-3 text-center text-sm">
                Create Program
              </div>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
