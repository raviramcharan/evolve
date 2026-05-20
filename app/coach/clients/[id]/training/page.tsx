'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { WeeklyTrainingGrid } from '@/components/coach/training/WeeklyTrainingGrid'
import { TrainingDay, TrainingPlan } from '@/types'

function buildDefaultDays(planId: string): TrainingDay[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: crypto.randomUUID(),
    training_plan_id: planId,
    day_of_week: i,
    is_rest_day: true,
    workout_name: null,
    notes: null,
    exercises: [],
  }))
}

export default function CoachClientTrainingPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [clientName, setClientName] = useState('')
  const [planId, setPlanId] = useState<string | null>(null)
  const [programId, setProgramId] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [days, setDays] = useState<TrainingDay[]>([])
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
        .from('training_plans')
        .select(`
          *,
          days:training_days (
            *,
            exercises:training_exercises (*)
          )
        `)
        .eq('client_id', clientId)
        .eq('program_id', prog.id)
        .maybeSingle()

      if (plan) {
        setPlanId(plan.id)
        const rawDays = plan.days as TrainingDay[]
        const sorted: TrainingDay[] = (rawDays ?? [])
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((d) => ({
            ...d,
            exercises: [...(d.exercises ?? [])].sort((a, b) => a.position - b.position),
          }))
        // Ensure all 7 days exist
        const dayMap = new Map(sorted.map((d: TrainingDay) => [d.day_of_week, d]))
        const newPlanId = plan.id
        const fullDays: TrainingDay[] = Array.from({ length: 7 }, (_, i): TrainingDay => {
          const existing = dayMap.get(i)
          if (existing) return existing
          return {
            id: crypto.randomUUID(),
            training_plan_id: newPlanId,
            day_of_week: i,
            is_rest_day: true,
            workout_name: null,
            notes: null,
            exercises: [],
          }
        })
        setDays(fullDays)
      } else {
        const tempPlanId = crypto.randomUUID()
        setPlanId(tempPlanId)
        setDays(buildDefaultDays(tempPlanId))
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
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseClient()

    // Upsert plan
    const planRecord = {
      id: planId!,
      client_id: clientId,
      program_id: programId,
      coach_id: coachId,
      title: 'Training Plan',
      updated_at: new Date().toISOString(),
    }

    const { error: planErr } = await supabase
      .from('training_plans')
      .upsert(planRecord, { onConflict: 'client_id,program_id' })

    if (planErr) { setError(planErr.message); setSaving(false); return }

    // Re-fetch actual plan id (in case of conflict resolution)
    const { data: fetchedPlan } = await supabase
      .from('training_plans')
      .select('id')
      .eq('client_id', clientId)
      .eq('program_id', programId)
      .single()

    const actualPlanId = fetchedPlan?.id ?? planId!

    for (const day of days) {
      const dayRecord = {
        id: day.id,
        training_plan_id: actualPlanId,
        day_of_week: day.day_of_week,
        is_rest_day: day.is_rest_day,
        workout_name: day.workout_name,
        notes: day.notes,
      }

      const { error: dayErr } = await supabase
        .from('training_days')
        .upsert(dayRecord, { onConflict: 'training_plan_id,day_of_week' })

      if (dayErr) { setError(dayErr.message); setSaving(false); return }

      // Re-fetch actual day id
      const { data: fetchedDay } = await supabase
        .from('training_days')
        .select('id')
        .eq('training_plan_id', actualPlanId)
        .eq('day_of_week', day.day_of_week)
        .single()

      const actualDayId = fetchedDay?.id ?? day.id

      await supabase
        .from('training_exercises')
        .delete()
        .eq('training_day_id', actualDayId)

      if (!day.is_rest_day && day.exercises && day.exercises.length > 0) {
        const { error: exErr } = await supabase
          .from('training_exercises')
          .insert(
            day.exercises.map((ex, i) => ({
              training_day_id: actualDayId,
              position: i,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight_kg: ex.weight_kg,
              rest_seconds: ex.rest_seconds,
              notes: ex.notes,
            }))
          )
        if (exErr) { setError(exErr.message); setSaving(false); return }
      }
    }

    setSuccess('Training plan saved.')
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Header showBack title="Training Plan" />
        <div className="px-4 py-5 flex flex-col gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface border border-border rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header showBack title={`Training Plan — ${clientName}`} />
      <div className="px-4 py-5 flex flex-col gap-4">
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
            <WeeklyTrainingGrid
              days={days}
              onChange={setDays}
              onSave={handleSave}
              saving={saving}
            />
          </>
        )}
      </div>
    </div>
  )
}
