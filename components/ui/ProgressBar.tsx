interface ProgressBarProps {
  value: number  // 0-100
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-accent rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}
