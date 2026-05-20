'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowLeft } from 'lucide-react'

const STEPS = [
  { field: 'name',           title: "What's your name?",              subtitle: "We'll personalise your experience.",              label: 'Your name',           placeholder: 'e.g. Alex',  type: 'text'   },
  { field: 'start_weight',   title: 'What do you weigh now?',         subtitle: 'Enter your current weight in kilograms.',         label: 'Current weight (kg)', placeholder: 'e.g. 88.5', type: 'number' },
  { field: 'goal_weight',    title: "What's your goal weight?",       subtitle: 'Where do you want to be in 12 weeks?',            label: 'Goal weight (kg)',    placeholder: 'e.g. 80.0', type: 'number' },
  { field: 'start_date',     title: 'When do you want to start?',     subtitle: 'Pick the first day of your program.',             label: 'Start date',          placeholder: '',           type: 'date'   },
  { field: 'calorie_target', title: "What's your daily calorie target?", subtitle: 'Your nutrition goal each day.',               label: 'Daily calories (kcal)',placeholder: 'e.g. 1900', type: 'number' },
  { field: 'protein_target', title: "What's your daily protein target?", subtitle: 'Key for retaining muscle while losing fat.',  label: 'Daily protein (g)',   placeholder: 'e.g. 150',  type: 'number' },
  { field: 'workout_target', title: 'How many workouts per week?',    subtitle: 'Set a realistic training frequency.',             label: 'Workouts per week',   placeholder: 'e.g. 4',    type: 'number' },
] as const

type Field = typeof STEPS[number]['field']
type FormData = Record<Field, string>

const today = new Date().toISOString().split('T')[0]

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invite = searchParams.get('invite') ?? ''

  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: '', start_weight: '', goal_weight: '',
    start_date: today, calorie_target: '', protein_target: '', workout_target: '',
  })
  const [coachName, setCoachName] = useState<string | null>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!invite) return
    async function lookupCoach() {
      const supabase = createSupabaseClient()
      const { data } = await supabase
        .from('coaches')
        .select('id, users(name)')
        .eq('coach_code', invite.toUpperCase().trim())
        .maybeSingle()
      if (data) {
        const u = Array.isArray(data.users) ? data.users[0] : data.users as { name: string | null } | null
        setCoachName(u?.name ?? 'Your coach')
        setCoachId(data.id)
      }
    }
    lookupCoach()
  }, [invite])

  const currentStep = STEPS[step]
  const field = currentStep.field
  const progress = ((step + 1) / STEPS.length) * 100

  function handleNext() {
    if (!formData[field]) { setError('This field is required.'); return }
    setError('')
    if (step < STEPS.length - 1) { setStep(step + 1) }
    else { handleSubmit() }
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: profileErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: formData.name.trim(),
      role: 'client',
      coach_id: coachId ?? null,
      updated_at: new Date().toISOString(),
    })
    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    const { error: programErr } = await supabase.from('programs').insert({
      user_id: user.id,
      title: `${formData.name.trim()}'s 12-Week Program`,
      start_date: formData.start_date,
      start_weight: parseFloat(formData.start_weight),
      goal_weight: parseFloat(formData.goal_weight),
      calorie_target: parseInt(formData.calorie_target, 10),
      protein_target: parseInt(formData.protein_target, 10),
      workout_target: parseInt(formData.workout_target, 10),
      is_active: true,
      created_by: 'client',
    })
    if (programErr) { setError(programErr.message); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-8">
      <div className="flex items-center gap-3 mb-8">
        {step > 0 && (
          <button onClick={() => { setStep(step - 1); setError('') }} className="text-muted hover:text-text transition-colors">
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex-1"><ProgressBar value={progress} /></div>
        <span className="text-xs text-muted font-medium">{step + 1}/{STEPS.length}</span>
      </div>

      {coachName && step === 0 && (
        <div className="max-w-sm mx-auto w-full mb-5">
          <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-2">
            <p className="text-sm text-success">Invited by <strong>{coachName}</strong></p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-bold text-text mb-2">{currentStep.title}</h1>
        <p className="text-muted text-sm mb-8">{currentStep.subtitle}</p>

        <Input
          label={currentStep.label}
          type={currentStep.type}
          placeholder={currentStep.placeholder || (field === 'start_date' ? today : '')}
          value={formData[field]}
          onChange={(e) => { setFormData((prev) => ({ ...prev, [field]: e.target.value })); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          step={currentStep.type === 'number' ? (field === 'start_weight' || field === 'goal_weight' ? '0.1' : '1') : undefined}
          min={currentStep.type === 'number' ? '0' : undefined}
          autoFocus
          error={error}
        />

        <Button fullWidth onClick={handleNext} disabled={loading} className="mt-6">
          {loading ? 'Setting up your program...' : step === STEPS.length - 1 ? 'Start My Program' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}
