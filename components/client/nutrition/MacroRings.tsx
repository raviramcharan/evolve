'use client'

import { NutritionPlan } from '@/types'
import { macroSplit } from '@/lib/nutrition'

interface Props {
  plan: NutritionPlan
  dayTotals?: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
}

interface StatCardProps {
  label: string
  target: number
  unit: string
  actual?: number
  accentClass: string
}

function StatCard({ label, target, unit, actual, accentClass }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold ${accentClass}`}>{target}</p>
      <p className="text-xs text-muted">{unit}</p>
      {actual !== undefined && (
        <p className="text-xs text-muted mt-1">
          Actual: <span className="text-text">{typeof actual === 'number' && !Number.isInteger(actual) ? actual.toFixed(1) : actual}</span>
        </p>
      )}
    </div>
  )
}

export function MacroRings({ plan, dayTotals }: Props) {
  const split = macroSplit(plan.protein_target, plan.carb_target, plan.fat_target)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Calories"
          target={plan.calorie_target}
          unit="kcal / day"
          actual={dayTotals?.calories}
          accentClass="text-text"
        />
        <StatCard
          label={`Protein · ${split.protein}%`}
          target={plan.protein_target}
          unit="g / day"
          actual={dayTotals?.protein_g}
          accentClass="text-accent"
        />
        <StatCard
          label={`Carbs · ${split.carbs}%`}
          target={plan.carb_target}
          unit="g / day"
          actual={dayTotals?.carbs_g}
          accentClass="text-blue-400"
        />
        <StatCard
          label={`Fat · ${split.fat}%`}
          target={plan.fat_target}
          unit="g / day"
          actual={dayTotals?.fat_g}
          accentClass="text-warning"
        />
      </div>
    </div>
  )
}
