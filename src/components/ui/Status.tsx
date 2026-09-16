/**
 * Status — แสดงสถานะพร้อม icon + text (ไม่พึ่งสีอย่างเดียว)
 */

import './Status.css'

export type StatusType =
  | 'on'
  | 'off'
  | 'completed'
  | 'waiting'
  | 'blocked'
  | 'idle'

interface StatusProps {
  type: StatusType
  label?: string
  size?: 'sm' | 'md'
}

const STATUS_META: Record<StatusType, { symbol: string; defaultLabel: string; css: string }> = {
  on:        { symbol: '●', defaultLabel: 'ON',        css: 'success' },
  off:       { symbol: '●', defaultLabel: 'OFF',       css: 'neutral' },
  completed: { symbol: '✓', defaultLabel: 'Completed', css: 'success' },
  waiting:   { symbol: '!', defaultLabel: 'Waiting',   css: 'warning' },
  blocked:   { symbol: '×', defaultLabel: 'Blocked',   css: 'danger'  },
  idle:      { symbol: '○', defaultLabel: 'Idle',      css: 'neutral' },
}

export default function Status({ type, label, size = 'md' }: StatusProps) {
  const meta = STATUS_META[type]
  const text = label ?? meta.defaultLabel

  return (
    <span
      className={`ui-status ui-status--${meta.css} ui-status--${size}`}
      role="status"
    >
      <span className="ui-status__symbol" aria-hidden="true">{meta.symbol}</span>
      <span className="ui-status__label">{text}</span>
    </span>
  )
}