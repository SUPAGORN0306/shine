/**
 * Card — กล่องเนื้อหาพื้นฐาน
 * ❌ ห้ามซ้อน Card ซ้อน Card มากเกินไป
 */

import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  className?: string
  as?: 'div' | 'section' | 'article'
}

export default function Card({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  className = '',
  as: Tag = 'section',
}: CardProps) {
  return (
    <Tag className={`ui-card ui-card--pad-${padding} ${className}`}>
      {(title || actions) && (
        <header className="ui-card__header">
          <div className="ui-card__title-group">
            {title && <h2 className="ui-card__title">{title}</h2>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </Tag>
  )
}
