import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { NutritionPlanView } from '@/components/client/nutrition/NutritionPlanView'
import { NutritionPlan, Meal } from '@/types'

export default async function ClientNutritionPage() {
  const user = await requireAuth()
  const supabase = createServerSupabaseClient()

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!program) {
    return (
      <div>
        <Header title="Nutrition Plan" />
        <div className="px-4 py-5">
          <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-muted">Your coach hasn&apos;t assigned a nutrition plan yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: plan } = await supabase
    .from('nutrition_plans')
    .select(`
      *,
      meals (
        *,
        foods:meal_foods (*)
      )
    `)
    .eq('client_id', user.id)
    .eq('program_id', program.id)
    .maybeSingle()

  if (!plan) {
    return (
      <div>
        <Header title="Nutrition Plan" />
        <div className="px-4 py-5">
          <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-muted">Your coach hasn&apos;t assigned a nutrition plan yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const sortedMeals = [...(plan.meals ?? [])]
    .sort((a: Meal, b: Meal) => a.position - b.position)
    .map((m: Meal) => ({
      ...m,
      foods: [...(m.foods ?? [])].sort((a, b) => a.position - b.position),
    }))

  const typedPlan: NutritionPlan = { ...plan, meals: sortedMeals }

  return (
    <div>
      <Header title="Nutrition Plan" />
      <div className="px-4 py-5">
        <NutritionPlanView plan={typedPlan} />
      </div>
    </div>
  )
}
