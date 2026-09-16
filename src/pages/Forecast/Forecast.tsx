/**
 * Forecast — คาดการณ์พลังงาน (Actual vs Predicted)
 * ⚠️ Prediction Engine — Prototype Simulation
 */

import { useMemo, useState } from 'react'
import { Info, Zap, Activity, Wallet } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { predictEnergy, PREDICTION_DISCLAIMER } from '../../services/predictionService'
import { getChartData } from '../../services/energyService'
import { MOCK_READINGS } from '../../data/mockData'
import type { ForecastHorizon } from '../../types'
import ForecastChart, { type ForecastPoint } from '../../components/ForecastChart/ForecastChart'
import EnergyCard from '../../components/EnergyCard/EnergyCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ChartContainer from '../../components/ui/ChartContainer'
import { formatEnergy, formatCurrency, formatPower } from '../../utils/formatting'
import './Forecast.css'

const HORIZONS: { value: ForecastHorizon; label: string }[] = [
  { value: '1h', label: 'Next 1 Hour' },
  { value: '3h', label: 'Next 3 Hours' },
  { value: '6h', label: 'Next 6 Hours' },
]

export default function Forecast() {
  const { settings } = useSettings()
  const [horizon, setHorizon] = useState<ForecastHorizon>('6h')

  const prediction = useMemo(
    () => predictEnergy(MOCK_READINGS, horizon, settings.electricityRate),
    [horizon, settings.electricityRate]
  )

  // รวม Actual (24 ชม. ย้อนหลัง) + Predicted (horizon ข้างหน้า)
  const chartData: ForecastPoint[] = useMemo(() => {
    const past = getChartData('daily').map((p) => ({
      label: p.label,
      actual: p.powerW,
    }))

    const future = prediction.points.map((p) => {
      const d = new Date(p.timestamp)
      return {
        label: d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        predicted: p.predictedPowerW,
      }
    })

    // จุดเชื่อม: ให้จุดสุดท้ายของ actual มี predicted ด้วย เพื่อเส้นต่อเนื่อง
    if (past.length > 0 && future.length > 0) {
      past[past.length - 1] = {
        ...past[past.length - 1],
        predicted: past[past.length - 1].actual,
      }
    }

    return [...past, ...future]
  }, [prediction])

  return (
    <div className="forecast">
      {/* Info box */}
      <aside className="forecast__info" role="note">
        <Info size={18} aria-hidden="true" />
        <div>
          <strong>{PREDICTION_DISCLAIMER.title}</strong>
          <Badge variant="primary" size="sm">{PREDICTION_DISCLAIMER.badge}</Badge>
          <p>{PREDICTION_DISCLAIMER.futureNote}</p>
        </div>
      </aside>

      {/* Horizon selector */}
      <div className="forecast__horizons" role="tablist" aria-label="ช่วงคาดการณ์">
        {HORIZONS.map((h) => (
          <button
            key={h.value}
            type="button"
            role="tab"
            aria-selected={horizon === h.value}
            className={`forecast__horizon ${horizon === h.value ? 'forecast__horizon--active' : ''}`}
            onClick={() => setHorizon(h.value)}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <section className="forecast__grid">
        <EnergyCard
          label={`Predicted Power (avg)`}
          value={formatPower(prediction.summary.averagePowerW)}
          icon={<Zap size={18} />}
          variant="primary"
        />
        <EnergyCard
          label={`Predicted Energy (${horizon})`}
          value={formatEnergy(prediction.summary.predictedEnergyKwh)}
          icon={<Activity size={18} />}
          variant="success"
        />
        <EnergyCard
          label={`Estimated Cost (${horizon})`}
          value={formatCurrency(prediction.summary.predictedCost)}
          icon={<Wallet size={18} />}
          variant="warning"
          hint={`${formatCurrency(settings.electricityRate)}/kWh`}
        />
      </section>

      {/* Chart */}
      <Card>
        <ChartContainer
          title="Actual vs Predicted Power"
          description="ย้อนหลัง 24 ชั่วโมง + คาดการณ์ข้างหน้า"
          height={320}
          summary={`คาดการณ์พลังงาน ${prediction.summary.predictedEnergyKwh} kWh คิดเป็น ${formatCurrency(prediction.summary.predictedCost)}`}
        >
          <ForecastChart data={chartData} />
        </ChartContainer>
      </Card>

      {/* Points list */}
      <Card title="Prediction Points">
        <ul className="forecast__points">
          {prediction.points.map((p) => (
            <li key={p.timestamp} className="forecast__point">
              <span className="forecast__point-time">
                {new Date(p.timestamp).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="forecast__point-power">{formatPower(p.predictedPowerW)}</span>
              <span className="forecast__point-energy">{formatEnergy(p.predictedEnergyKwh)}</span>
              <span className="forecast__point-cost">{formatCurrency(p.predictedCost)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
