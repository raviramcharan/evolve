'use client'

import { MealFood } from '@/types'
import { FOOD_UNITS } from '@/lib/nutrition'
import { Trash2 } from 'lucide-react'

interface Props {
  food: MealFood
  onChange: (updated: MealFood) => void
  onDelete: () => void
}

const inputCls = 'bg-bg border border-border rounded-xl px-3 py-2 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors text-sm w-full'

export function FoodRow({ food, onChange, onDelete }: Props) {
  function update<K extends keyof MealFood>(field: K, value: MealFood[K]) {
    onChange({ ...food, [field]: value })
  }

  return (
    <div className="bg-bg border border-border rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Food name"
          value={food.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <button type="button" onClick={onDelete} className="shrink-0 p-1.5 text-muted hover:text-danger transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputCls}
          type="number"
          min={0}
          step={0.1}
          inputMode="decimal"
          placeholder="Qty"
          value={food.quantity || ''}
          onChange={(e) => update('quantity', parseFloat(e.target.value) || 0)}
        />
        <select
          className={`${inputCls} appearance-none`}
          value={food.unit}
          onChange={(e) => update('unit', e.target.value as MealFood['unit'])}
        >
          {FOOD_UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted">kcal</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={food.calories || ''}
            onChange={(e) => update('calories', parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-accent">P (g)</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            placeholder="0"
            value={food.protein_g || ''}
            onChange={(e) => update('protein_g', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-blue-400">C (g)</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            placeholder="0"
            value={food.carbs_g || ''}
            onChange={(e) => update('carbs_g', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-warning">F (g)</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            step={0.1}
            inputMode="decimal"
            placeholder="0"
            value={food.fat_g || ''}
            onChange={(e) => update('fat_g', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  )
}
