import type { BodyMeasurement, MeasurementKey } from '@/types'
import { DECREASING_IS_GOOD } from '@/types'

export function getMeasurementDelta(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null) return null
  return parseFloat((current - previous).toFixed(1))
}

export function getDeltaDirection(
  key: MeasurementKey,
  delta: number | null
): 'positive' | 'negative' | 'neutral' {
  if (delta === null || delta === 0) return 'neutral'
  const decreasingIsGood = (DECREASING_IS_GOOD as readonly string[]).includes(key)
  if (decreasingIsGood) return delta < 0 ? 'positive' : 'negative'
  return delta > 0 ? 'positive' : 'negative'
}

export function formatDelta(delta: number | null): string {
  if (delta === null) return ''
  return delta > 0 ? `+${delta}` : `${delta}`
}

export function buildMeasurementChartData(
  measurements: BodyMeasurement[],
  totalWeeks = 12
) {
  const byWeek = new Map(measurements.map((m) => [m.week_number, m]))
  return Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1
    const m = byWeek.get(week)
    return {
      week,
      waist:       m?.waist_cm       ?? null,
      chest:       m?.chest_cm       ?? null,
      hips:        m?.hips_cm        ?? null,
      left_arm:    m?.left_arm_cm    ?? null,
      right_arm:   m?.right_arm_cm   ?? null,
      left_thigh:  m?.left_thigh_cm  ?? null,
      right_thigh: m?.right_thigh_cm ?? null,
      neck:        m?.neck_cm        ?? null,
      shoulders:   m?.shoulders_cm   ?? null,
    }
  })
}

export const MEASUREMENT_COLORS: Record<string, string> = {
  waist:        '#C8FF00',
  chest:        '#60A5FA',
  hips:         '#F472B6',
  left_arm:     '#A78BFA',
  right_arm:    '#C084FC',
  left_thigh:   '#34D399',
  right_thigh:  '#6EE7B7',
  neck:         '#FB923C',
  shoulders:    '#FBBF24',
}
