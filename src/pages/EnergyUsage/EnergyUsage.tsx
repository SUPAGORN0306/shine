/**
 * Energy Usage — Daily / Weekly / Monthly
 * KPI เปลี่ยนตาม period, ค่าไฟดึงจาก Settings อัตโนมัติ
 */

import { useState } from 'react'
import { Activity, TrendingUp, Zap, Wallet } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import {
  getKpis,
  getChartData,
  getDeviceBreakdown,
  type PeriodOption,
} from '../../services/energyService'
import EnergyCard from '../../components/EnergyCard/EnergyCard'
import EnergyChart from '../../components/EnergyChart/EnergyChart'
import Card from '../../components/ui/Card'
import ChartContainer from '../../components/ui/ChartContainer'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatEnergy, formatPower, formatCurrency, formatNumber, formatPercent } from '../../utils/formatting'
import './EnergyUsage.css'

const PERIODS: { value: PeriodOption; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const COLORS = ['#A78BFA', '#8B5CF6', '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#9CA3AF']

export default function EnergyUsage() {
  const { settings } = useSettings()
  const [period, setPeriod] = useState<PeriodOption>('daily')

  const kpis = getKpis(period)
  const chartData = getChartData(period)
  const breakdown = getDeviceBreakdown()

  return (
    <div className="energy-usage">
      {/* Period selector */}
      <div className="energy-usage__periods" role="tablist" aria-label="ช่วงเวลา">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={period === p.value}
            className={`energy-usage__period ${period === p.value ? 'energy-usage__period--active' : ''}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI */}
      <section className="energy-usage__grid">
        <EnergyCard
          label="Total Energy"
          value={formatEnergy(kpis.totalEnergyKwh)}
          icon={<Activity size={18} />}
          variant="primary"
        />
        <EnergyCard
          label="Average Energy"
          value={formatEnergy(kpis.averageEnergyKwh)}
          icon={<TrendingUp size={18} />}
        />
        <EnergyCard
          label="Peak Power"
          value={formatPower(kpis.peakPowerW)}
          icon={<Zap size={18} />}
        />
        <EnergyCard
          label="Estimated Cost"
          value={formatCurrency(kpis.estimatedCost)}
          icon={<Wallet size={18} />}
          variant="warning"
          hint={`${formatCurrency(settings.electricityRate)}/kWh`}
        />
      </section>

      {/* Chart 1: Consumption over time */}
      <Card className="energy-usage__chart-card">
        <ChartContainer
          title="Energy Consumption Over Time"
          description={`แนวโน้มการใช้พลังงาน (${PERIODS.find((p) => p.value === period)?.label})`}
          height={280}
          summary={`ช่วง ${period}: ใช้พลังงานรวม ${kpis.totalEnergyKwh} kWh`}
        >
          <EnergyChart data={chartData} mode="line" />
        </ChartContainer>
      </Card>

      {/* Chart 2: Peak usage */}
      <Card className="energy-usage__chart-card">
        <ChartContainer
          title="Peak Usage"
          description="กำลังไฟสูงสุดในแต่ละช่วงย่อย"
          height={260}
          summary={`Peak ${kpis.peakPowerW} W`}
        >
          <EnergyChart data={chartData} mode="peak" />
        </ChartContainer>
      </Card>

      {/* Chart 3: Device breakdown */}
      <Card className="energy-usage__chart-card">
        <ChartContainer
          title="Device Energy Breakdown"
          description="สัดส่วนการใช้พลังงานต่ออุปกรณ์"
          height={300}
          summary={breakdown
            .map((d) => `${d.deviceName}: ${d.energyKwh} kWh (${d.percentage}%)`)
            .join(', ')}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="energyKwh"
                nameKey="deviceName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _n, p) =>
                  `${formatNumber(v, 2)} kWh (${formatPercent((p.payload as { percentage: number }).percentage)})`
                }
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>
    </div>
  )
}
