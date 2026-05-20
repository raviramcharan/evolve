'use client'

import { useState } from 'react'
import { TrainingDay } from '@/types'
import { DayWorkoutEditor } from './DayWorkoutEditor'
import { Button } from '@/components/ui/Button'
import { DAY_LABELS } from '@/lib/nutrition'
import { ChevronDown, ChevronUp, Dumbbell, Moon } from 'lucide-react'

interface Props {
  days: TrainingDay[]
  onChange: (days: TrainingDay[]) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function WeeklyTrainingGrid({ days, onChange, onSave, saving }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  function updateDay(index: number, updated: TrainingDay) {
    onChange(days.map((d, i) => (i === index ? updated : d)))
  }

  function toggleDay(index: number) {
    setExpandedDay(expandedDay === index ? null : index)
  }

  return (
    <div className="flex flex-col gap-3">
      {days.map((day, i) => {
        const isExpanded = expandedDay === i
        const exCount = day.exercises?.length ?? 0

        return (
          <div key={day.day_of_week} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleDay(i)}
              className="w-full flex items-center justify-between px-4 py-4 text-left"
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
                    {day.is_rest_day
                      ? 'Rest Day'
                      : day.workout_name || 'Workout Day'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!day.is_rest_day && exCount > 0 && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {exCount} ex
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp size={16} className="text-muted" />
                ) : (
                  <ChevronDown size={16} className="text-muted" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border">
                <DayWorkoutEditor day={day} onChange={(updated) => updateDay(i, updated)} />
              </div>
            )}
          </div>
        )
      })}

      <Button fullWidth onClick={onSave} disabled={saving} className="mt-2">
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving...
          </span>
        ) : (
          'Save Plan'
        )}
      </Button>
    </div>
  )
}
