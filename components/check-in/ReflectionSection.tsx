'use client'

import { Input } from '@/components/ui/Input'
import { RatingScale } from '@/components/ui/RatingScale'

export interface ReflectionData {
  current_weight: string
  went_well: string
  was_challenging: string
  do_differently: string
  overall_feeling: number | null
}

interface ReflectionSectionProps {
  data: ReflectionData
  onChange: (data: Partial<ReflectionData>) => void
}

export function ReflectionSection({ data, onChange }: ReflectionSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <Input
        label="Current weight (kg) *"
        type="number"
        placeholder="e.g. 84.5"
        value={data.current_weight}
        onChange={(e) => onChange({ current_weight: e.target.value })}
        inputMode="decimal"
        step="0.1"
        min="30"
        max="300"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted font-medium">What went well this week?</label>
        <textarea
          className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="e.g. Stayed consistent with workouts, meal prepped on Sunday..."
          rows={3}
          value={data.went_well}
          onChange={(e) => onChange({ went_well: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted font-medium">What was challenging?</label>
        <textarea
          className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="e.g. Had a stressful week at work, skipped two sessions..."
          rows={3}
          value={data.was_challenging}
          onChange={(e) => onChange({ was_challenging: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted font-medium">What would you do differently?</label>
        <textarea
          className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="e.g. Prepare snacks in advance, schedule workouts in the morning..."
          rows={3}
          value={data.do_differently}
          onChange={(e) => onChange({ do_differently: e.target.value })}
        />
      </div>

      <RatingScale
        label="Overall how did you feel this week?"
        value={data.overall_feeling}
        onChange={(v) => onChange({ overall_feeling: v })}
        anchors={['Terrible', 'Amazing']}
      />
    </div>
  )
}
