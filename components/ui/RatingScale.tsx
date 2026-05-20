'use client'

interface RatingScaleProps {
  value: number | null
  onChange: (value: number) => void
  label?: string
  anchors?: [string, string]
}

const EMOJIS = ['😞', '😔', '😐', '😊', '😁']

export function RatingScale({ value, onChange, label, anchors }: RatingScaleProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-muted font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        {anchors && <span className="text-xs text-muted w-16 shrink-0">{anchors[0]}</span>}
        <div className="flex gap-2 flex-1 justify-between">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border transition-all ${
                value === n
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:border-muted'
              }`}
            >
              <span className="text-lg leading-none">{EMOJIS[n - 1]}</span>
              <span className={`text-xs font-medium ${value === n ? 'text-accent' : 'text-muted'}`}>{n}</span>
            </button>
          ))}
        </div>
        {anchors && <span className="text-xs text-muted w-16 shrink-0 text-right">{anchors[1]}</span>}
      </div>
    </div>
  )
}
