'use client'

import { Input } from '@/components/ui/Input'
import { RatingScale } from '@/components/ui/RatingScale'
import { Button } from '@/components/ui/Button'

export interface NutritionData {
  hit_calorie_target: 'yes' | 'mostly' | 'no' | ''
  hit_protein_target: 'yes' | 'mostly' | 'no' | ''
  nutrition_sustainability: number | null
  drank_alcohol: boolean
  alcohol_units: string
}

interface NutritionSectionProps {
  data: NutritionData
  onChange: (data: Partial<NutritionData>) => void
}

type HitTarget = 'yes' | 'mostly' | 'no'

const TARGET_OPTIONS: { value: HitTarget; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'no', label: 'No' },
]

export function NutritionSection({ data, onChange }: NutritionSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted font-medium mb-2">Did you hit your calorie target?</p>
        <div className="flex gap-2">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ hit_calorie_target: opt.value })}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                data.hit_calorie_target === opt.value
                  ? 'bg-accent text-black border-accent'
                  : 'bg-surface border-border text-text hover:border-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted font-medium mb-2">Did you hit your protein target?</p>
        <div className="flex gap-2">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ hit_protein_target: opt.value })}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                data.hit_protein_target === opt.value
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
        label="How sustainable did your nutrition feel? (1 = very hard, 5 = effortless)"
        value={data.nutrition_sustainability}
        onChange={(v) => onChange({ nutrition_sustainability: v })}
        anchors={['Very hard', 'Effortless']}
      />

      <div>
        <p className="text-sm text-muted font-medium mb-2">Did you drink alcohol this week?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ drank_alcohol: true })}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              data.drank_alcohol
                ? 'bg-accent text-black border-accent'
                : 'bg-surface border-border text-text hover:border-muted'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange({ drank_alcohol: false, alcohol_units: '' })}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              !data.drank_alcohol
                ? 'bg-accent text-black border-accent'
                : 'bg-surface border-border text-text hover:border-muted'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {data.drank_alcohol && (
        <Input
          label="How many units approximately?"
          type="number"
          placeholder="e.g. 6"
          value={data.alcohol_units}
          onChange={(e) => onChange({ alcohol_units: e.target.value })}
          inputMode="numeric"
        />
      )}
    </div>
  )
}
