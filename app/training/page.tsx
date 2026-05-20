import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/Header'
import { TrainingPlanView } from '@/components/client/training/TrainingPlanView'
import { TrainingPlan, TrainingDay } from '@/types'

export default async function ClientTrainingPage() {
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
        <Header title="Training Plan" />
        <div className="px-4 py-5">
          <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-muted">Your coach hasn&apos;t assigned a training plan yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: plan } = await supabase
    .from('training_plans')
    .select(`
      *,
      days:training_days (
        *,
        exercises:training_exercises (*)
      )
    `)
    .eq('client_id', user.id)
    .eq('program_id', program.id)
    .maybeSingle()

  if (!plan) {
    return (
      <div>
        <Header title="Training Plan" />
        <div className="px-4 py-5">
          <div className="bg-surface border border-border rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-muted">Your coach hasn&apos;t assigned a training plan yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const sortedDays = [...(plan.days ?? [])]
    .sort((a: TrainingDay, b: TrainingDay) => a.day_of_week - b.day_of_week)
    .map((d: TrainingDay) => ({
      ...d,
      exercises: [...(d.exercises ?? [])].sort((a, b) => a.position - b.position),
    }))

  const typedPlan: TrainingPlan = { ...plan, days: sortedDays }

  return (
    <div>
      <Header title="Training Plan" />
      <div className="px-4 py-5">
        <TrainingPlanView plan={typedPlan} />
      </div>
    </div>
  )
}
