import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getCurrentWeek, isOnTrack, habitScore } from '@/lib/calculations'
import { formatWeight, formatDate, feelingEmoji } from '@/lib/formatters'
import { OnTrackBanner } from '@/components/dashboard/OnTrackBanner'
import { WeightChart } from '@/components/dashboard/WeightChart'
import { WeekProgress } from '@/components/dashboard/WeekProgress'
import { HabitGrid } from '@/components/dashboard/HabitGrid'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { CheckIn, Program } from '@/types'

export default async function DashboardPage() {
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
    .order('week_number', { ascending: true })

  const allCheckIns: CheckIn[] = checkIns ?? []
  const typedProgram: Program = program

  const currentWeek = getCurrentWeek(typedProgram.start_date)
  const latestCheckIn = allCheckIns.length > 0 ? allCheckIns[allCheckIns.length - 1] : null
  const currentWeight = latestCheckIn?.current_weight ?? typedProgram.start_weight
  const trackingStatus = isOnTrack(
    typedProgram.start_weight,
    typedProgram.goal_weight,
    currentWeight,
    currentWeek
  )

  const today = new Date()
  const isSunday = today.getDay() === 0
  const hasCheckInThisWeek = allCheckIns.some((c) => c.week_number === currentWeek)
  const showCheckInCTA = isSunday && !hasCheckInThisWeek

  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div>
      <Header />
      <div className="px-4 py-5 flex flex-col gap-5">
        <div>
          <p className="text-muted text-sm">
            {userProfile?.name ? `Hey, ${userProfile.name} 👋` : 'Welcome back 👋'}
          </p>
          <h1 className="font-display text-2xl font-bold text-text mt-0.5">{typedProgram.title}</h1>
        </div>

        <WeekProgress program={typedProgram} currentWeek={currentWeek} />

        <OnTrackBanner
          status={trackingStatus}
          currentWeight={currentWeight}
          goalWeight={typedProgram.goal_weight}
          currentWeek={currentWeek}
        />

        {showCheckInCTA && (
          <Card className="border-accent/40 bg-accent/5">
            <p className="font-display text-base font-semibold text-text mb-1">
              Time for your Week {currentWeek} check-in!
            </p>
            <p className="text-sm text-muted mb-4">It&apos;s Sunday — log this week&apos;s data to stay on track.</p>
            <Link href="/check-in">
              <Button fullWidth>Start Check-in</Button>
            </Link>
          </Card>
        )}

        {allCheckIns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-text">Weight Progress</h2>
              <Link href="/progress" className="text-xs text-accent font-medium">View all</Link>
            </div>
            <Card className="p-3">
              <WeightChart checkIns={allCheckIns} program={typedProgram} />
            </Card>
          </div>
        )}

        {latestCheckIn && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-text">Last Check-in</h2>
              <Link href={`/check-in/${latestCheckIn.id}`} className="text-xs text-accent font-medium">View</Link>
            </div>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted">Week {latestCheckIn.week_number}</p>
                  <p className="text-sm text-muted mt-0.5">{formatDate(latestCheckIn.check_in_date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-text">{formatWeight(latestCheckIn.current_weight)}</p>
                  <p className="text-xs text-muted">
                    {feelingEmoji(latestCheckIn.overall_feeling)} Habit score: <HabitScoreBadge score={habitScore(latestCheckIn, typedProgram)} />
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted">Calories</p>
                  <p className="text-sm font-semibold text-text mt-0.5 capitalize">{latestCheckIn.hit_calorie_target ?? '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted">Workouts</p>
                  <p className="text-sm font-semibold text-text mt-0.5">
                    {latestCheckIn.workouts_completed !== null ? `${latestCheckIn.workouts_completed}/${typedProgram.workout_target}` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted">Sleep</p>
                  <p className="text-sm font-semibold text-text mt-0.5">
                    {latestCheckIn.avg_sleep_hours !== null ? `${latestCheckIn.avg_sleep_hours}h` : '—'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {allCheckIns.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-text font-semibold mb-1">No check-ins yet</p>
            <p className="text-sm text-muted mb-5">Complete your first weekly check-in to start tracking progress.</p>
            <Link href="/check-in">
              <Button>Start First Check-in</Button>
            </Link>
          </Card>
        )}

        {allCheckIns.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-text mb-3">Habit Compliance</h2>
            <HabitGrid checkIns={allCheckIns} program={typedProgram} />
          </div>
        )}
      </div>
    </div>
  )
}
