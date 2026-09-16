/**
 * EmptyState — แสดงเมื่อไม่มีข้อมูล
 */

import type { ReactNode } from 'react'
import './EmptyState.css'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="ui-empty" role="status">
      {icon && <div className="ui-empty__icon" aria-hidden="true">{icon}</div>}
      <h3 className="ui-empty__title">{title}</h3>
      {description && <p className="ui-empty__desc">{description}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  )
}
