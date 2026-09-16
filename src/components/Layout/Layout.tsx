/**
 * Layout — ใช้ร่วมกันทุกหน้า
 * Desktop: Sidebar + Main
 * Mobile: Drawer + Main + Bottom nav
 */

import { useState, useEffect, type ReactNode } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  ListChecks,
  MessageSquare,
} from 'lucide-react'
import Sidebar, { NAV_ITEMS } from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import './Layout.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/energy': 'Energy Usage',
  '/devices': 'Devices',
  '/forecast': 'Forecast',
  '/what-if': 'What-if Simulation',
  '/decisions': 'Decisions',
  '/automation': 'Automation',
  '/feedback': 'Feedback',
  '/settings': 'Settings',
}

/** เมนูหลักที่แสดงบน bottom nav (mobile) */
const BOTTOM_ITEMS = [
  { path: '/dashboard', label: 'Home',     icon: <LayoutDashboard size={20} /> },
  { path: '/devices',   label: 'Devices',  icon: <Cpu size={20} /> },
  { path: '/decisions', label: 'Decide',   icon: <ListChecks size={20} /> },
  { path: '/feedback',  label: 'Feedback', icon: <MessageSquare size={20} /> },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // ปิด drawer เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const title = PAGE_TITLES[location.pathname] ?? 'Shine'

  return (
    <div className="layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="layout__main">
        <Header title={title} onOpenMenu={() => setMobileOpen(true)} />

        <main className="layout__content" id="main-content">
          {children}
        </main>

        {/* Bottom navigation (mobile) */}
        <nav className="layout__bottom-nav" aria-label="เมนูล่าง">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
              }
            >
              <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
              <span className="bottom-nav__label">{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="bottom-nav__link"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนูทั้งหมด"
          >
            <span className="bottom-nav__icon" aria-hidden="true">⋯</span>
            <span className="bottom-nav__label">More</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

/** Export NAV_ITEMS เพื่อใช้ในที่อื่นถ้าต้องการ */
export { NAV_ITEMS }
