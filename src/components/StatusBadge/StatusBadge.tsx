/**
 * StatusBadge — แสดงสถานะอุปกรณ์ (มี icon + text ไม่พึ่งสี)
 */

import { Circle, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import type { DeviceStatus } from '../../types'
import './StatusBadge.css'

interface StatusBadgeProps {
  status: DeviceStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isOn = status === 'ON'
  const Icon = isOn ? CheckCircle2 : Circle
  const label = isOn ? 'ON' : 'OFF'

  return (
    <span
      className={`status-badge status-badge--${isOn ? 'on' : 'off'} status-badge--${size}`}
      role="status"
    >
      <Icon size={size === 'sm' ? 12 : 14} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

/** ไอคอนสำหรับ control status (ใช้ใน Automation) */
export function ControlStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'EXECUTED':
      return <CheckCircle2 size={16} className="status-icon status-icon--success" aria-hidden="true" />
    case 'PENDING_CONFIRMATION':
      return <AlertCircle size={16} className="status-icon status-icon--warning" aria-hidden="true" />
    case 'BLOCKED':
      return <XCircle size={16} className="status-icon status-icon--danger" aria-hidden="true" />
    default:
      return <Circle size={16} className="status-icon status-icon--neutral" aria-hidden="true" />
  }
}
