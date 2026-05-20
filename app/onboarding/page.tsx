'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { generateCoachCode, validateCoachCode } from '@/lib/coach-code'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowLeft, Users, User } from 'lucide-react'

type Role = 'coach' | 'client'

interface ClientFormData {
  coach_code: string
  name: string
  start_weight: string
  goal_weight: string
  start_date: string
  calorie_target: string
  protein_target: string
  workout_target: string
}

const CLIENT_STEPS = [
  { field: 'name', title: "What's your name?", subtitle: "We'll personalise your experience.", label: 'Your name', placeholder: 'e.g. Alex', type: 'text' },
  { field: 'start_weight', title: 'What do you weigh now?', subtitle: 'Enter your current weight in kilograms.', label: 'Current weight (kg)', placeholder: 'e.g. 88.5', type: 'number' },
  { field: 'goal_weight', title: "What's your goal weight?", subtitle: 'Where do you want to be in 12 weeks?', label: 'Goal weight (kg)', placeholder: 'e.g. 80.0', type: 'number' },
  { field: 'start_date', title: 'When do you want to start?', subtitle: 'Pick the first day of your program.', label: 'Start date', placeholder: '', type: 'date' },
  { field: 'calorie_target', title: "What's your daily calorie target?", subtitle: 'This is your nutrition goal each day.', label: 'Daily calories (kcal)', placeholder: 'e.g. 1900', type: 'number' },
  { field: 'protein_target', title: "What's your daily protein target?", subtitle: 'Protein is key for retaining muscle while losing fat.', label: 'Daily protein (g)', placeholder: 'e.g. 150', type: 'number' },
  { field: 'workout_target', title: 'How many workouts per week?', subtitle: 'Set a realistic training frequency.', label: 'Workouts per week', placeholder: 'e.g. 4', type: 'number' },
] as const

const today = new Date().toISOString().split('T')[0]

