/**
 * ControlModal — Confirmation Modal (Human-in-the-loop)
 * แสดง actions, saving, comfort impact, devices + ปุ่ม Confirm
 */

import type { DecisionPlan } from '../../types'
import { formatEnergy, formatCurrency } from '../../utils/formatting'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

interface ControlModalProps {
  open: boolean
  plan: DecisionPlan | null
  willControl: string[]
  needsConfirmation: string[]
  untouched: string[]
  onConfirm: () => void
  onCancel: () => void
}

export default function ControlModal({
  open,
  plan,
  willControl,
  needsConfirmation,
  untouched,
  onConfirm,
  onCancel,
}: ControlModalProps) {
  if (!plan) return null

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="ยืนยันการใช้แผน"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>ยกเลิก</Button>
          <Button variant="primary" onClick={onConfirm}>ยืนยัน</Button>
        </>
      }
    >
      <div className="control-modal">
        <h3 className="control-modal__plan">{plan.name}</h3>
        <p className="control-modal__desc">{plan.description}</p>

        <dl className="control-modal__stats">
          <div>
            <dt>Expected Saving</dt>
            <dd className="control-modal__saving">{formatEnergy(plan.expectedSaving)}</dd>
          </div>
          <div>
            <dt>Expected Cost</dt>
            <dd>{formatCurrency(plan.expectedCost)}</dd>
          </div>
          <div>
            <dt>Comfort Impact</dt>
            <dd>
              <Badge
                variant={plan.comfortImpact.level === 'HIGH' ? 'success' : plan.comfortImpact.level === 'MEDIUM' ? 'warning' : 'danger'}
                size="sm"
              >
                {plan.comfortImpact.level}
              </Badge>
            </dd>
          </div>
        </dl>

        <section className="control-modal__section">
          <h4>Actions</h4>
          <ul>
            {plan.actions
              .filter((a) => a.type !== 'KEEP_ON')
              .map((a) => (
                <li key={a.deviceId}>
                  <strong>{a.deviceId}</strong> — {a.type}
                  {a.reducePercent ? ` (${a.reducePercent}%)` : ''}
                </li>
              ))}
          </ul>
        </section>

        <section className="control-modal__section">
          <h4>อุปกรณ์ที่จะถูกควบคุม</h4>
          {willControl.length > 0 ? (
            <ul>{willControl.map((n) => <li key={n}>{n}</li>)}</ul>
          ) : (
            <p className="control-modal__muted">— ไม่มี —</p>
          )}
        </section>

        <section className="control-modal__section">
          <h4>อุปกรณ์ที่ต้องขออนุญาต</h4>
          {needsConfirmation.length > 0 ? (
            <ul>{needsConfirmation.map((n) => <li key={n}>{n}</li>)}</ul>
          ) : (
            <p className="control-modal__muted">— ไม่มี —</p>
          )}
        </section>

        <section className="control-modal__section">
          <h4>ไม่ถูกแตะต้อง</h4>
          {untouched.length > 0 ? (
            <ul>{untouched.map((n) => <li key={n}>{n}</li>)}</ul>
          ) : (
            <p className="control-modal__muted">— ไม่มี —</p>
          )}
        </section>
      </div>
    </Modal>
  )
}
