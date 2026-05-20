'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { buildMeasurementChartData, MEASUREMENT_COLORS } from '@/lib/measurements'
import type { BodyMeasurement } from '@/types'

const CHART_SITES = [
  { key: 'waist',       label: 'Waist' },
  { key: 'chest',       label: 'Chest' },
  { key: 'hips',        label: 'Hips' },
  { key: 'shoulders',   label: 'Shoulders' },
  { key: 'neck',        label: 'Neck' },
  { key: 'left_arm',    label: 'L. Arm' },
  { key: 'right_arm',   label: 'R. Arm' },
  { key: 'left_thigh',  label: 'L. Thigh' },
  { key: 'right_thigh', label: 'R. Thigh' },
]

export function MeasurementChart({ measurements }: { measurements: BodyMeasurement[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const data = buildMeasurementChartData(measurements)

  function toggleSite(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHART_SITES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleSite(key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-opacity ${
              hidden.has(key) ? 'opacity-30 border-border' : 'border-transparent'
            }`}
            style={{ backgroundColor: `${MEASUREMENT_COLORS[key]}20`, color: MEASUREMENT_COLORS[key] }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: MEASUREMENT_COLORS[key] }}
            />
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis
            dataKey="week"
            tickFormatter={(w) => `W${w}`}
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            axisLine={{ stroke: '#2A2A2A' }}
          />
          <YAxis
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            axisLine={{ stroke: '#2A2A2A' }}
            unit="cm"
            width={48}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }}
            labelFormatter={(w) => `Week ${w}`}
            formatter={(value: number, name: string) => [`${value} cm`, name]}
          />
          {CHART_SITES.map(({ key, label }) =>
            hidden.has(key) ? null : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={MEASUREMENT_COLORS[key]}
                strokeWidth={2}
                dot={{ r: 3, fill: MEASUREMENT_COLORS[key] }}
                connectNulls={false}
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
