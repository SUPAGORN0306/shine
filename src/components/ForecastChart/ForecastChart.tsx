/**
 * ForecastChart — กราฟ Actual vs Predicted
 */

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '../../utils/formatting'

export interface ForecastPoint {
  label: string
  actual?: number
  predicted?: number
}

interface ForecastChartProps {
  data: ForecastPoint[]
}

export default function ForecastChart({ data }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} width={50} />
        <Tooltip
          formatter={(v: number) => `${formatNumber(v, 0)} W`}
          contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Power"
          stroke="var(--color-info)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicted Power"
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
