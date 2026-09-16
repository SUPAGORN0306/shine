/**
 * EnergyCard — KPI card สำหรับพลังงาน
 */

import type { ReactNode } from 'react'
import './EnergyCard.css'

interface EnergyCardProps {
  label: string
  value: string
  unit?: string
  icon?: ReactNode
  hint?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

export default function EnergyCard({
  label,
  value,
  unit,
  icon,
  hint,
  variant = 'default',
}: EnergyCardProps) {
  return (
    <article className={`energy-card energy-card--${variant}`}>
      <header className="energy-card__header">
        {icon && <span className="energy-card__icon" aria-hidden="true">{icon}</span>}
        <span className="energy-card__label">{label}</span>
      </header>
      <p className="energy-card__value">
        <span className="energy-card__number">{value}</span>
        {unit && <span className="energy-card__unit">{unit}</span>}
      </p>
      {hint && <p className="energy-card__hint">{hint}</p>}
    </article>
  )
}
