import type { BodyMeasurement } from '@/types'
import { MeasurementChart } from './MeasurementChart'
import { MeasurementTable } from './MeasurementTable'

interface Props {
  measurements: BodyMeasurement[]
}

export function ClientMeasurementsTab({ measurements }: Props) {
  if (measurements.length === 0) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        No measurements logged yet. They&apos;ll appear here after the client&apos;s first check-in.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-text mb-4">Progress Over Time</h3>
        <MeasurementChart measurements={measurements} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-text mb-4">Weekly Breakdown</h3>
        <div className="overflow-x-auto">
          <MeasurementTable measurements={measurements} />
        </div>
      </div>
    </div>
  )
}
