/**
 * ChartContainer — wrapper สำหรับ Recharts
 * - ทำให้ responsive
 * - ให้ accessible summary (สำหรับ screen reader)
 */

import type { ReactNode } from 'react'
import './ChartContainer.css'

interface ChartContainerProps {
  title: string
  description?: string
  height?: number
  children: ReactNode
  summary?: string   // ข้อความสรุปสำหรับ screen reader
}

export default function ChartContainer({
  title,
  description,
  height = 280,
  children,
  summary,
}: ChartContainerProps) {
  return (
    <figure className="ui-chart" role="group" aria-label={title}>
      <figcaption className="ui-chart__caption">
        <h3 className="ui-chart__title">{title}</h3>
        {description && <p className="ui-chart__desc">{description}</p>}
      </figcaption>
      <div className="ui-chart__area" style={{ height }}>
        {children}
      </div>
      {summary && (
        <p className="ui-chart__summary" aria-live="polite">
          {summary}
        </p>
      )}
    </figure>
  )
}
