/**
 * DeviceDetailModal — แสดงรายละเอียดอุปกรณ์ + เปลี่ยน permission
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Device, Permission } from '../../types'
import { formatEnergy, formatNumber, formatPower } from '../../utils/formatting'
import { MOCK_USAGE_PATTERNS } from '../../data/mockData'
import { getWeeklyEnergyKwh } from '../../services/energyService'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import StatusBadge from '../StatusBadge/StatusBadge'
import './DeviceDetailModal.css'

interface DeviceDetailModalProps {
  open: boolean
  device: Device | null
  permission: Permission
  onChangePermission: (p: Permission) => void
  onClose: () => void
}

const PERM_DESCRIPTIONS: Record<Permission, string> = {
  AUTO: 'ระบบสามารถดำเนินการตามแผนได้',
  ASK: 'ระบบต้องถามผู้ใช้ก่อน',
  NEVER: 'ระบบห้ามควบคุมอุปกรณ์นี้',
}

export default function DeviceDetailModal({
  open,
  device,
  permission,
  onChangePermission,
  onClose,
}: DeviceDetailModalProps) {
  if (!device) return null

  const pattern = MOCK_USAGE_PATTERNS[device.id]
  const weeklyEnergy = getWeeklyEnergyKwh(device.id)

  const chartData = pattern
    ? pattern.hourly.map((w, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        power: w,
      }))
    : []

  return (
    <Modal open={open} onClose={onClose} title={device.name} size="lg">
      <div className="device-detail">
        <div className="device-detail__row">
          <StatusBadge status={device.status} />
          <Badge variant={device.controllable ? 'success' : 'neutral'} size="sm">
            {device.controllable ? 'Controllable' : 'Not Controllable'}
          </Badge>
          <Badge variant="neutral" size="sm">Simulated</Badge>
        </div>

        <dl className="device-detail__stats">
          <div>
            <dt>Current Power</dt>
            <dd>{formatPower(device.estimatedPowerW)}</dd>
          </div>
          <div>
            <dt>Today's Energy</dt>
            <dd>{formatEnergy(device.todayEnergyKwh)}</dd>
          </div>
          <div>
            <dt>Weekly Energy</dt>
            <dd>{formatEnergy(weeklyEnergy)}</dd>
          </div>
          <div>
            <dt>Average Usage</dt>
            <dd>{formatNumber(pattern?.averageHoursPerDay ?? 0, 1)} h/day</dd>
          </div>
          <div>
            <dt>Peak Window</dt>
            <dd>{pattern?.peakWindow ?? '—'}</dd>
          </div>
          <div>
            <dt>Control Method</dt>
            <dd>Simulated</dd>
          </div>
        </dl>

        <section className="device-detail__section">
          <h4>Usage Pattern</h4>
          {chartData.length > 0 ? (
            <div className="device-detail__chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} width={45} />
                  <Tooltip formatter={(v: number) => `${formatNumber(v, 0)} W`} />
                  <Bar dataKey="power" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="device-detail__muted">ไม่มีข้อมูล usage pattern</p>
          )}
        </section>

        <section className="device-detail__section">
          <h4>Permission</h4>
          <div className="device-detail__perms" role="radiogroup" aria-label="Permission">
            {(['AUTO', 'ASK', 'NEVER'] as Permission[]).map((p) => (
              <label
                key={p}
                className={`device-detail__perm ${permission === p ? 'device-detail__perm--active' : ''}`}
              >
                <input
                  type="radio"
                  name="permission"
                  value={p}
                  checked={permission === p}
                  onChange={() => onChangePermission(p)}
                />
                <span className="device-detail__perm-label">{p}</span>
                <span className="device-detail__perm-desc">{PERM_DESCRIPTIONS[p]}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="device-detail__footer">
          <Button variant="secondary" onClick={onClose}>ปิด</Button>
        </div>
      </div>
    </Modal>
  )
}
