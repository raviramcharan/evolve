import { CheckIn, Program } from '@/types'
import { habitScore } from '@/lib/calculations'

interface HabitGridProps {
  checkIns: CheckIn[]
  program: Program
}

type HabitStatus = 'good' | 'partial' | 'missed' | 'empty'

function getDot(status: HabitStatus) {
  switch (status) {
    case 'good': return 'bg-success'
    case 'partial': return 'bg-warning'
    case 'missed': return 'bg-danger'
    default: return 'bg-border'
  }
}

function calorieStatus(checkIn: CheckIn): HabitStatus {
  if (!checkIn.hit_calorie_target) return 'empty'
  if (checkIn.hit_calorie_target === 'yes') return 'good'
  if (checkIn.hit_calorie_target === 'mostly') return 'partial'
  return 'missed'
}

function proteinStatus(checkIn: CheckIn): HabitStatus {
  if (!checkIn.hit_protein_target) return 'empty'
  if (checkIn.hit_protein_target === 'yes') return 'good'
  if (checkIn.hit_protein_target === 'mostly') return 'partial'
  return 'missed'
}

function workoutStatus(checkIn: CheckIn, program: Program): HabitStatus {
  if (checkIn.workouts_completed === null || program.workout_target === null) return 'empty'
  const ratio = checkIn.workouts_completed / program.workout_target
  if (ratio >= 1) return 'good'
  if (ratio >= 0.5) return 'partial'
  return 'missed'
}

function sleepStatus(checkIn: CheckIn): HabitStatus {
  if (checkIn.avg_sleep_hours === null) return 'empty'
  if (checkIn.avg_sleep_hours >= 7.5) return 'good'
  if (checkIn.avg_sleep_hours >= 6.5) return 'partial'
  return 'missed'
}

function waterStatus(checkIn: CheckIn): HabitStatus {
  if (!checkIn.hit_water_target) return 'empty'
  if (checkIn.hit_water_target === 'yes') return 'good'
  if (checkIn.hit_water_target === 'most_days') return 'partial'
  return 'missed'
}

function alcoholFreeStatus(checkIn: CheckIn): HabitStatus {
  return checkIn.drank_alcohol ? 'missed' : 'good'
}

const COLUMNS = ['Cals', 'Protein', 'Workouts', 'Sleep', 'Water', 'Alc-free']

export function HabitGrid({ checkIns, program }: HabitGridProps) {
  const sortedCheckIns = [...checkIns]
    .sort((a, b) => b.week_number - a.week_number)
    .slice(0, 4)
    .reverse()

  if (sortedCheckIns.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4">
        <p className="text-sm text-muted text-center py-4">No check-ins yet. Complete your first check-in to see habit data.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 overflow-x-auto">
      <table className="w-full min-w-[320px]">
        <thead>
          <tr>
            <th className="text-left text-xs text-muted font-medium pb-2 w-10">Week</th>
            {COLUMNS.map((col) => (
              <th key={col} className="text-center text-xs text-muted font-medium pb-2 px-1">
                {col}
              </th>
            ))}
            <th className="text-right text-xs text-muted font-medium pb-2 pl-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedCheckIns.map((checkIn) => {
            const statuses: HabitStatus[] = [
              calorieStatus(checkIn),
              proteinStatus(checkIn),
              workoutStatus(checkIn, program),
              sleepStatus(checkIn),
              waterStatus(checkIn),
              alcoholFreeStatus(checkIn),
            ]
            const score = habitScore(checkIn, program)
            return (
              <tr key={checkIn.id} className="border-t border-border/50">
                <td className="py-2.5 text-xs font-medium text-muted">W{checkIn.week_number}</td>
                {statuses.map((status, i) => (
                  <td key={i} className="py-2.5 text-center px-1">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${getDot(status)}`}
                      title={status}
                    />
                  </td>
                ))}
                <td className="py-2.5 text-right">
                  <span
                    className={`text-xs font-semibold ${
                      score >= 80
                        ? 'text-success'
                        : score >= 60
                        ? 'text-accent'
                        : score >= 40
                        ? 'text-warning'
                        : 'text-danger'
                    }`}
                  >
                    {score}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        {(['good', 'partial', 'missed'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${getDot(s)}`} />
            <span className="text-xs text-muted capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
