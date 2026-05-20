import { CheckIn, Program } from '@/types'
import { habitScore } from '@/lib/calculations'
import { formatWeight, feelingEmoji } from '@/lib/formatters'
import { HabitScoreBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface CheckInSummaryProps {
  checkIn: CheckIn
  program: Program
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted flex-shrink-0">{label}</span>
      <span className="text-sm text-text font-medium text-right">{String(value)}</span>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <p className="text-xs font-semibold text-muted uppercase tracking-widest mt-4 mb-1">{title}</p>
}

export function CheckInSummary({ checkIn, program }: CheckInSummaryProps) {
  const score = habitScore(checkIn, program)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Week {checkIn.week_number} Summary</p>
            <p className="font-display text-2xl font-bold text-text mt-0.5">
              {formatWeight(checkIn.current_weight)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Habit Score</p>
            <HabitScoreBadge score={score} className="text-2xl" />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Nutrition" />
        <Row label="Hit calorie target?" value={checkIn.hit_calorie_target} />
        <Row label="Avg daily calories" value={checkIn.avg_daily_calories ? `${checkIn.avg_daily_calories} kcal` : null} />
        <Row label="Hit protein target?" value={checkIn.hit_protein_target} />
        <Row label="Nutrition sustainability" value={checkIn.nutrition_sustainability ? `${checkIn.nutrition_sustainability}/5` : null} />
        <Row label="Drank alcohol?" value={checkIn.drank_alcohol ? 'Yes' : 'No'} />
        {checkIn.drank_alcohol && <Row label="Alcohol units" value={checkIn.alcohol_units} />}

        <SectionTitle title="Training" />
        <Row label="Workouts completed" value={checkIn.workouts_completed !== null ? `${checkIn.workouts_completed} / ${program.workout_target}` : null} />
        <Row label="Training intensity" value={checkIn.training_intensity} />
        <Row label="Had injury?" value={checkIn.had_injury ? 'Yes' : 'No'} />
        {checkIn.had_injury && <Row label="Injury notes" value={checkIn.injury_notes} />}

        <SectionTitle title="Lifestyle" />
        <Row label="Avg sleep hours" value={checkIn.avg_sleep_hours ? `${checkIn.avg_sleep_hours}h` : null} />
        <Row label="Sleep quality" value={checkIn.sleep_quality ? `${checkIn.sleep_quality}/5` : null} />
        <Row label="Stress level" value={checkIn.stress_level ? `${checkIn.stress_level}/5` : null} />
        <Row label="Hit water target?" value={checkIn.hit_water_target} />
        <Row label="Energy level" value={checkIn.energy_level ? `${checkIn.energy_level}/5` : null} />

        <SectionTitle title="Reflection" />
        {checkIn.went_well && (
          <div className="py-2 border-b border-border">
            <p className="text-xs text-muted mb-1">What went well</p>
            <p className="text-sm text-text">{checkIn.went_well}</p>
          </div>
        )}
        {checkIn.was_challenging && (
          <div className="py-2 border-b border-border">
            <p className="text-xs text-muted mb-1">What was challenging</p>
            <p className="text-sm text-text">{checkIn.was_challenging}</p>
          </div>
        )}
        {checkIn.do_differently && (
          <div className="py-2 border-b border-border">
            <p className="text-xs text-muted mb-1">Would do differently</p>
            <p className="text-sm text-text">{checkIn.do_differently}</p>
          </div>
        )}
        <Row
          label="Overall feeling"
          value={checkIn.overall_feeling ? `${feelingEmoji(checkIn.overall_feeling)} ${checkIn.overall_feeling}/5` : null}
        />
      </Card>
    </div>
  )
}
