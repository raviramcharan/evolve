'use client'

import { NutritionPlan } from '@/types'
import { MacroRings } from './MacroRings'
import { calculateDayTotals, calculateMealTotals } from '@/lib/nutrition'

interface Props {
  plan: NutritionPlan
}

export function NutritionPlanView({ plan }: Props) {
  const meals = [...(plan.meals ?? [])].sort((a, b) => a.position - b.position)
  const dayTotals = calculateDayTotals(meals)
  const hasMeals = meals.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">{plan.title}</h2>
        {plan.notes && <p className="text-sm text-muted mt-1">{plan.notes}</p>}
      </div>

      <MacroRings plan={plan} dayTotals={hasMeals ? dayTotals : undefined} />

      {!hasMeals && (
        <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
          <p className="text-sm text-muted">Your coach hasn&apos;t added a meal structure yet.</p>
        </div>
      )}

      {hasMeals && (
        <div className="flex flex-col gap-4">
          {meals.map((meal) => {
            const foods = [...(meal.foods ?? [])].sort((a, b) => a.position - b.position)
            const mealTotals = calculateMealTotals(foods)

            return (
              <div key={meal.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">{meal.name}</p>
                    {meal.time_of_day && (
                      <p className="text-xs text-muted">{meal.time_of_day}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted">{mealTotals.calories} kcal</p>
                </div>

                {foods.length > 0 && (
                  <div className="px-4 py-3 flex flex-col gap-2">
                    {foods.map((food) => (
                      <div key={food.id} className="flex items-start justify-between text-sm">
                        <div>
                          <p className="text-text">{food.name}</p>
                          <p className="text-xs text-muted">{food.quantity} {food.unit}</p>
                        </div>
                        <div className="text-right text-xs text-muted">
                          <p>{food.calories} kcal</p>
                          <p className="text-accent">{food.protein_g}g P</p>
                          <p className="text-blue-400">{food.carbs_g}g C</p>
                          <p className="text-warning">{food.fat_g}g F</p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
                      <span>Meal total</span>
                      <div className="flex gap-3">
                        <span>{mealTotals.calories} kcal</span>
                        <span className="text-accent">{mealTotals.protein_g.toFixed(1)}g P</span>
                        <span className="text-blue-400">{mealTotals.carbs_g.toFixed(1)}g C</span>
                        <span className="text-warning">{mealTotals.fat_g.toFixed(1)}g F</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-muted font-medium">Day total</span>
            <div className="flex gap-4">
              <span className="text-text font-semibold">{dayTotals.calories} kcal</span>
              <span className="text-accent">{dayTotals.protein_g.toFixed(1)}g P</span>
              <span className="text-blue-400">{dayTotals.carbs_g.toFixed(1)}g C</span>
              <span className="text-warning">{dayTotals.fat_g.toFixed(1)}g F</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
