/**
 * Badge — ป้ายสถานะ/หมวด
 * ใช้คู่กับ Status component เมื่อต้องสื่อสารสถานะ
 */

import type { ReactNode } from 'react'
import './Badge.css'

type Variant =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: Variant
  icon?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'neutral',
  icon,
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}
    >
      {icon && <span className="ui-badge__icon" aria-hidden="true">{icon}</span>}
      <span className="ui-badge__label">{children}</span>
    </span>
  )
}
