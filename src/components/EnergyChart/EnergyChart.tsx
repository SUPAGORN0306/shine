/**
 * EnergyChart — กราฟพลังงาน (consumption + peak) พร้อม ResponsiveContainer
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EnergyChartPoint } from '../../services/energyService'
import { formatNumber } from '../../utils/formatting'

interface EnergyChartProps {
  data: EnergyChartPoint[]
  mode?: 'line' | 'peak'
}

export default function EnergyChart({ data, mode = 'line' }: EnergyChartProps) {
  if (mode === 'peak') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} width={50} />
          <Tooltip
            formatter={(v: number) => [`${formatNumber(v, 0)} W`, 'Power']}
            contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)' }}
          />
          <Bar dataKey="powerW" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} width={50} />
        <Tooltip
          formatter={(v: number) => [`${formatNumber(v, 0)} W`, 'Power']}
          contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)' }}
        />
        <Line
          type="monotone"
          dataKey="powerW"
          stroke="var(--color-primary-dark)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
