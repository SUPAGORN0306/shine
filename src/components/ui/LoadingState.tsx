/**
 * LoadingState — แสดงตอนกำลังโหลด
 */

import './LoadingState.css'

interface LoadingStateProps {
  label?: string
  size?: 'sm' | 'md'
}

export default function LoadingState({
  label = 'กำลังโหลด…',
  size = 'md',
}: LoadingStateProps) {
  return (
    <div className={`ui-loading ui-loading--${size}`} role="status" aria-live="polite">
      <span className="ui-loading__spinner" aria-hidden="true" />
      <span className="ui-loading__label">{label}</span>
    </div>
  )
}
