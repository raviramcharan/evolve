'use client'

import { Meal } from '@/types'
import { MealCard } from './MealCard'
import { Button } from '@/components/ui/Button'
import { calculateDayTotals, DEFAULT_MEAL_NAMES } from '@/lib/nutrition'
import { Plus } from 'lucide-react'

interface Props {
  meals: Meal[]
  onChange: (meals: Meal[]) => void
}

function newMeal(position: number): Meal {
  const name = DEFAULT_MEAL_NAMES[position] ?? `Meal ${position + 1}`
  return {
    id: crypto.randomUUID(),
    nutrition_plan_id: '',
    position,
    name,
    time_of_day: null,
    foods: [],
  }
}

export function MealBuilder({ meals, onChange }: Props) {
  const totals = calculateDayTotals(meals)

  function updateMeal(index: number, updated: Meal) {
    onChange(meals.map((m, i) => (i === index ? updated : m)))
  }

  function deleteMeal(index: number) {
    onChange(meals.filter((_, i) => i !== index))
  }

  function addMeal() {
    onChange([...meals, newMeal(meals.length)])
  }

  return (
    <div className="flex flex-col gap-3">
      {meals.map((meal, i) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onChange={(updated) => updateMeal(i, updated)}
          onDelete={() => deleteMeal(i)}
        />
      ))}

      <Button variant="ghost" onClick={addMeal} className="flex items-center justify-center gap-2 text-sm">
        <Plus size={16} />
        Add Meal
      </Button>

      {meals.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-muted font-medium">Day total</span>
          <div className="flex gap-4">
            <span className="text-text font-semibold">{totals.calories} kcal</span>
            <span className="text-accent">{totals.protein_g.toFixed(1)}g P</span>
            <span className="text-blue-400">{totals.carbs_g.toFixed(1)}g C</span>
            <span className="text-warning">{totals.fat_g.toFixed(1)}g F</span>
          </div>
        </div>
      )}
    </div>
  )
}
