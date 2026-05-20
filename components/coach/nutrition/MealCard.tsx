'use client'

import { useState } from 'react'
import { Meal, MealFood } from '@/types'
import { FoodRow } from './FoodRow'
import { calculateMealTotals } from '@/lib/nutrition'
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  meal: Meal
  onChange: (updated: Meal) => void
  onDelete: () => void
}

function newFood(mealId: string, position: number): MealFood {
  return {
    id: crypto.randomUUID(),
    meal_id: mealId,
    position,
    name: '',
    quantity: 0,
    unit: 'g',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  }
}

export function MealCard({ meal, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(true)
  const foods = meal.foods ?? []
  const totals = calculateMealTotals(foods)

  function updateFood(index: number, updated: MealFood) {
    onChange({ ...meal, foods: foods.map((f, i) => (i === index ? updated : f)) })
  }

  function deleteFood(index: number) {
    onChange({ ...meal, foods: foods.filter((_, i) => i !== index) })
  }

  function addFood() {
    onChange({ ...meal, foods: [...foods, newFood(meal.id, foods.length)] })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          className="flex-1 bg-transparent text-sm font-semibold text-text placeholder-muted focus:outline-none"
          placeholder="Meal name"
          value={meal.name}
          onChange={(e) => onChange({ ...meal, name: e.target.value })}
        />
        <input
          className="w-20 bg-bg border border-border rounded-xl px-2 py-1 text-xs text-text placeholder-muted focus:outline-none focus:border-accent transition-colors text-center"
          placeholder="HH:MM"
          value={meal.time_of_day ?? ''}
          onChange={(e) => onChange({ ...meal, time_of_day: e.target.value || null })}
        />
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-1.5 text-muted hover:text-text transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button type="button" onClick={onDelete} className="p-1.5 text-muted hover:text-danger transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border flex flex-col gap-3 pt-3">
          {foods.map((food, i) => (
            <FoodRow
              key={food.id}
              food={food}
              onChange={(updated) => updateFood(i, updated)}
              onDelete={() => deleteFood(i)}
            />
          ))}

          <Button variant="ghost" onClick={addFood} className="flex items-center justify-center gap-2 text-sm">
            <Plus size={16} />
            Add Food
          </Button>

          {foods.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-1 border-t border-border text-xs text-muted">
              <span>Meal total</span>
              <div className="flex gap-3">
                <span>{totals.calories} kcal</span>
                <span className="text-accent">{totals.protein_g.toFixed(1)}g P</span>
                <span className="text-blue-400">{totals.carbs_g.toFixed(1)}g C</span>
                <span className="text-warning">{totals.fat_g.toFixed(1)}g F</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
