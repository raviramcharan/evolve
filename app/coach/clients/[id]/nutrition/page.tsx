'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { MacroTargetsForm } from '@/components/coach/nutrition/MacroTargetsForm'
import { MealBuilder } from '@/components/coach/nutrition/MealBuilder'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Meal } from '@/types'

interface PlanMeta {
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
  title: string
  notes: string
}

export default function CoachClientNutritionPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [clientName, setClientName] = useState('')
  const [planId, setPlanId] = useState<string | null>(null)
  const [programId, setProgramId] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [planMeta, setPlanMeta] = useState<PlanMeta>({
    calorie_target: 0,
    protein_target: 0,
    carb_target: 0,
    fat_target: 0,
    title: 'Nutrition Plan',
    notes: '',
  })
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setCoachId(user.id)

      const { data: clientData } = await supabase
        .from('users')
        .select('name, coach_id')
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .maybeSingle()

      if (!clientData) { router.push('/coach/clients'); return }
      setClientName(clientData.name ?? 'Client')

      const { data: prog } = await supabase
        .from('programs')
        .select('id')
        .eq('user_id', clientId)
        .eq('is_active', true)
        .maybeSingle()

      if (!prog) { setLoading(false); return }
      setProgramId(prog.id)

      const { data: plan } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          meals (
            *,
            foods:meal_foods (*)
          )
        `)
        .eq('client_id', clientId)
        .eq('program_id', prog.id)
        .maybeSingle()

      if (plan) {
        setPlanId(plan.id)
        setPlanMeta({
          calorie_target: plan.calorie_target,
          protein_target: plan.protein_target,
          carb_target: plan.carb_target,
          fat_target: plan.fat_target,
          title: plan.title,
          notes: plan.notes ?? '',
        })
        const sorted = [...(plan.meals ?? [])]
          .sort((a: Meal, b: Meal) => a.position - b.position)
          .map((m: Meal) => ({
            ...m,
            foods: [...(m.foods ?? [])].sort((a, b) => a.position - b.position),
          }))
        setMeals(sorted)
      }

      setLoading(false)
    }
    fetchData()
  }, [clientId, router])

  async function handleSave() {
    if (!programId || !coachId) {
      setError('No active program found for this client.')
      return
    }
    if (!planMeta.calorie_target || !planMeta.protein_target) {
      setError('Calorie and protein targets are required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseClient()
    const tempPlanId = planId ?? crypto.randomUUID()

    const planRecord = {
      id: tempPlanId,
      client_id: clientId,
      program_id: programId,
      coach_id: coachId,
      title: planMeta.title,
      calorie_target: planMeta.calorie_target,
      protein_target: planMeta.protein_target,
      carb_target: planMeta.carb_target,
      fat_target: planMeta.fat_target,
      notes: planMeta.notes || null,
      updated_at: new Date().toISOString(),
    }

    const { error: planErr } = await supabase
      .from('nutrition_plans')
      .upsert(planRecord, { onConflict: 'client_id,program_id' })

    if (planErr) { setError(planErr.message); setSaving(false); return }

    const { data: fetchedPlan } = await supabase
      .from('nutrition_plans')
      .select('id')
      .eq('client_id', clientId)
      .eq('program_id', programId)
      .single()

    const actualPlanId = fetchedPlan?.id ?? tempPlanId
    if (!planId) setPlanId(actualPlanId)

    // Delete all meals and re-insert (delete cascade handles foods)
    await supabase.from('meals').delete().eq('nutrition_plan_id', actualPlanId)

    if (meals.length > 0) {
      const { data: insertedMeals, error: mealsErr } = await supabase
        .from('meals')
        .insert(
          meals.map((meal, i) => ({
            nutrition_plan_id: actualPlanId,
            position: i,
            name: meal.name,
            time_of_day: meal.time_of_day,
          }))
        )
        .select('id')

      if (mealsErr) { setError(mealsErr.message); setSaving(false); return }

      for (let mi = 0; mi < meals.length; mi++) {
        const meal = meals[mi]
        const mealId = insertedMeals?.[mi]?.id
        if (!mealId || !meal.foods?.length) continue

        const { error: foodsErr } = await supabase
          .from('meal_foods')
          .insert(
            meal.foods.map((food, fi) => ({
              meal_id: mealId,
              position: fi,
              name: food.name,
              quantity: food.quantity,
              unit: food.unit,
              calories: food.calories,
              protein_g: food.protein_g,
              carbs_g: food.carbs_g,
              fat_g: food.fat_g,
            }))
          )
        if (foodsErr) { setError(foodsErr.message); setSaving(false); return }
      }
    }

    setSuccess('Nutrition plan saved.')
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Header showBack title="Nutrition Plan" />
        <div className="px-4 py-5 flex flex-col gap-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface border border-border rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header showBack title={`Nutrition Plan — ${clientName}`} />
      <div className="px-4 py-5 flex flex-col gap-6">
        {!programId && (
          <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-muted">This client doesn&apos;t have an active program yet.</p>
          </div>
        )}

        {programId && (
          <>
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                <p className="text-sm text-success">{success}</p>
              </div>
            )}

            <div>
              <SectionHeader title="Macro Targets" subtitle="Set daily targets for this client" />
              <div className="bg-surface border border-border rounded-2xl p-4">
                <MacroTargetsForm
                  values={{
                    calorie_target: planMeta.calorie_target,
                    protein_target: planMeta.protein_target,
                    carb_target: planMeta.carb_target,
                    fat_target: planMeta.fat_target,
                  }}
                  onChange={(updated) => setPlanMeta((prev) => ({ ...prev, ...updated }))}
                />
              </div>
            </div>

            <div className="border-t border-border" />

            <div>
              <SectionHeader title="Meal Structure" subtitle="Optional — build a full day of eating" />
              <MealBuilder meals={meals} onChange={setMeals} />
            </div>

            <Button fullWidth onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Plan'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
