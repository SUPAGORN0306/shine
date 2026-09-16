/**
 * Settings — แก้ rate, goal, baseline, automation mode
 * เปลี่ยน rate → ทุกหน้า cost อัปเดตทันที (ผ่าน SettingsContext)
 */

import { useState } from 'react'
import { RotateCcw, Zap, Target, Gauge, Bot, Info } from 'lucide-react'
import type { AutomationMode, BaselineMode } from '../../types'
import { useSettings } from '../../contexts/SettingsContext'
import { CONTROL_DISCLAIMER } from '../../services/controlService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatCurrency, formatNumber } from '../../utils/formatting'
import './Settings.css'

const BASELINE_OPTIONS: { value: BaselineMode; label: string; description: string }[] = [
  { value: 'CURRENT_BEHAVIOR', label: 'Current Behavior', description: 'พฤติกรรมปัจจุบันที่ยังไม่มีการปรับ' },
  { value: 'BALANCED',          label: 'Balanced',          description: 'สมดุลระหว่างความสบายและการประหยัด' },
  { value: 'ENERGY_SAVING',     label: 'Energy Saving',     description: 'เน้นการประหยัดพลังงาน' },
  { value: 'MAXIMUM_SAVING',    label: 'Maximum Saving',    description: 'ประหยัดสูงสุด' },
]

const AUTOMATION_OPTIONS: { value: AutomationMode; label: string; description: string }[] = [
  { value: 'RECOMMEND', label: 'Recommend', description: 'ระบบแนะนำเท่านั้น' },
  { value: 'ASSISTED',  label: 'Assisted',  description: 'ระบบเสนอแผน ผู้ใช้ยืนยัน' },
  { value: 'AUTO',      label: 'Auto',      description: 'ระบบดำเนินการตามแผนที่เลือก' },
]

