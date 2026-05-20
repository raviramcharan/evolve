'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Header } from '@/components/layout/Header'
import { NutritionSection, NutritionData } from '@/components/check-in/NutritionSection'
import { TrainingSection, TrainingData } from '@/components/check-in/TrainingSection'
import { LifestyleSection, LifestyleData } from '@/components/check-in/LifestyleSection'
import { ReflectionSection, ReflectionData } from '@/components/check-in/ReflectionSection'
import { CheckIn, Program } from '@/types'

const SECTIONS = ['Nutrition', 'Training', 'Lifestyle', 'Reflection'] as const

interface FormState {
  nutrition: NutritionData
  training: TrainingData
  lifestyle: LifestyleData
  reflection: ReflectionData
}

function checkInToFormState(c: CheckIn): FormState {
  return {
    nutrition: {
      hit_calorie_target: c.hit_calorie_target ?? '',
      avg_daily_calories: c.avg_daily_calories?.toString() ?? '',
      hit_protein_target: c.hit_protein_target ?? '',
      nutrition_sustainability: c.nutrition_sustainability,
      drank_alcohol: c.drank_alcohol,
      alcohol_units: c.alcohol_units?.toString() ?? '',
    },
    training: {
      workouts_completed: c.workouts_completed?.toString() ?? '',
      training_intensity: c.training_intensity ?? '',
      had_injury: c.had_injury,
      injury_notes: c.injury_notes ?? '',
    },
    lifestyle: {
      avg_sleep_hours: c.avg_sleep_hours?.toString() ?? '',
      sleep_quality: c.sleep_quality,
      stress_level: c.stress_level,
      hit_water_target: c.hit_water_target ?? '',
      energy_level: c.energy_level,
    },
    reflection: {
      current_weight: c.current_weight.toString(),
      went_well: c.went_well ?? '',
      was_challenging: c.was_challenging ?? '',
      do_differently: c.do_differently ?? '',
      overall_feeling: c.overall_feeling,
    },
  }
}

export default function CheckInEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [sectionIndex, setSectionIndex] = useState(0)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [error, setError] = useState('')

  const currentSection = SECTIONS[sectionIndex]
  const progress = ((sectionIndex + 1) / SECTIONS.length) * 100

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: ci, error: ciErr } = await supabase
        .from('check_ins')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (ciErr || !ci) { setFetchError('Check-in not found.'); return }

      const { data: prog, error: progErr } = await supabase
        .from('programs')
        .select('*')
        .eq('id', ci.program_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (progErr || !prog) { setFetchError('Program not found.'); return }

      setCheckIn(ci as CheckIn)
      setProgram(prog as Program)
      setFormState(checkInToFormState(ci as CheckIn))
    }
    fetchData()
  }, [id, router])

  function updateSection<K extends keyof FormState>(section: K, data: Partial<FormState[K]>) {
    setFormState((prev) => prev ? ({ ...prev, [section]: { ...prev[section], ...data } }) : prev)
  }

  function handleNext() {
    setError('')
    if (currentSection === 'Reflection' && !formState?.reflection.current_weight) {
      setError('Current weight is required.')
      return
    }
    if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex(sectionIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleSubmit() {
    if (!program || !checkIn || !formState) return
    setLoading(true)
    setError('')

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { nutrition, training, lifestyle, reflection } = formState

    const payload = {
      user_id: user.id,
      program_id: program.id,
      week_number: checkIn.week_number,
      check_in_date: checkIn.check_in_date,
      hit_calorie_target: nutrition.hit_calorie_target || null,
      avg_daily_calories: nutrition.avg_daily_calories ? parseFloat(nutrition.avg_daily_calories) : null,
      hit_protein_target: nutrition.hit_protein_target || null,
      nutrition_sustainability: nutrition.nutrition_sustainability,
      drank_alcohol: nutrition.drank_alcohol,
      alcohol_units: nutrition.drank_alcohol && nutrition.alcohol_units ? parseFloat(nutrition.alcohol_units) : null,
      workouts_completed: training.workouts_completed ? parseInt(training.workouts_completed, 10) : null,
      training_intensity: training.training_intensity || null,
      had_injury: training.had_injury,
      injury_notes: training.had_injury ? training.injury_notes || null : null,
      avg_sleep_hours: lifestyle.avg_sleep_hours ? parseFloat(lifestyle.avg_sleep_hours) : null,
      sleep_quality: lifestyle.sleep_quality,
      stress_level: lifestyle.stress_level,
      hit_water_target: lifestyle.hit_water_target || null,
      energy_level: lifestyle.energy_level,
      current_weight: parseFloat(reflection.current_weight),
      went_well: reflection.went_well.trim() || null,
      was_challenging: reflection.was_challenging.trim() || null,
      do_differently: reflection.do_differently.trim() || null,
      overall_feeling: reflection.overall_feeling,
    }

    const { error: upsertError } = await supabase
      .from('check_ins')
      .upsert(payload, { onConflict: 'user_id,program_id,week_number' })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    router.push(`/check-in/${id}`)
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <p className="text-danger text-sm">{fetchError}</p>
      </div>
    )
  }

  if (!formState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <Header showBack title={`Edit Week ${checkIn?.week_number} Check-in`} />
      <div className="px-4 py-5">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1.5">
              {SECTIONS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => i < sectionIndex && setSectionIndex(i)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                    i === sectionIndex
                      ? 'bg-accent text-black border-accent'
                      : i < sectionIndex
                      ? 'border-success/40 text-success bg-success/10 cursor-pointer'
                      : 'border-border text-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div className="mb-6">
          {currentSection === 'Nutrition' && (
            <NutritionSection
              data={formState.nutrition}
              onChange={(d) => updateSection('nutrition', d)}
            />
          )}
          {currentSection === 'Training' && (
            <TrainingSection
              data={formState.training}
              onChange={(d) => updateSection('training', d)}
            />
          )}
          {currentSection === 'Lifestyle' && (
            <LifestyleSection
              data={formState.lifestyle}
              onChange={(d) => updateSection('lifestyle', d)}
            />
          )}
          {currentSection === 'Reflection' && (
            <ReflectionSection
              data={formState.reflection}
              onChange={(d) => updateSection('reflection', d)}
            />
          )}
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          {sectionIndex > 0 && (
            <Button variant="ghost" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button
            fullWidth={sectionIndex === 0}
            onClick={handleNext}
            disabled={loading}
            className={sectionIndex > 0 ? 'flex-[2]' : ''}
          >
            {loading
              ? 'Saving...'
              : sectionIndex === SECTIONS.length - 1
              ? 'Save Changes'
              : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
