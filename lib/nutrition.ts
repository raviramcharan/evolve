import type { Meal, MealFood, NutritionPlan } from '@/types'

export function calculateMealTotals(foods: MealFood[]) {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein_g: acc.protein_g + food.protein_g,
      carbs_g: acc.carbs_g + food.carbs_g,
      fat_g: acc.fat_g + food.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )
}

export function calculateDayTotals(meals: Meal[]) {
  return meals.reduce(
    (acc, meal) => {
      const t = calculateMealTotals(meal.foods ?? [])
      return {
        calories: acc.calories + t.calories,
        protein_g: acc.protein_g + t.protein_g,
        carbs_g: acc.carbs_g + t.carbs_g,
        fat_g: acc.fat_g + t.fat_g,
      }
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )
}

export function macroSplit(protein: number, carbs: number, fat: number) {
  const proteinCals = protein * 4
  const carbCals = carbs * 4
  const fatCals = fat * 9
  const total = proteinCals + carbCals + fatCals || 1
  return {
    protein: Math.round((proteinCals / total) * 100),
    carbs: Math.round((carbCals / total) * 100),
    fat: Math.round((fatCals / total) * 100),
  }
}

export function isPlanOnTarget(
  dayCalories: number,
  plan: NutritionPlan,
  tolerancePercent = 10
): boolean {
  const diff = Math.abs(dayCalories - plan.calorie_target)
  return (diff / plan.calorie_target) * 100 <= tolerancePercent
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DEFAULT_MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
export const FOOD_UNITS = ['g', 'ml', 'piece', 'scoop', 'tbsp', 'tsp', 'cup'] as const
