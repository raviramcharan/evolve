'use client'

import type { BodyMeasurement, MeasurementKey } from '@/types'
import { getMeasurementDelta, getDeltaDirection, formatDelta } from '@/lib/measurements'

interface Props {
  measurements: BodyMeasurement[]
  totalWeeks?: number
}

const COLUMNS: { key: MeasurementKey; label: string }[] = [
  { key: 'waist_cm',        label: 'Waist' },
  { key: 'chest_cm',        label: 'Chest' },
  { key: 'hips_cm',         label: 'Hips' },
  { key: 'shoulders_cm',    label: 'Shoulders' },
  { key: 'neck_cm',         label: 'Neck' },
  { key: 'left_arm_cm',     label: 'L. Arm' },
  { key: 'right_arm_cm',    label: 'R. Arm' },
  { key: 'left_thigh_cm',   label: 'L. Thigh' },
  { key: 'right_thigh_cm',  label: 'R. Thigh' },
]

export function MeasurementTable({ measurements, totalWeeks = 12 }: Props) {
  const byWeek = new Map(measurements.map((m) => [m.week_number, m]))
  const rows = Array.from({ length: totalWeeks }, (_, i) => i + 1)

  return (
    <table className="text-sm min-w-full border-separate border-spacing-0">
      <thead>
        <tr>
          <th className="sticky left-0 z-10 bg-surface text-left text-xs text-muted font-medium px-3 py-2 border-b border-r border-border">
            Week
          </th>
          {COLUMNS.map(({ key, label }) => (
            <th key={key} className="text-right text-xs text-muted font-medium px-3 py-2 border-b border-border whitespace-nowrap">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((week) => {
          const current = byWeek.get(week)
          const previous = byWeek.get(week - 1)
          const hasData = !!current

          return (
            <tr key={week} className={hasData ? '' : 'opacity-30'}>
              <td className="sticky left-0 z-10 bg-bg text-text font-medium px-3 py-2 border-b border-r border-border whitespace-nowrap">
                W{week}
              </td>
              {COLUMNS.map(({ key }) => {
                const val = current?.[key] ?? null
                const prevVal = previous?.[key] ?? null
                const delta = getMeasurementDelta(val, prevVal)
                const direction = getDeltaDirection(key, delta)

                return (
                  <td key={key} className="text-right px-3 py-2 border-b border-border whitespace-nowrap">
                    {val !== null ? (
                      <span className="text-text">{val}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                    {delta !== null && direction !== 'neutral' && (
                      <span
                        className={`ml-1 text-xs ${
                          direction === 'positive' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatDelta(delta)}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
