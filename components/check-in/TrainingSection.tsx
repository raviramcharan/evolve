'use client'

import { Input } from '@/components/ui/Input'

export interface TrainingData {
  workouts_completed: string
  training_intensity: 'low' | 'moderate' | 'high' | ''
  had_injury: boolean
  injury_notes: string
}

interface TrainingSectionProps {
  data: TrainingData
  onChange: (data: Partial<TrainingData>) => void
}

type Intensity = 'low' | 'moderate' | 'high'

const INTENSITY_OPTIONS: { value: Intensity; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Light effort' },
  { value: 'moderate', label: 'Moderate', description: 'Working hard' },
  { value: 'high', label: 'High', description: 'Max effort' },
]

export function TrainingSection({ data, onChange }: TrainingSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <Input
        label="Workouts completed this week"
        type="number"
        placeholder="e.g. 3"
        value={data.workouts_completed}
        onChange={(e) => onChange({ workouts_completed: e.target.value })}
        inputMode="numeric"
        min="0"
        max="7"
      />

      <div>
        <p className="text-sm text-muted font-medium mb-2">Overall training intensity</p>
        <div className="flex gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ training_intensity: opt.value })}
              className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                data.training_intensity === opt.value
                  ? 'bg-accent text-black border-accent'
                  : 'bg-surface border-border text-text hover:border-muted'
              }`}
            >
              <span className="font-semibold">{opt.label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  data.training_intensity === opt.value ? 'text-black/70' : 'text-muted'
                }`}
              >
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted font-medium mb-2">Any injuries or aches?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ had_injury: true })}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              data.had_injury
                ? 'bg-accent text-black border-accent'
                : 'bg-surface border-border text-text hover:border-muted'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange({ had_injury: false, injury_notes: '' })}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              !data.had_injury
                ? 'bg-accent text-black border-accent'
                : 'bg-surface border-border text-text hover:border-muted'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {data.had_injury && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted font-medium">Tell us more about the injury</label>
          <textarea
            className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="e.g. Lower back tightness after deadlifts..."
            rows={3}
            value={data.injury_notes}
            onChange={(e) => onChange({ injury_notes: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
