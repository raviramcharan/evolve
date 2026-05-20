'use client'

import { Input } from '@/components/ui/Input'
import { RatingScale } from '@/components/ui/RatingScale'

export interface LifestyleData {
  avg_sleep_hours: string
  sleep_quality: number | null
  stress_level: number | null
  hit_water_target: 'yes' | 'most_days' | 'no' | ''
  energy_level: number | null
}

interface LifestyleSectionProps {
  data: LifestyleData
  onChange: (data: Partial<LifestyleData>) => void
}

type WaterTarget = 'yes' | 'most_days' | 'no'

const WATER_OPTIONS: { value: WaterTarget; label: string }[] = [
  { value: 'yes', label: 'Yes, every day' },
  { value: 'most_days', label: 'Most days' },
  { value: 'no', label: 'Not really' },
]

export function LifestyleSection({ data, onChange }: LifestyleSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <Input
        label="Average sleep hours per night"
        type="number"
        placeholder="e.g. 7.5"
        value={data.avg_sleep_hours}
        onChange={(e) => onChange({ avg_sleep_hours: e.target.value })}
        inputMode="decimal"
        step="0.5"
        min="0"
        max="14"
      />

      <RatingScale
        label="How was your sleep quality?"
        value={data.sleep_quality}
        onChange={(v) => onChange({ sleep_quality: v })}
        anchors={['Poor', 'Excellent']}
      />

      <RatingScale
        label="How was your stress level this week?"
        value={data.stress_level}
        onChange={(v) => onChange({ stress_level: v })}
        anchors={['Very low', 'Very high']}
      />

      <div>
        <p className="text-sm text-muted font-medium mb-2">Did you hit your water intake target?</p>
        <div className="flex flex-col gap-2">
          {WATER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ hit_water_target: opt.value })}
              className={`w-full py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all ${
                data.hit_water_target === opt.value
                  ? 'bg-accent text-black border-accent'
                  : 'bg-surface border-border text-text hover:border-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <RatingScale
        label="How were your energy levels overall?"
        value={data.energy_level}
        onChange={(v) => onChange({ energy_level: v })}
        anchors={['Exhausted', 'Energised']}
      />
    </div>
  )
}
