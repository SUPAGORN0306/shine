/**
 * Button — ปุ่มมาตรฐาน รองรับ keyboard + aria
 * ใช้ <button> จริงเสมอ
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${
        fullWidth ? 'ui-btn--full' : ''
      } ${className}`}
      {...rest}
    >
      {iconLeft && <span className="ui-btn__icon" aria-hidden="true">{iconLeft}</span>}
      <span className="ui-btn__label">{children}</span>
      {iconRight && <span className="ui-btn__icon" aria-hidden="true">{iconRight}</span>}
    </button>
  )
}
