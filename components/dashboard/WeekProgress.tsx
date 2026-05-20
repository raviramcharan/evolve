import { Program } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface WeekProgressProps {
  program: Program
  currentWeek: number
}

export function WeekProgress({ program, currentWeek }: WeekProgressProps) {
  const programProgress = Math.round((currentWeek / 12) * 100)

  const startOfWeek = new Date(program.start_date)
  startOfWeek.setDate(startOfWeek.getDate() + (currentWeek - 1) * 7)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)

  const now = new Date()
  const dayOfWeek = Math.floor((now.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, 6 - dayOfWeek)

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Current Week</p>
          <p className="font-display text-3xl font-bold text-text mt-0.5">
            Week <span className="text-accent">{currentWeek}</span>
            <span className="text-muted text-lg font-normal"> / 12</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Days Left</p>
          <p className="font-display text-2xl font-bold text-text mt-0.5">{daysRemaining}</p>
        </div>
      </div>
      <ProgressBar value={programProgress} />
      <p className="text-xs text-muted mt-2">{programProgress}% through your 12-week program</p>
    </div>
  )
}
