'use client'

import { MEASUREMENT_SITES, type MeasurementKey } from '@/types'
import { getMeasurementDelta, getDeltaDirection, formatDelta } from '@/lib/measurements'
import { MeasurementGuide } from './MeasurementGuide'

interface Props {
  values: Partial<Record<MeasurementKey, number | null>>
  previousValues: Partial<Record<MeasurementKey, number | null>>
  onChange: (key: MeasurementKey, value: number | null) => void
}

const GROUPS = ['Core', 'Upper Body', 'Lower Body'] as const

export function MeasurementSection({ values, previousValues, onChange }: Props) {
  return (
    <div className="space-y-6">
      <MeasurementGuide />

      {GROUPS.map((group) => {
        const sites = MEASUREMENT_SITES.filter((s) => s.group === group)
        return (
          <div key={group}>
            <p className="text-xs text-muted uppercase tracking-wider mb-3">{group}</p>
            <div className="space-y-3">
              {sites.map(({ key, label }) => {
                const delta = getMeasurementDelta(values[key] ?? null, previousValues[key] ?? null)
                const direction = getDeltaDirection(key, delta)
                const deltaText = formatDelta(delta)

                return (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-sm text-text w-28 shrink-0">{label}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={values[key] ?? ''}
                      placeholder={previousValues[key]?.toString() ?? 'cm'}
                      onChange={(e) =>
                        onChange(key, e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="bg-surface border border-border rounded-xl px-3 py-2 text-text text-sm w-24 placeholder-muted focus:outline-none focus:border-accent transition-colors"
                    />
                    <span className="text-xs text-muted">cm</span>
                    {direction !== 'neutral' && deltaText && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          direction === 'positive'
                            ? 'text-success bg-success/10'
                            : 'text-danger bg-danger/10'
                        }`}
                      >
                        {deltaText}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
