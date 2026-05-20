import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireCoach } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { habitScore, getCurrentWeek, isOnTrack } from '@/lib/calculations'
import { formatDate, feelingEmoji, weekLabel } from '@/lib/formatters'
import { Users, ClipboardList, TrendingUp, ChevronRight } from 'lucide-react'
import { CheckIn, Program } from '@/types'

export default async function CoachDashboardPage() {
  const user = await requireCoach()
  const supabase = createServerSupabaseClient()

  // Fetch coach profile + code
  const { data: coach } = await supabase
    .from('coaches')
    .select('coach_code')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch all clients
  const { data: clients } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  const allClients = clients ?? []

  // Fetch active programs for all clients
  const clientIds = allClients.map((c) => c.id)
  const { data: programs } = clientIds.length
    ? await supabase.from('programs').select('*').in('user_id', clientIds).eq('is_active', true)
    : { data: [] }

  // Fetch recent check-ins (last 10 across all clients)
  const { data: recentCheckIns } = clientIds.length
    ? await supabase
        .from('check_ins')
        .select('*')
        .in('user_id', clientIds)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const allPrograms: Program[] = programs ?? []
  const allCheckIns: CheckIn[] = recentCheckIns ?? []

  // Stats
  const activePrograms = allPrograms.length
  const checkInsDueThisWeek = allPrograms.filter((prog) => {
    const currentWeek = getCurrentWeek(prog.start_date)
    const hasCheckIn = allCheckIns.some(
      (ci) => ci.program_id === prog.id && ci.week_number === currentWeek
    )
    return !hasCheckIn
  }).length

  return (
    <div>
      <Header title="Coach Dashboard" />
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="flex flex-col items-center justify-center py-4 text-center">
            <Users size={18} className="text-accent mb-1.5" />
            <p className="font-display text-2xl font-bold text-text">{allClients.length}</p>
            <p className="text-xs text-muted mt-0.5">Clients</p>
          </Card>
          <Card className="flex flex-col items-center justify-center py-4 text-center">
            <TrendingUp size={18} className="text-accent mb-1.5" />
            <p className="font-display text-2xl font-bold text-text">{activePrograms}</p>
            <p className="text-xs text-muted mt-0.5">Active</p>
          </Card>
          <Card className="flex flex-col items-center justify-center py-4 text-center">
            <ClipboardList size={18} className="text-warning mb-1.5" />
            <p className="font-display text-2xl font-bold text-text">{checkInsDueThisWeek}</p>
            <p className="text-xs text-muted mt-0.5">Due</p>
          </Card>
        </div>

        {/* Coach code */}
        {coach && (
          <Card>
            <p className="text-xs text-muted mb-1">Your coach code — share this with clients</p>
            <p className="font-display text-2xl font-bold text-accent tracking-widest">{coach.coach_code}</p>
          </Card>
        )}

        {/* Recent activity */}
        <div>
          <p className="text-sm font-semibold text-muted mb-3">Recent Check-ins</p>
          {allCheckIns.length === 0 ? (
            <Card>
              <p className="text-sm text-muted text-center py-4">No check-ins yet from your clients.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {allCheckIns.map((ci) => {
                const client = allClients.find((c) => c.id === ci.user_id)
                const prog = allPrograms.find((p) => p.id === ci.program_id)
                const score = prog ? habitScore(ci, prog) : 0
                return (
                  <Link
                    key={ci.id}
                    href={`/coach/clients/${ci.user_id}`}
                    className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4 hover:border-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-text truncate">{client?.name ?? 'Client'}</span>
                        <span className="text-base leading-none">{feelingEmoji(ci.overall_feeling)}</span>
                      </div>
                      <p className="text-xs text-muted">{weekLabel(ci.week_number)} · {formatDate(ci.check_in_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <HabitScoreBadge score={score} />
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick client links */}
        {allClients.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted">Clients</p>
              <Link href="/coach/clients" className="text-xs text-accent font-medium">See all</Link>
            </div>
            <div className="flex flex-col gap-2">
              {allClients.slice(0, 3).map((client) => {
                const prog = allPrograms.find((p) => p.user_id === client.id)
                const currentWeek = prog ? getCurrentWeek(prog.start_date) : null
                return (
                  <Link
                    key={client.id}
                    href={`/coach/clients/${client.id}`}
                    className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4 hover:border-muted transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-accent font-bold text-sm">{(client.name ?? 'C')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-text truncate">{client.name ?? client.email}</p>
                      <p className="text-xs text-muted">{currentWeek ? `Week ${currentWeek} of 12` : 'No active program'}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {allClients.length === 0 && (
          <Card>
            <p className="text-sm font-semibold text-text mb-1">No clients yet</p>
            <p className="text-sm text-muted">Share your coach code with clients so they can connect with you.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
