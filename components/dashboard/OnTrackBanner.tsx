import { TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import { TrackingStatus } from '@/types'
import { formatWeight } from '@/lib/formatters'

interface OnTrackBannerProps {
  status: TrackingStatus
  currentWeight: number
  goalWeight: number
  currentWeek: number
}

const CONFIG = {
  on_track: {
    color: 'text-success',
    borderColor: 'border-success/30',
    bg: 'bg-success/10',
    icon: CheckCircle,
    label: 'On Track',
    message: 'You\'re right on schedule. Keep it up!',
  },
  ahead: {
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bg: 'bg-accent/10',
    icon: TrendingUp,
    label: 'Ahead of Schedule',
    message: 'Great work — you\'re progressing faster than planned.',
  },
  behind: {
    color: 'text-warning',
    borderColor: 'border-warning/30',
    bg: 'bg-warning/10',
    icon: AlertTriangle,
    label: 'Behind Schedule',
    message: 'Don\'t worry — focus on your habits this week.',
  },
}

export function OnTrackBanner({ status, currentWeight, goalWeight, currentWeek }: OnTrackBannerProps) {
  const { color, borderColor, bg, icon: Icon, label, message } = CONFIG[status]
  const remaining = currentWeight - goalWeight

  return (
    <div className={`rounded-2xl border ${borderColor} ${bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-semibold text-sm ${color}`}>{label}</span>
            <span className="text-xs text-muted">Week {currentWeek}/12</span>
          </div>
          <p className="text-sm text-muted mt-0.5">{message}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">Current:</span>
              <span className="text-xs font-semibold text-text">{formatWeight(currentWeight)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">Goal:</span>
              <span className="text-xs font-semibold text-text">{formatWeight(goalWeight)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">Remaining:</span>
                <span className="text-xs font-semibold text-text">{formatWeight(remaining)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
