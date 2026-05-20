'use client'

import { useState } from 'react'
import { TrainingPlan } from '@/types'
import { DAY_LABELS } from '@/lib/nutrition'
import { Dumbbell, Moon, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  plan: TrainingPlan
}

export function TrainingPlanView({ plan }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const days = [...(plan.days ?? [])].sort((a, b) => a.day_of_week - b.day_of_week)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">{plan.title}</h2>
        {plan.notes && <p className="text-sm text-muted mt-1">{plan.notes}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const isExpanded = expandedDay === day.day_of_week
          const exercises = [...(day.exercises ?? [])].sort((a, b) => a.position - b.position)

          return (
            <div key={day.day_of_week} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => !day.is_rest_day && setExpandedDay(isExpanded ? null : day.day_of_week)}
                className={`w-full flex items-center justify-between px-4 py-4 text-left ${
                  day.is_rest_day ? 'cursor-default' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {day.is_rest_day ? (
                    <Moon size={16} className="text-muted" />
                  ) : (
                    <Dumbbell size={16} className="text-accent" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text">{DAY_LABELS[day.day_of_week]}</p>
                    <p className="text-xs text-muted">
                      {day.is_rest_day ? 'Rest & Recover' : day.workout_name || 'Workout'}
                    </p>
                  </div>
                </div>
                {!day.is_rest_day && (
                  <div className="flex items-center gap-2">
                    {exercises.length > 0 && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        {exercises.length} ex
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-muted" />
                    )}
                  </div>
                )}
              </button>

              {isExpanded && !day.is_rest_day && (
                <div className="px-4 pb-4 border-t border-border flex flex-col gap-3 pt-3">
                  {day.notes && <p className="text-xs text-muted">{day.notes}</p>}
                  {exercises.length === 0 ? (
                    <p className="text-sm text-muted">No exercises added yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {exercises.map((ex, i) => (
                        <div key={ex.id} className="bg-bg rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-text">
                                {i + 1}. {ex.name}
                              </p>
                              <p className="text-xs text-muted mt-0.5">
                                {ex.sets} sets × {ex.reps}
                                {ex.weight_kg !== null ? ` @ ${ex.weight_kg} kg` : ' — Bodyweight'}
                                {ex.rest_seconds ? ` · ${ex.rest_seconds}s rest` : ''}
                              </p>
                              {ex.notes && <p className="text-xs text-muted mt-0.5 italic">{ex.notes}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
