'use client'

import { macroSplit } from '@/lib/nutrition'
import { Input } from '@/components/ui/Input'

interface MacroValues {
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
}

interface Props {
  values: MacroValues
  onChange: (updated: MacroValues) => void
}

export function MacroTargetsForm({ values, onChange }: Props) {
  const { calorie_target, protein_target, carb_target, fat_target } = values
  const split = macroSplit(protein_target, carb_target, fat_target)
  const macroCals = protein_target * 4 + carb_target * 4 + fat_target * 9
  const calorieDeviation = calorie_target > 0
    ? Math.abs(macroCals - calorie_target) / calorie_target * 100
    : 0
  const showWarning = calorie_target > 0 && calorieDeviation > 10

  function update(field: keyof MacroValues, raw: string) {
    onChange({ ...values, [field]: parseInt(raw, 10) || 0 })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Calories (kcal)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 2200"
          value={calorie_target || ''}
          onChange={(e) => update('calorie_target', e.target.value)}
        />
        <Input
          label="Protein (g)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 180"
          value={protein_target || ''}
          onChange={(e) => update('protein_target', e.target.value)}
        />
        <Input
          label="Carbs (g)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 220"
          value={carb_target || ''}
          onChange={(e) => update('carb_target', e.target.value)}
        />
        <Input
          label="Fat (g)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 70"
          value={fat_target || ''}
          onChange={(e) => update('fat_target', e.target.value)}
        />
      </div>

      {(protein_target > 0 || carb_target > 0 || fat_target > 0) && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Macro split:</span>
          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            P {split.protein}%
          </span>
          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
            C {split.carbs}%
          </span>
          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
            F {split.fat}%
          </span>
        </div>
      )}

      {showWarning && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
          <p className="text-sm text-warning">
            Macro calories ({macroCals} kcal) don&apos;t match your calorie target ({calorie_target} kcal). Consider adjusting.
          </p>
        </div>
      )}
    </div>
  )
}
