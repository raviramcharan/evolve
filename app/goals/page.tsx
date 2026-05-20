'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { getCurrentWeek } from '@/lib/calculations'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Program, GoalAdjustment } from '@/types'

interface GoalForm {
  calorie_target: string
  protein_target: string
  workout_target: string
  reason: string
}

export default function GoalsPage() {
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [adjustments, setAdjustments] = useState<GoalAdjustment[]>([])
  const [form, setForm] = useState<GoalForm>({
    calorie_target: '',
    protein_target: '',
    workout_target: '',
    reason: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (!programData) { router.push('/onboarding'); return }

      const { data: adjustmentsData } = await supabase
        .from('goal_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programData.id)
        .order('created_at', { ascending: false })

      const p = programData as Program
      setProgram(p)
      setAdjustments((adjustmentsData ?? []) as GoalAdjustment[])
      setForm({
        calorie_target: String(p.calorie_target),
        protein_target: String(p.protein_target),
        workout_target: String(p.workout_target),
        reason: '',
      })
      setLoading(false)
    }
    fetchData()
  }, [router])

  async function handleSave() {
    if (!program) return
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const newCalories = parseInt(form.calorie_target, 10)
    const newProtein = parseInt(form.protein_target, 10)
    const newWorkouts = parseInt(form.workout_target, 10)

    if (isNaN(newCalories) || isNaN(newProtein) || isNaN(newWorkouts)) {
      setError('Please enter valid numbers for all targets.')
      setSaving(false)
      return
    }

    const currentWeek = getCurrentWeek(program.start_date)

    const { error: adjustError } = await supabase.from('goal_adjustments').insert({
      user_id: user.id,
      program_id: program.id,
      week_number: currentWeek,
      calorie_target: newCalories !== program.calorie_target ? newCalories : null,
      protein_target: newProtein !== program.protein_target ? newProtein : null,
      workout_target: newWorkouts !== program.workout_target ? newWorkouts : null,
      reason: form.reason.trim() || null,
      adjusted_at: new Date().toISOString(),
    })

    if (adjustError) {
      setError(adjustError.message)
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('programs')
      .update({
        calorie_target: newCalories,
        protein_target: newProtein,
        workout_target: newWorkouts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', program.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setProgram((prev) => prev ? { ...prev, calorie_target: newCalories, protein_target: newProtein, workout_target: newWorkouts } : prev)
    setSuccess('Goals updated successfully.')
    setForm((prev) => ({ ...prev, reason: '' }))

    const { data: newAdjustments } = await supabase
      .from('goal_adjustments')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', program.id)
      .order('created_at', { ascending: false })

    setAdjustments((newAdjustments ?? []) as GoalAdjustment[])
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Header showBack title="Goals" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          <div className="h-40 bg-surface border border-border rounded-2xl" />
          <div className="h-20 bg-surface border border-border rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!program) return null

  return (
    <div>
      <Header showBack title="Goals" />
      <div className="px-4 py-5 flex flex-col gap-6">
        <div>
          <SectionHeader title="Current Targets" subtitle="Edit your weekly targets below." />
          <Card>
            <div className="flex flex-col gap-4">
              <Input
                label="Daily calories (kcal)"
                type="number"
                value={form.calorie_target}
                onChange={(e) => setForm((prev) => ({ ...prev, calorie_target: e.target.value }))}
                inputMode="numeric"
              />
              <Input
                label="Daily protein (g)"
                type="number"
                value={form.protein_target}
                onChange={(e) => setForm((prev) => ({ ...prev, protein_target: e.target.value }))}
                inputMode="numeric"
              />
              <Input
                label="Workouts per week"
                type="number"
                value={form.workout_target}
                onChange={(e) => setForm((prev) => ({ ...prev, workout_target: e.target.value }))}
                inputMode="numeric"
                min="1"
                max="7"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted font-medium">Reason for change (optional)</label>
                <textarea
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="e.g. Plateau reached, increasing deficit..."
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-success">{success}</p>
              </div>
            )}

            <Button fullWidth onClick={handleSave} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card>
        </div>

        <div>
          <SectionHeader title="Goal History" subtitle="A log of all adjustments made." />
          {adjustments.length === 0 ? (
            <p className="text-sm text-muted">No adjustments made yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {adjustments.map((adj) => (
                <Card key={adj.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted mb-2">{formatDate(adj.adjusted_at)} · Week {adj.week_number}</p>
                      <div className="flex flex-wrap gap-2">
                        {adj.calorie_target !== null && (
                          <span className="text-xs bg-border rounded-lg px-2 py-1 text-text">
                            Calories → {adj.calorie_target} kcal
                          </span>
                        )}
                        {adj.protein_target !== null && (
                          <span className="text-xs bg-border rounded-lg px-2 py-1 text-text">
                            Protein → {adj.protein_target}g
                          </span>
                        )}
                        {adj.workout_target !== null && (
                          <span className="text-xs bg-border rounded-lg px-2 py-1 text-text">
                            Workouts → {adj.workout_target}×/wk
                          </span>
                        )}
                      </div>
                      {adj.reason && (
                        <p className="text-xs text-muted mt-2 italic">&ldquo;{adj.reason}&rdquo;</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
