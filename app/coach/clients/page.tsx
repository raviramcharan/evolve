import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireCoach } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { habitScore, getCurrentWeek, isOnTrack } from '@/lib/calculations'
import { formatDate } from '@/lib/formatters'
import { ChevronRight } from 'lucide-react'
import { CheckIn, Program } from '@/types'

export default async function CoachClientsPage() {
  const user = await requireCoach()
  const supabase = createServerSupabaseClient()

  const { data: clients } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('coach_id', user.id)
    .eq('role', 'client')

  const allClients = clients ?? []
  const clientIds = allClients.map((c) => c.id)

  const { data: programs } = clientIds.length
    ? await supabase.from('programs').select('*').in('user_id', clientIds).eq('is_active', true)
    : { data: [] }

  const { data: checkIns } = clientIds.length
    ? await supabase.from('check_ins').select('*').in('user_id', clientIds)
    : { data: [] }

  const allPrograms: Program[] = programs ?? []
  const allCheckIns: CheckIn[] = checkIns ?? []

  return (
    <div>
      <Header title="Clients" />
      <div className="px-4 py-5">
        {allClients.length === 0 ? (
          <Card>
            <p className="text-sm font-semibold text-text mb-1">No clients yet</p>
            <p className="text-sm text-muted">Go to Settings to find your coach code to share.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {allClients.map((client) => {
              const prog = allPrograms.find((p) => p.user_id === client.id)
              const clientCheckIns = allCheckIns.filter((ci) => ci.user_id === client.id)
              const lastCheckIn = clientCheckIns.sort((a, b) => b.week_number - a.week_number)[0]
              const currentWeek = prog ? getCurrentWeek(prog.start_date) : null
              const score = lastCheckIn && prog ? habitScore(lastCheckIn, prog) : null
              const status = prog && lastCheckIn
                ? isOnTrack(prog.start_weight, prog.goal_weight, lastCheckIn.current_weight, lastCheckIn.week_number)
                : null

              const statusColor = status === 'on_track'
                ? 'text-success'
                : status === 'ahead'
                ? 'text-accent'
                : status === 'behind'
                ? 'text-warning'
                : 'text-muted'

              const statusLabel = status === 'on_track'
                ? 'On Track'
                : status === 'ahead'
                ? 'Ahead'
                : status === 'behind'
                ? 'Behind'
                : 'No data'

              return (
                <Link
                  key={client.id}
                  href={`/coach/clients/${client.id}`}
                  className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 hover:border-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold text-sm">{(client.name ?? 'C')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-text truncate">{client.name ?? client.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted">{currentWeek ? `Week ${currentWeek}/12` : 'No program'}</span>
                      {lastCheckIn && <span className="text-xs text-muted">·</span>}
                      {lastCheckIn && <span className="text-xs text-muted">{formatDate(lastCheckIn.check_in_date)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {score !== null && <p className="text-xs font-semibold text-text">{score}%</p>}
                      <p className={`text-xs font-medium ${statusColor}`}>{statusLabel}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted" />
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
