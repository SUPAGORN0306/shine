/**
 * Header — แสดง page title, status, prototype badge, notification, profile
 */

import { Bell, Menu, User } from 'lucide-react'
import Badge from '../ui/Badge'
import './Header.css'

interface HeaderProps {
  title: string
  onOpenMenu?: () => void
}

export default function Header({ title, onOpenMenu }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <button
          type="button"
          className="header__menu"
          aria-label="เปิดเมนู"
          onClick={onOpenMenu}
        >
          <Menu size={22} />
        </button>
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__right">
        <span className="header__status" role="status">
          <span className="header__status-dot" aria-hidden="true" />
          <span className="header__status-text">System Online</span>
        </span>

        <Badge variant="primary" size="sm">Prototype Simulation</Badge>

        <button
          type="button"
          className="header__icon-btn"
          aria-label="การแจ้งเตือน"
        >
          <Bell size={20} />
        </button>

        <div className="header__profile" role="group" aria-label="บัญชีผู้ใช้">
          <span className="header__avatar" aria-hidden="true">
            <User size={18} />
          </span>
          <span className="header__profile-name">Guest</span>
        </div>
      </div>
    </header>
  )
}
