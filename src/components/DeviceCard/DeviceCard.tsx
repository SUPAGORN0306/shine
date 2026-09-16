/**
 * DeviceCard — การ์ดอุปกรณ์ คลิกเปิด detail modal
 */

import { Power, Lock, Unlock } from 'lucide-react'
import type { Device, Permission } from '../../types'
import StatusBadge from '../StatusBadge/StatusBadge'
import Badge from '../ui/Badge'
import { formatPower, formatEnergy } from '../../utils/formatting'
import './DeviceCard.css'

interface DeviceCardProps {
  device: Device
  permission: Permission
  onClick?: () => void
}

const PERMISSION_META: Record<Permission, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  AUTO:  { variant: 'success', label: 'AUTO' },
  ASK:   { variant: 'warning', label: 'ASK' },
  NEVER: { variant: 'danger',  label: 'NEVER' },
}

export default function DeviceCard({ device, permission, onClick }: DeviceCardProps) {
  const perm = PERMISSION_META[permission]
  const interactive = Boolean(onClick)

  const content = (
    <>
      <header className="device-card__header">
        <div>
          <h3 className="device-card__name">{device.name}</h3>
          <StatusBadge status={device.status} size="sm" />
        </div>
        {device.controllable ? (
          <Unlock size={18} className="device-card__lock" aria-label="ควบคุมได้" />
        ) : (
          <Lock size={18} className="device-card__lock device-card__lock--locked" aria-label="ควบคุมไม่ได้" />
        )}
      </header>

      <dl className="device-card__stats">
        <div>
          <dt>Current Power</dt>
          <dd>{formatPower(device.estimatedPowerW)}</dd>
        </div>
        <div>
          <dt>Today's Energy</dt>
          <dd>{formatEnergy(device.todayEnergyKwh)}</dd>
        </div>
      </dl>

      <footer className="device-card__footer">
        <div className="device-card__perm">
          <Power size={14} aria-hidden="true" />
          <Badge variant={perm.variant} size="sm">{perm.label}</Badge>
        </div>
        <span className="device-card__ctrl">
          {device.controllable ? 'Controllable' : 'Not Controllable'}
        </span>
      </footer>
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        className="device-card device-card--interactive"
        onClick={onClick}
        aria-label={`เปิดรายละเอียด ${device.name}`}
      >
        {content}
      </button>
    )
  }

  return <article className="device-card">{content}</article>
}
