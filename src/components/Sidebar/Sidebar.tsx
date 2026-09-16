/**
 * Sidebar — เมนูหลัก
 * - Desktop: แสดงเต็ม
 * - Tablet: collapse ได้
 * - Mobile: drawer
 */

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Zap,
  Cpu,
  TrendingUp,
  FlaskConical,
  ListChecks,
  Bot,
  MessageSquare,
  Settings as SettingsIcon,
  X,
} from 'lucide-react'
import './Sidebar.css'

export interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { path: '/energy',    label: 'Energy Usage',  icon: <Zap size={18} /> },
  { path: '/devices',   label: 'Devices',       icon: <Cpu size={18} /> },
  { path: '/forecast',  label: 'Forecast',      icon: <TrendingUp size={18} /> },
  { path: '/what-if',   label: 'What-if',       icon: <FlaskConical size={18} /> },
  { path: '/decisions', label: 'Decisions',     icon: <ListChecks size={18} /> },
  { path: '/automation',label: 'Automation',    icon: <Bot size={18} /> },
  { path: '/feedback',  label: 'Feedback',      icon: <MessageSquare size={18} /> },
  { path: '/settings',  label: 'Settings',      icon: <SettingsIcon size={18} /> },
]

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Backdrop สำหรับ mobile */}
      {mobileOpen && (
        <div
          className="sidebar__backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
        aria-label="เมนูหลัก"
      >
        <div className="sidebar__brand">
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-title">Smart Energy</span>
            <span className="sidebar__brand-sub">Decision &amp; Control</span>
          </div>
          <button
            type="button"
            className="sidebar__close"
            aria-label="ปิดเมนู"
            onClick={onCloseMobile}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="การนำทางหลัก">
          <ul className="sidebar__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={onCloseMobile}
                >
                  <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__badge">Prototype Simulation</span>
        </div>
      </aside>
    </>
  )
}
