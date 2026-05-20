'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowLeft } from 'lucide-react'

interface FormData {
  name: string
  start_weight: string
  goal_weight: string
  start_date: string
  calorie_target: string
  protein_target: string
  workout_target: string
}

const STEPS = [
  { field: 'name', title: "What's your name?", subtitle: "We'll personalise your experience.", label: 'Your name', placeholder: 'e.g. Alex', type: 'text', inputMode: undefined },
  { field: 'start_weight', title: 'What do you weigh now?', subtitle: 'Enter your current weight in kilograms.', label: 'Current weight (kg)', placeholder: 'e.g. 88.5', type: 'number', inputMode: 'decimal' as const },
  { field: 'goal_weight', title: 'What\'s your goal weight?', subtitle: 'Where do you want to be in 12 weeks?', label: 'Goal weight (kg)', placeholder: 'e.g. 80.0', type: 'number', inputMode: 'decimal' as const },
  { field: 'start_date', title: 'When do you want to start?', subtitle: 'Pick the first day of your program.', label: 'Start date', placeholder: '', type: 'date', inputMode: undefined },
  { field: 'calorie_target', title: 'What\'s your daily calorie target?', subtitle: 'This is your nutrition goal each day.', label: 'Daily calories (kcal)', placeholder: 'e.g. 1900', type: 'number', inputMode: 'numeric' as const },
  { field: 'protein_target', title: 'What\'s your daily protein target?', subtitle: 'Protein is key for retaining muscle while losing fat.', label: 'Daily protein (g)', placeholder: 'e.g. 150', type: 'number', inputMode: 'numeric' as const },
  { field: 'workout_target', title: 'How many workouts per week?', subtitle: 'Set a realistic training frequency.', label: 'Workouts per week', placeholder: 'e.g. 4', type: 'number', inputMode: 'numeric' as const },
] as const

const today = new Date().toISOString().split('T')[0]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
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

  const currentStep = STEPS[step]
  const field = currentStep.field as keyof FormData
  const progress = ((step + 1) / STEPS.length) * 100

  function handleNext() {
    if (!formData[field]) {
      setError('This field is required.')
      return
    }
    setError('')
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
      setError('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleNext()
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const supabase = createSupabaseClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          name: formData.name.trim(),
          updated_at: new Date().toISOString(),
        })
      if (profileError) throw profileError

      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7 * 12 - 1)

      const { error: programError } = await supabase.from('programs').insert({
        user_id: user.id,
        title: `${formData.name.trim()}'s 12-Week Program`,
        start_date: formData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        start_weight: parseFloat(formData.start_weight),
        goal_weight: parseFloat(formData.goal_weight),
        calorie_target: parseInt(formData.calorie_target, 10),
        protein_target: parseInt(formData.protein_target, 10),
        workout_target: parseInt(formData.workout_target, 10),
        is_active: true,
      })
      if (programError) throw programError

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-8">
      <div className="flex items-center gap-3 mb-8">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="text-muted hover:text-text transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <ProgressBar value={progress} />
        </div>
        <span className="text-xs text-muted font-medium">{step + 1}/{STEPS.length}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-bold text-text mb-2">{currentStep.title}</h1>
        <p className="text-muted text-sm mb-8">{currentStep.subtitle}</p>

        <Input
          label={currentStep.label}
          type={currentStep.type}
          placeholder={currentStep.placeholder || (field === 'start_date' ? today : '')}
          value={formData[field]}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }))
            setError('')
          }}
          onKeyDown={handleKeyDown}
          inputMode={currentStep.inputMode}
          step={currentStep.type === 'number' ? (field === 'start_weight' || field === 'goal_weight' ? '0.1' : '1') : undefined}
          min={currentStep.type === 'number' ? '0' : undefined}
          autoFocus
          error={error}
        />

        <Button
          fullWidth
          onClick={handleNext}
          disabled={loading}
          className="mt-6"
        >
          {loading
            ? 'Setting up your program...'
            : step === STEPS.length - 1
            ? 'Start My Program'
            : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