export default function Settings() {
  const { settings, setRate, setGoal, setBaselineMode, setAutomationMode, reset } = useSettings()
  const [rateInput, setRateInput] = useState(settings.electricityRate)
  const [goalInput, setGoalInput] = useState(settings.monthlyGoal)
  const [showReset, setShowReset] = useState(false)
  const [errors, setErrors] = useState<{ rate?: string; goal?: string }>({})

  const validate = () => {
    const errs: { rate?: string; goal?: string } = {}
    if (rateInput <= 0 || rateInput > 100) errs.rate = 'ต้องอยู่ระหว่าง 0.01 – 100'
    if (goalInput < 0) errs.goal = 'ต้องไม่ติดลบ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    setRate(rateInput)
    setGoal(goalInput)
  }

  const handleReset = () => {
    reset()
    setRateInput(4.20)
    setGoalInput(500)
    setShowReset(false)
  }

  return (
    <div className="settings">
      {/* ---------- Electricity Rate ---------- */}
      <Card
        title="Electricity Rate"
        subtitle="ใช้คำนวณค่าไฟทุกหน้าในระบบ"
        actions={<Badge variant="primary" size="sm">อัปเดตทันที</Badge>}
      >
        <div className="settings__field">
          <label htmlFor="rate">อัตราค่าไฟ (บาท/kWh)</label>
          <div className="settings__input-row">
            <input
              id="rate"
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              value={rateInput}
              onChange={(e) => setRateInput(Number(e.target.value) || 0)}
              aria-invalid={Boolean(errors.rate)}
              aria-describedby={errors.rate ? 'rate-error' : undefined}
            />
            <span className="settings__unit">฿/kWh</span>
          </div>
          {errors.rate && <p id="rate-error" className="settings__error" role="alert">{errors.rate}</p>}
          <p className="settings__hint">
            ปัจจุบัน: <strong>{formatCurrency(settings.electricityRate)}/kWh</strong>
          </p>
        </div>
      </Card>

      {/* ---------- Monthly Goal ---------- */}
      <Card title="Monthly Saving Goal">
        <div className="settings__field">
          <label htmlFor="goal">เป้าหมายการประหยัดต่อเดือน (บาท)</label>
          <div className="settings__input-row">
            <input
              id="goal"
              type="number"
              min={0}
              step={50}
              value={goalInput}
              onChange={(e) => setGoalInput(Number(e.target.value) || 0)}
              aria-invalid={Boolean(errors.goal)}
              aria-describedby={errors.goal ? 'goal-error' : undefined}
            />
            <span className="settings__unit">฿</span>
          </div>
          {errors.goal && <p id="goal-error" className="settings__error" role="alert">{errors.goal}</p>}
          <p className="settings__hint">
            ปัจจุบัน: <strong>{formatCurrency(settings.monthlyGoal, 0)}</strong>
          </p>
        </div>

        <div className="settings__actions">
          <Button variant="primary" onClick={handleSave}>บันทึก</Button>
        </div>
      </Card>

      {/* ---------- Baseline Mode ---------- */}
      <Card
        title="Baseline Mode"
        subtitle="ใช้เปรียบเทียบกับทุก Scenario"
        actions={<Badge variant="info" size="sm">ใช้ร่วมกันทั้งระบบ</Badge>}
      >
        <fieldset className="settings__fieldset">
          <legend className="sr-only">เลือก Baseline Mode</legend>
          <div className="settings__options" role="radiogroup">
            {BASELINE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`settings__option ${settings.baselineMode === opt.value ? 'settings__option--active' : ''}`}
              >
                <input
                  type="radio"
                  name="baseline"
                  value={opt.value}
                  checked={settings.baselineMode === opt.value}
                  onChange={() => setBaselineMode(opt.value)}
                />
                <Gauge size={18} aria-hidden="true" />
                <div>
                  <span className="settings__option-label">{opt.label}</span>
                  <span className="settings__option-desc">{opt.description}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {/* ---------- Automation Mode ---------- */}
      <Card
        title="Automation Mode"
        subtitle="ระดับการมีส่วนร่วมของระบบ"
      >
        <fieldset className="settings__fieldset">
          <legend className="sr-only">เลือก Automation Mode</legend>
          <div className="settings__options" role="radiogroup">
            {AUTOMATION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`settings__option ${settings.automationMode === opt.value ? 'settings__option--active' : ''}`}
              >
                <input
                  type="radio"
                  name="automation"
                  value={opt.value}
                  checked={settings.automationMode === opt.value}
                  onChange={() => setAutomationMode(opt.value)}
                />
                <Bot size={18} aria-hidden="true" />
                <div>
                  <span className="settings__option-label">{opt.label}</span>
                  <span className="settings__option-desc">{opt.description}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {/* ---------- System Status ---------- */}
      <Card title="System Status" subtitle="สถานะของส่วนประกอบในระบบ">
        <ul className="settings__status">
          <li>
            <span className="settings__status-icon" aria-hidden="true"><Zap size={18} /></span>
            <div>
              <strong>Energy Monitor Status</strong>
              <p>ใช้ข้อมูลจำลอง — พร้อมเชื่อมอุปกรณ์จริงในอนาคต</p>
            </div>
            <Badge variant="primary" size="sm">Prototype Simulation</Badge>
          </li>
          <li>
            <span className="settings__status-icon" aria-hidden="true"><Target size={18} /></span>
            <div>
              <strong>Control Layer</strong>
              <p>{CONTROL_DISCLAIMER.futureNote}</p>
            </div>
            <Badge variant="primary" size="sm">Prototype Simulation</Badge>
          </li>
        </ul>
      </Card>

      {/* ---------- Reset ---------- */}
      <Card title="Reset to Defaults" subtitle="คืนค่าทั้งหมดเป็นค่าเริ่มต้น">
        <p className="settings__hint">
          ค่าเริ่มต้น: Rate {formatCurrency(4.20)}/kWh · Goal {formatCurrency(500, 0)} · Baseline Current Behavior · Automation Assisted
        </p>
        <div className="settings__actions">
          <Button
            variant="danger"
            iconLeft={<RotateCcw size={16} />}
            onClick={() => setShowReset(true)}
          >
            Reset to Defaults
          </Button>
        </div>
      </Card>

      {/* ---------- Reset Modal ---------- */}
      <Modal
        open={showReset}
        onClose={() => setShowReset(false)}
        title="ยืนยันการรีเซ็ต"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReset(false)}>ยกเลิก</Button>
            <Button variant="danger" onClick={handleReset}>ยืนยันรีเซ็ต</Button>
          </>
        }
      >
        <p>การรีเซ็ตจะล้าง settings และ preferences ทั้งหมด การกระทำนี้ย้อนกลับไม่ได้</p>
      </Modal>

      {/* ---------- Footer ---------- */}
      <div className="settings__footer">
        <Info size={14} aria-hidden="true" />
        <span>
          ทุกค่าถูกบันทึกใน localStorage อัตโนมัติ (prefix <code>shine.</code>) — refresh แล้วไม่หาย
        </span>
      </div>
    </div>
  )
}
