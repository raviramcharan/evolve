'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Program } from '@/types'
import { formatDate } from '@/lib/formatters'
import { getCurrentWeek } from '@/lib/calculations'

interface ClientProfile {
  name: string
  date_of_birth: string | null
  height_cm: number | null
}

interface ProgramForm {
  start_date: string
  start_weight: string
  goal_weight: string
  calorie_target: string
  protein_target: string
  workout_target: string
}

const today = new Date().toISOString().split('T')[0]

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export default function CoachClientProgramPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientProfile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [form, setForm] = useState<ProgramForm>({
    start_date: today,
    start_weight: '',
    goal_weight: '',
    calorie_target: '',
    protein_target: '',
    workout_target: '',
  })
  const [adjustReason, setAdjustReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: clientData } = await supabase
        .from('users')
        .select('name, date_of_birth, height_cm')
        .eq('id', clientId)
        .eq('coach_id', user.id)
        .maybeSingle()

      if (!clientData) { router.push('/coach/clients'); return }
      setClient({ name: clientData.name ?? 'Client', date_of_birth: clientData.date_of_birth, height_cm: clientData.height_cm })

      const { data: prog } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', clientId)
        .eq('is_active', true)
        .maybeSingle()

      if (prog) {
        const p = prog as Program
        setProgram(p)
        setForm({
          start_date: p.start_date,
          start_weight: p.start_weight.toString(),
          goal_weight: p.goal_weight.toString(),
          calorie_target: p.calorie_target?.toString() ?? '',
          protein_target: p.protein_target?.toString() ?? '',
          workout_target: p.workout_target?.toString() ?? '',
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [clientId, router])

  function update(field: keyof ProgramForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  async function handleSave() {
    const { start_date, start_weight, goal_weight, calorie_target, protein_target, workout_target } = form
    if (!start_date || !start_weight || !goal_weight || !calorie_target || !protein_target || !workout_target) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (program) {
      const { error: updateErr } = await supabase
        .from('programs')
        .update({
          calorie_target: parseInt(calorie_target, 10),
          protein_target: parseInt(protein_target, 10),
          workout_target: parseInt(workout_target, 10),
          goal_weight: parseFloat(goal_weight),
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id)

      if (updateErr) { setError(updateErr.message); setSaving(false); return }

      const currentWeek = getCurrentWeek(program.start_date)
      await supabase.from('goal_adjustments').insert({
        user_id: clientId,
        program_id: program.id,
        adjusted_at: new Date().toISOString().split('T')[0],
        week_number: currentWeek,
        calorie_target: parseInt(calorie_target, 10),
        protein_target: parseInt(protein_target, 10),
        workout_target: parseInt(workout_target, 10),
        reason: adjustReason.trim() || null,
        adjusted_by: 'coach',
      })

      setSuccess('Program updated successfully.')
    } else {
      const endDate = addDays(start_date, 84)
      const { error: insertErr } = await supabase.from('programs').insert({
        user_id: clientId,
        title: `${client?.name ?? 'Client'}'s 12-Week Program`,
        start_date,
        end_date: endDate,
        start_weight: parseFloat(start_weight),
        goal_weight: parseFloat(goal_weight),
        calorie_target: parseInt(calorie_target, 10),
        protein_target: parseInt(protein_target, 10),
        workout_target: parseInt(workout_target, 10),
        is_active: true,
        created_by: 'coach',
      })

      if (insertErr) { setError(insertErr.message); setSaving(false); return }
      setSuccess('Program created successfully.')
      router.push(`/coach/clients/${clientId}`)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Header showBack title="Program" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface border border-border rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header showBack title={program ? 'Edit Program' : 'Create Program'} />
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Client profile — context for setting targets */}
        {client && (
          <Card>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Client Profile</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {client.date_of_birth && (
                <>
                  <span className="text-muted">Age</span>
                  <span className="text-text font-medium text-right">{calcAge(client.date_of_birth)} yrs</span>
                </>
              )}
              {client.height_cm && (
                <>
                  <span className="text-muted">Height</span>
                  <span className="text-text font-medium text-right">{client.height_cm} cm</span>
                </>
              )}
              {program && (
                <>
                  <span className="text-muted">Start weight</span>
                  <span className="text-text font-medium text-right">{program.start_weight} kg</span>
                  <span className="text-muted">Goal weight</span>
                  <span className="text-text font-medium text-right">{program.goal_weight} kg</span>
                </>
              )}
            </div>
          </Card>
        )}

        {program && (
          <Card>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Started</span>
              <span className="text-text font-medium">{formatDate(program.start_date)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted">Ends</span>
              <span className="text-text font-medium">{formatDate(program.end_date)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted">Current week</span>
              <span className="text-text font-medium">Week {getCurrentWeek(program.start_date)}</span>
            </div>
          </Card>
        )}

        <div>
          <SectionHeader title="Targets" subtitle={program ? 'Adjust targets for this client' : 'Set up targets for this client'} />
          <Card>
            <div className="flex flex-col gap-4">
              {!program && (
                <>
                  <Input label="Start date" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
                  <Input label="Start weight (kg)" type="number" step="0.1" placeholder="e.g. 88.5" value={form.start_weight} onChange={(e) => update('start_weight', e.target.value)} inputMode="decimal" />
                  <Input label="Goal weight (kg)" type="number" step="0.1" placeholder="e.g. 80.0" value={form.goal_weight} onChange={(e) => update('goal_weight', e.target.value)} inputMode="decimal" />
                </>
              )}
              {program && (
                <Input label="Goal weight (kg)" type="number" step="0.1" placeholder="e.g. 80.0" value={form.goal_weight} onChange={(e) => update('goal_weight', e.target.value)} inputMode="decimal" />
              )}
              <Input label="Daily calories (kcal)" type="number" placeholder="e.g. 1900" value={form.calorie_target} onChange={(e) => update('calorie_target', e.target.value)} inputMode="numeric" />
              <Input label="Daily protein (g)" type="number" placeholder="e.g. 150" value={form.protein_target} onChange={(e) => update('protein_target', e.target.value)} inputMode="numeric" />
              <Input label="Weekly workouts" type="number" placeholder="e.g. 4" value={form.workout_target} onChange={(e) => update('workout_target', e.target.value)} inputMode="numeric" />
              {program && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-muted font-medium">Reason for adjustment (optional)</label>
                  <textarea
                    className="bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none text-sm"
                    placeholder="e.g. Plateau at current calories, reducing by 100 kcal"
                    rows={2}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-danger">{error}</p></div>}
            {success && <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-success">{success}</p></div>}

            <Button fullWidth onClick={handleSave} disabled={saving} className="mt-5">
              {saving ? 'Saving...' : program ? 'Save Changes' : 'Set Targets'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
