/**
 * Decisions — Human-in-the-loop Decision Engine
 * ❌ ระบบไม่เลือกแผนเอง — ผู้ใช้ต้องกด Choose Plan + Confirm
 */

import { useMemo, useState } from 'react'
import { Info, Target, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react'
import type { Constraints, DecisionPlan, Priority } from '../../types'
import { useSettings } from '../../contexts/SettingsContext'
import {
  generatePlans,
  buildDefaultDecisionInput,
  selectPlan,
  getSelected,
  getAffectedDevices,
} from '../../services/decisionService'
import { calculateBaseline } from '../../services/preferenceService'
import DecisionCard from '../../components/DecisionCard/DecisionCard'
import ControlModal from '../../components/ControlModal/ControlModal'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Status from '../../components/ui/Status'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency, formatDateTime } from '../../utils/formatting'
import './Decisions.css'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'COMFORT', label: 'Comfort' },
  { value: 'BALANCED', label: 'Balanced' },
  { value: 'ENERGY_SAVING', label: 'Energy Saving' },
]

export default function Decisions() {
  const { settings } = useSettings()

  // ---------- State ----------
  const [goal, setGoal] = useState(settings.monthlyGoal)
  const [priority, setPriority] = useState<Priority>('BALANCED')
  const [constraints, setConstraints] = useState<Constraints>(
    () => buildDefaultDecisionInput().constraints
  )
  const [plansResult, setPlansResult] = useState(() =>
    generatePlans({
      ...buildDefaultDecisionInput(),
      monthlyGoal: settings.monthlyGoal,
      priority: 'BALANCED',
    })
  )
  const [selected, setSelected] = useState(() => getSelected())
  const [pendingPlan, setPendingPlan] = useState<DecisionPlan | null>(null)
  const [showModal, setShowModal] = useState(false)

  // ---------- Regenerate ----------
  const regenerate = () => {
    const baseline = calculateBaseline()
    const result = generatePlans({
      monthlyGoal: goal,
      priority,
      constraints,
      baseline,
    })
    setPlansResult(result)
  }

  // ---------- Modal Data ----------
  const affected = useMemo(
    () => (pendingPlan ? getAffectedDevices(pendingPlan) : { willControl: [], needsConfirmation: [], untouched: [] }),
    [pendingPlan]
  )

  const handleChoose = (plan: DecisionPlan) => {
    setPendingPlan(plan)
    setShowModal(true)
  }

  const handleConfirm = () => {
    if (!pendingPlan) return
    const s = selectPlan(pendingPlan)
    setSelected(s)
    setPendingPlan(null)
    setShowModal(false)
  }

  return (
    <div className="decisions">
      {/* ---------- User Input ---------- */}
      <Card
        title="Your Goal & Priority"
        subtitle="ระบบจะ generate แผนตามข้อมูลนี้"
        actions={<Badge variant="primary" size="sm">Rule-based Simulation</Badge>}
      >
        <div className="decisions__form">
          <div className="decisions__field">
            <label htmlFor="goal-input">Monthly Saving Goal (฿)</label>
            <input
              id="goal-input"
              type="number"
              min={0}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value) || 0)}
            />
          </div>

          <fieldset className="decisions__field">
            <legend>Priority</legend>
            <div className="decisions__radios" role="radiogroup">
              {PRIORITIES.map((p) => (
                <label key={p.value} className={`decisions__radio ${priority === p.value ? 'decisions__radio--active' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={() => setPriority(p.value)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="decisions__field">
            <label htmlFor="max-usage">Max Daily Usage (kWh)</label>
            <input
              id="max-usage"
              type="number"
              min={1}
              step={0.5}
              value={constraints.maxDailyUsageKwh}
              onChange={(e) =>
                setConstraints({ ...constraints, maxDailyUsageKwh: Number(e.target.value) || 0 })
              }
            />
          </div>

          <div className="decisions__field">
            <label htmlFor="max-cost">Max Daily Cost (฿)</label>
            <input
              id="max-cost"
              type="number"
              min={0}
              value={constraints.maxDailyCost}
              onChange={(e) =>
                setConstraints({ ...constraints, maxDailyCost: Number(e.target.value) || 0 })
              }
            />
          </div>

          <div className="decisions__field">
            <label htmlFor="min-comfort">Min Comfort Level</label>
            <input
              id="min-comfort"
              type="number"
              min={0}
              max={100}
              value={constraints.minComfortLevel}
              onChange={(e) =>
                setConstraints({ ...constraints, minComfortLevel: Number(e.target.value) || 0 })
              }
            />
          </div>

          <div className="decisions__form-actions">
            <Button variant="primary" iconLeft={<RefreshCw size={16} />} onClick={regenerate}>
              Generate Plans
            </Button>
          </div>
        </div>

        <aside className="decisions__info" role="note">
          <Info size={16} aria-hidden="true" />
          <span>
            ระบบจะสร้างแผนหลายทางเลือก — <strong>คุณเป็นผู้เลือก</strong> ไม่มี auto-select
          </span>
        </aside>
      </Card>

      {/* ---------- Selected Plan ---------- */}
      {selected && (
        <Card className="decisions__selected">
          <div className="decisions__selected-head">
            <CheckCircle2 size={20} className="decisions__selected-icon" aria-hidden="true" />
            <div>
              <h3 className="decisions__selected-title">Plan Selected</h3>
              <p className="decisions__selected-sub">
                {selected.planSnapshot.name} — {formatDateTime(selected.selectedAt)}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
            เปลี่ยนแผน
          </Button>
        </Card>
      )}

      {/* ---------- Plans ---------- */}
      <section>
        <header className="decisions__plans-head">
          <h2 className="decisions__plans-title">Available Plans</h2>
          <span className="decisions__plans-count">
            {plansResult.plans.length} แผนที่ผ่าน constraints
          </span>
        </header>

        <p className="decisions__instruction">
          System generated several valid energy plans. Please choose the plan you want to apply.
        </p>

        {plansResult.plans.length > 0 ? (
          <div className="decisions__plans-grid">
            {plansResult.plans.map((plan) => (
              <DecisionCard
                key={plan.id}
                plan={plan}
                onChoose={handleChoose}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Target size={32} />}
            title="ไม่มีแผนที่ผ่าน constraints"
            description="ลองผ่อนคลาย constraints (เพิ่ม max usage/cost หรือลด min comfort)"
          />
        )}
      </section>

      {/* ---------- Rejected ---------- */}
      {plansResult.rejected.length > 0 && (
        <Card title="Rejected Plans" subtitle="แผนที่ไม่ผ่าน hard constraints">
          <ul className="decisions__rejected">
            {plansResult.rejected.map((p) => (
              <li key={p.id}>
                <span className="decisions__rejected-name">{p.name}</span>
                <span className="decisions__rejected-reason">{p.rejectReason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ---------- Confirmation Modal ---------- */}
      <ControlModal
        open={showModal}
        plan={pendingPlan}
        willControl={affected.willControl}
        needsConfirmation={affected.needsConfirmation}
        untouched={affected.untouched}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowModal(false)
          setPendingPlan(null)
        }}
      />

      {/* Footer */}
      <div className="decisions__footer">
        <Badge variant="primary" size="sm">Prototype Simulation</Badge>
        <span className="decisions__footer-note">
          Decision Engine ใช้ rule-based simulation — ไม่ใช่ ML model ที่ train จริง
        </span>
      </div>
    </div>
  )
}
