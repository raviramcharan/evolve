'use client'

import { TrainingDay, TrainingExercise } from '@/types'
import { ExerciseRow } from './ExerciseRow'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface Props {
  day: TrainingDay
  onChange: (updated: TrainingDay) => void
}

function newExercise(dayId: string, position: number): TrainingExercise {
  return {
    id: crypto.randomUUID(),
    training_day_id: dayId,
    position,
    name: '',
    sets: 3,
    reps: '',
    weight_kg: null,
    rest_seconds: null,
    notes: null,
  }
}

export function DayWorkoutEditor({ day, onChange }: Props) {
  const exercises = day.exercises ?? []

  function updateExercise(index: number, updated: TrainingExercise) {
    const next = exercises.map((ex, i) => (i === index ? updated : ex))
    onChange({ ...day, exercises: next })
  }

  function deleteExercise(index: number) {
    onChange({ ...day, exercises: exercises.filter((_, i) => i !== index) })
  }

  function moveExercise(index: number, dir: -1 | 1) {
    const next = [...exercises]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange({ ...day, exercises: next.map((ex, i) => ({ ...ex, position: i })) })
  }

  function addExercise() {
    onChange({ ...day, exercises: [...exercises, newExercise(day.id, exercises.length)] })
  }

  function toggleRestDay(isRest: boolean) {
    onChange({ ...day, is_rest_day: isRest, exercises: isRest ? [] : exercises })
  }

  return (
    <div className="flex flex-col gap-4 pt-3">
      {/* Rest/Workout toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => toggleRestDay(false)}
          className={`flex-1 py-2 transition-colors ${
            !day.is_rest_day ? 'bg-accent text-black' : 'text-muted hover:text-text'
          }`}
        >
          Workout Day
        </button>
        <button
          type="button"
          onClick={() => toggleRestDay(true)}
          className={`flex-1 py-2 transition-colors ${
            day.is_rest_day ? 'bg-accent text-black' : 'text-muted hover:text-text'
          }`}
        >
          Rest Day
        </button>
      </div>

      {day.is_rest_day ? (
        <p className="text-sm text-muted text-center py-2">Rest & recover — no exercises.</p>
      ) : (
        <>
          <input
            className="bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors text-sm"
            placeholder="e.g. Push Day"
            value={day.workout_name ?? ''}
            onChange={(e) => onChange({ ...day, workout_name: e.target.value || null })}
          />
          <textarea
            className="bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors text-sm resize-none"
            placeholder="Day notes (optional)"
            rows={2}
            value={day.notes ?? ''}
            onChange={(e) => onChange({ ...day, notes: e.target.value || null })}
          />

          <div className="flex flex-col gap-3">
            {exercises.map((ex, i) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                onChange={(updated) => updateExercise(i, updated)}
                onDelete={() => deleteExercise(i)}
                onMoveUp={() => moveExercise(i, -1)}
                onMoveDown={() => moveExercise(i, 1)}
              />
            ))}
          </div>

          <Button variant="ghost" onClick={addExercise} className="flex items-center justify-center gap-2 text-sm">
            <Plus size={16} />
            Add Exercise
          </Button>
        </>
      )}
    </div>
  )
}
