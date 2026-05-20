'use client'

import { TrainingExercise } from '@/types'
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react'

interface Props {
  exercise: TrainingExercise
  onChange: (updated: TrainingExercise) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const inputCls = 'bg-bg border border-border rounded-xl px-3 py-2 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors text-sm w-full'

export function ExerciseRow({ exercise, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  function update<K extends keyof TrainingExercise>(field: K, value: TrainingExercise[K]) {
    onChange({ ...exercise, [field]: value })
  }

  return (
    <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="e.g. Bench Press"
          value={exercise.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={onMoveUp} className="p-1.5 text-muted hover:text-text transition-colors">
            <ArrowUp size={14} />
          </button>
          <button type="button" onClick={onMoveDown} className="p-1.5 text-muted hover:text-text transition-colors">
            <ArrowDown size={14} />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 text-muted hover:text-danger transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Sets</label>
          <input
            className={inputCls}
            type="number"
            min={1}
            inputMode="numeric"
            value={exercise.sets}
            onChange={(e) => update('sets', parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Reps</label>
          <input
            className={inputCls}
            placeholder="e.g. 8-10 or AMRAP"
            value={exercise.reps}
            onChange={(e) => update('reps', e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Weight</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => update('weight_kg', exercise.weight_kg === null ? 0 : null)}
            className={`shrink-0 text-xs px-3 py-2 rounded-xl border transition-colors ${
              exercise.weight_kg === null
                ? 'bg-accent/10 border-accent text-accent'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            Bodyweight
          </button>
          {exercise.weight_kg !== null && (
            <input
              className={`${inputCls} flex-1`}
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              placeholder="kg"
              value={exercise.weight_kg ?? ''}
              onChange={(e) => update('weight_kg', parseFloat(e.target.value) || 0)}
            />
          )}
          {exercise.weight_kg === null && (
            <span className="text-xs text-muted">No weight needed</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Rest (seconds)</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="e.g. 90"
            value={exercise.rest_seconds ?? ''}
            onChange={(e) => update('rest_seconds', e.target.value ? parseInt(e.target.value, 10) : null)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Notes</label>
          <input
            className={inputCls}
            placeholder="Optional"
            value={exercise.notes ?? ''}
            onChange={(e) => update('notes', e.target.value || null)}
          />
        </div>
      </div>
    </div>
  )
}