export default function OnboardingPage() {
  const router = useRouter()

  // Stage: 'role' | 'coach_code' | 'coach_name' | 'client_steps'
  const [stage, setStage] = useState<'role' | 'coach_code' | 'coach_name' | 'client_steps'>('role')
  const [role, setRole] = useState<Role | null>(null)
  const [coachName, setCoachName] = useState('')
  const [resolvedCoach, setResolvedCoach] = useState<{ coachId: string; coachName: string } | null>(null)
  const [coachCodeInput, setCoachCodeInput] = useState('')
  const [clientStep, setClientStep] = useState(0)
  const [clientForm, setClientForm] = useState<ClientFormData>({
    coach_code: '',
    name: '',
    start_weight: '',
    goal_weight: '',
    start_date: today,
    calorie_target: '',
    protein_target: '',
    workout_target: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Progress: role=0, then steps progress
  const totalSteps = role === 'coach' ? 1 : CLIENT_STEPS.length
  const currentStepIndex = stage === 'coach_name' ? 0 : clientStep
  const progress = role ? ((currentStepIndex + 1) / totalSteps) * 100 : 10

  function handleRoleSelect(r: Role) {
    setRole(r)
    setError('')
    if (r === 'coach') {
      setStage('coach_name')
    } else {
      setStage('coach_code')
    }
  }

  async function handleCoachCodeNext() {
    setError('')
    if (!coachCodeInput.trim()) {
      // Skip coach code — solo client
      setStage('client_steps')
      return
    }
    setLoading(true)
    const supabase = createSupabaseClient()
    const result = await validateCoachCode(supabase, coachCodeInput)
    setLoading(false)
    if (!result) {
      setError('Coach code not found. Check the code and try again, or skip to continue without a coach.')
      return
    }
    setResolvedCoach(result)
    setStage('client_steps')
  }

  async function handleCoachSubmit() {
    if (!coachName.trim()) { setError('Please enter your name.'); return }
    setLoading(true)
    setError('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const code = generateCoachCode(coachName)

    const { error: profileErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: coachName.trim(),
      role: 'coach',
      updated_at: new Date().toISOString(),
    })
    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    const { error: coachErr } = await supabase.from('coaches').upsert({ id: user.id, coach_code: code })
    if (coachErr) { setError(coachErr.message); setLoading(false); return }

    router.push('/coach/dashboard')
  }

  async function handleClientNext() {
    const step = CLIENT_STEPS[clientStep]
    const field = step.field as keyof ClientFormData
    const value = clientForm[field]

    if (!value && field !== 'coach_code') {
      setError('This field is required.')
      return
    }
    setError('')

    if (clientStep < CLIENT_STEPS.length - 1) {
      setClientStep(clientStep + 1)
    } else {
      await handleClientSubmit()
    }
  }

  async function handleClientSubmit() {
    setLoading(true)
    setError('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: profileErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: clientForm.name.trim(),
      role: 'client',
      coach_id: resolvedCoach?.coachId ?? null,
      updated_at: new Date().toISOString(),
    })
    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    const { error: programErr } = await supabase.from('programs').insert({
      user_id: user.id,
      title: `${clientForm.name.trim()}'s 12-Week Program`,
      start_date: clientForm.start_date,
      start_weight: parseFloat(clientForm.start_weight),
      goal_weight: parseFloat(clientForm.goal_weight),
      calorie_target: parseInt(clientForm.calorie_target, 10),
      protein_target: parseInt(clientForm.protein_target, 10),
      workout_target: parseInt(clientForm.workout_target, 10),
      is_active: true,
      created_by: 'client',
    })
    if (programErr) { setError(programErr.message); setLoading(false); return }

    router.push('/dashboard')
  }

  // Role selection screen
  if (stage === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold text-accent mb-2">Evolve</h1>
            <p className="font-display text-2xl font-semibold text-text mb-2">How are you using Evolve?</p>
            <p className="text-muted text-sm">Choose your role to get started.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRoleSelect('coach')}
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-2xl p-5 text-left transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-text">I&apos;m a Coach</p>
                <p className="text-sm text-muted mt-0.5">Manage clients, assign programs, track progress</p>
              </div>
            </button>
            <button
              onClick={() => handleRoleSelect('client')}
              className="flex items-center gap-4 bg-surface border border-border hover:border-accent rounded-2xl p-5 text-left transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <User size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-text">I&apos;m a Client</p>
                <p className="text-sm text-muted mt-0.5">Follow your program and log weekly check-ins</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Coach name screen
  if (stage === 'coach_name') {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setStage('role')} className="text-muted hover:text-text transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1"><ProgressBar value={50} /></div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h1 className="font-display text-3xl font-bold text-text mb-2">What&apos;s your name?</h1>
          <p className="text-muted text-sm mb-8">Your clients will see this on their profile.</p>
          <Input
            label="Your name"
            type="text"
            placeholder="e.g. Sam"
            value={coachName}
            onChange={(e) => { setCoachName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleCoachSubmit()}
            autoFocus
            error={error}
          />
          <Button fullWidth onClick={handleCoachSubmit} disabled={loading} className="mt-6">
            {loading ? 'Setting up your account...' : 'Create Coach Account'}
          </Button>
        </div>
      </div>
    )
  }

  // Client coach code screen
  if (stage === 'coach_code') {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setStage('role')} className="text-muted hover:text-text transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1"><ProgressBar value={20} /></div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h1 className="font-display text-3xl font-bold text-text mb-2">Do you have a coach code?</h1>
          <p className="text-muted text-sm mb-8">Enter the code your coach shared with you, or skip to use Evolve on your own.</p>
          <Input
            label="Coach code"
            type="text"
            placeholder="e.g. SA-X9K2PL"
            value={coachCodeInput}
            onChange={(e) => { setCoachCodeInput(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleCoachCodeNext()}
            autoFocus
            error={error}
          />
          <Button fullWidth onClick={handleCoachCodeNext} disabled={loading} className="mt-6">
            {loading ? 'Validating...' : coachCodeInput.trim() ? 'Continue' : 'Skip'}
          </Button>
        </div>
      </div>
    )
  }

  // Client steps
  const step = CLIENT_STEPS[clientStep]
  const field = step.field as keyof ClientFormData

  return (
    <div className="min-h-screen flex flex-col px-5 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => {
            if (clientStep > 0) { setClientStep(clientStep - 1); setError('') }
            else setStage('coach_code')
          }}
          className="text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1"><ProgressBar value={progress} /></div>
        <span className="text-xs text-muted font-medium">{clientStep + 1}/{CLIENT_STEPS.length}</span>
      </div>

      {resolvedCoach && clientStep === 0 && (
        <div className="max-w-sm mx-auto w-full mb-6">
          <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3">
            <p className="text-sm text-success">Connected to <strong>{resolvedCoach.coachName}</strong></p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-bold text-text mb-2">{step.title}</h1>
        <p className="text-muted text-sm mb-8">{step.subtitle}</p>

        <Input
          label={step.label}
          type={step.type}
          placeholder={step.placeholder || (field === 'start_date' ? today : '')}
          value={clientForm[field]}
          onChange={(e) => { setClientForm((prev) => ({ ...prev, [field]: e.target.value })); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleClientNext()}
          step={step.type === 'number' ? (field === 'start_weight' || field === 'goal_weight' ? '0.1' : '1') : undefined}
          min={step.type === 'number' ? '0' : undefined}
          autoFocus
          error={error}
        />

        <Button fullWidth onClick={handleClientNext} disabled={loading} className="mt-6">
          {loading
            ? 'Setting up your program...'
            : clientStep === CLIENT_STEPS.length - 1
            ? 'Start My Program'
            : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
