'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { CheckIn, Program } from '@/types'
import { projectedWeights } from '@/lib/calculations'
import { formatWeight } from '@/lib/formatters'

interface WeightChartProps {
  checkIns: CheckIn[]
  program: Program
}

interface ChartDataPoint {
  week: number
  actual?: number
  projected: number
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 text-sm shadow-lg">
      <p className="text-muted font-medium mb-1">Week {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
          {entry.name === 'actual' ? 'Actual' : 'Projected'}: {formatWeight(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function WeightChart({ checkIns, program }: WeightChartProps) {
  const projected = projectedWeights(program.start_weight, program.goal_weight)

  const data: ChartDataPoint[] = projected.map(({ week, projected: projectedVal }) => {
    const checkIn = checkIns.find((c) => c.week_number === week)
    return {
      week,
      projected: projectedVal,
      ...(checkIn ? { actual: checkIn.current_weight } : {}),
    }
  })

  const allWeights = [
    ...data.map((d) => d.projected),
    ...checkIns.map((c) => c.current_weight),
    program.start_weight,
  ]
  const minWeight = Math.floor(Math.min(...allWeights)) - 1
  const maxWeight = Math.ceil(Math.max(...allWeights)) + 1

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6B6B6B', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `W${v}`}
          />
          <YAxis
            domain={[minWeight, maxWeight]}
            tick={{ fill: '#6B6B6B', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
            formatter={(value) => (
              <span style={{ color: '#6B6B6B' }}>{value === 'actual' ? 'Actual' : 'Projected'}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#6B6B6B"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#C8FF00"
            strokeWidth={2}
            dot={{ fill: '#C8FF00', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#C8FF00' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
