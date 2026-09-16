/**
 * What-if Simulation — ทดลองเปลี่ยนพฤติกรรม
 * คำนวณใหม่ทันทีเมื่อ toggle เปลี่ยน
 */

import { useMemo, useState } from 'react'
import { ArrowRight, Save, TrendingDown } from 'lucide-react'
import type { ScenarioAction, ScenarioActionType } from '../../types'
import { MOCK_DEVICES } from '../../data/mockData'
import { simulateScenario, getPresetScenarios, getDefaultActions } from '../../services/whatIfService'
import { useSettings } from '../../contexts/SettingsContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EnergyCard from '../../components/EnergyCard/EnergyCard'
import ScenarioCard from '../../components/ScenarioCard/ScenarioCard'
import { formatEnergy, formatCurrency, formatNumber } from '../../utils/formatting'
import './WhatIf.css'

/** Actions ที่รองรับต่ออุปกรณ์ */
const ACTIONS_BY_DEVICE: Record<string, { value: ScenarioActionType; label: string }[]> = {
  ac: [
    { value: 'KEEP_ON', label: 'Keep ON' },
    { value: 'TURN_OFF', label: 'Turn OFF' },
    { value: 'REDUCE_USAGE', label: 'Reduce usage (−50%)' },
  ],
  tv: [
    { value: 'KEEP_ON', label: 'Keep ON' },
    { value: 'TURN_OFF', label: 'Turn OFF' },
  ],
  lights: [
    { value: 'KEEP_ON', label: 'Keep ON' },
    { value: 'TURN_OFF', label: 'Turn OFF' },
  ],
  fan: [
    { value: 'KEEP_ON', label: 'Keep ON' },
    { value: 'TURN_OFF', label: 'Turn OFF' },
  ],
  washing_machine: [
    { value: 'KEEP_ON', label: 'Keep' },
    { value: 'DELAY', label: 'Delay' },
  ],
}

export default function WhatIf() {
  const { settings } = useSettings()
  const [actions, setActions] = useState<ScenarioAction[]>(() => getDefaultActions())

  const result = useMemo(() => simulateScenario(actions), [actions])
  const scenarios = useMemo(
    () => getPresetScenarios(settings.electricityRate),
    [settings.electricityRate]
  )

  const updateAction = (deviceId: string, type: ScenarioActionType) => {
    setActions((prev) => {
      const filtered = prev.filter((a) => a.deviceId !== deviceId)
      const next: ScenarioAction = { deviceId, type }
      if (type === 'REDUCE_USAGE') next.reducePercent = 50
      return [...filtered, next]
    })
  }

  const getAction = (deviceId: string): ScenarioActionType => {
    return actions.find((a) => a.deviceId === deviceId)?.type ?? 'KEEP_ON'
  }

  const applyScenario = (scenarioId: string) => {
    const sc = scenarios.find((s) => s.id === scenarioId)
    if (sc) setActions(sc.actions)
  }

  return (
    <div className="whatif">
      {/* Preset Scenarios */}
      <section>
        <header className="whatif__head">
          <h2 className="whatif__title">Preset Scenarios</h2>
          <p className="whatif__hint">เลือก scenario สำเร็จรูป หรือปรับ actions ด้านล่าง</p>
        </header>
        <div className="whatif__scenarios">
          {scenarios.map((sc) => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              onApply={() => applyScenario(sc.id)}
            />
          ))}
        </div>
      </section>

      {/* Compare panel */}
      <section className="whatif__compare">
        <Card title="Current Behavior" padding="md">
          <p className="whatif__value">{formatEnergy(result.currentEnergyKwh)}</p>
          <p className="whatif__sub">
            {formatCurrency(result.currentEnergyKwh * settings.electricityRate)}
          </p>
        </Card>

        <div className="whatif__arrow" aria-hidden="true">
          <ArrowRight size={24} />
        </div>

        <Card title="Scenario" padding="md" className="whatif__scenario-card">
          <p className="whatif__value">{formatEnergy(result.scenarioEnergyKwh)}</p>
          <p className="whatif__sub">
            {formatCurrency(result.scenarioEnergyKwh * settings.electricityRate)}
          </p>
        </Card>
      </section>

      {/* Results */}
      <section className="whatif__grid">
        <EnergyCard
          label="Energy Saving"
          value={formatEnergy(result.energySavingKwh)}
          icon={<TrendingDown size={18} />}
          variant="success"
        />
        <EnergyCard
          label="Cost Saving"
          value={formatCurrency(result.costSaving)}
          icon={<Save size={18} />}
          variant="success"
        />
        <EnergyCard
          label="Comfort Impact"
          value={`${formatNumber(result.comfortImpact.score, 0)}/100`}
          hint={result.comfortImpact.level}
          variant={
            result.comfortImpact.level === 'HIGH'
              ? 'success'
              : result.comfortImpact.level === 'MEDIUM'
              ? 'warning'
              : 'default'
          }
        />
      </section>

      {/* Actions */}
      <Card title="Actions" subtitle="ปรับแล้วคำนวณใหม่ทันที">
        <ul className="whatif__actions">
          {MOCK_DEVICES.filter((d) => ACTIONS_BY_DEVICE[d.id]).map((device) => {
            const action = getAction(device.id)
            const options = ACTIONS_BY_DEVICE[device.id]
            return (
              <li key={device.id} className="whatif__action-row">
                <span className="whatif__action-name">{device.name}</span>
                <div className="whatif__action-buttons" role="radiogroup" aria-label={`การตั้งค่า ${device.name}`}>
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={action === opt.value}
                      className={`whatif__action-btn ${action === opt.value ? 'whatif__action-btn--active' : ''}`}
                      onClick={() => updateAction(device.id, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Breakdown */}
      <Card title="Breakdown by Device">
        <ul className="whatif__breakdown">
          {result.breakdownByDevice.map((b) => (
            <li key={b.deviceId} className="whatif__breakdown-item">
              <span className="whatif__breakdown-name">{b.deviceName}</span>
              <span className="whatif__breakdown-detail">
                {formatNumber(b.beforePowerW, 0)} W → {formatNumber(b.afterPowerW, 0)} W
              </span>
              <span className="whatif__breakdown-saving">
                {b.savingKwh > 0 ? `−${formatNumber(b.savingKwh, 2)} kWh` : '—'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="whatif__footer">
        <Badge variant="primary" size="sm">Prototype Simulation</Badge>
        <span className="whatif__footer-note">
          ผลลัพธ์เป็นการจำลอง ไม่ใช่การควบคุมจริง
        </span>
      </div>
    </div>
  )
}
