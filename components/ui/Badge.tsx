interface BadgeProps {
  score: number
  className?: string
}

export function HabitScoreBadge({ score, className = '' }: BadgeProps) {
  const color =
    score >= 80
      ? 'text-success'
      : score >= 60
      ? 'text-accent'
      : score >= 40
      ? 'text-warning'
      : 'text-danger'
  return (
    <span className={`text-sm font-semibold ${color} ${className}`}>{score}%</span>
  )
}
