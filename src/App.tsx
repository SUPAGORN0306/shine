/**
 * App — HashRouter + Routes ครบ 9 หน้า
 * ใช้ HashRouter เพื่อรองรับ GitHub Pages (ไม่เกิด 404)
 */

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/Layout/Layout'

import Dashboard from './pages/Dashboard/Dashboard'
import EnergyUsage from './pages/EnergyUsage/EnergyUsage'
import Devices from './pages/Devices/Devices'
import Forecast from './pages/Forecast/Forecast'
import WhatIf from './pages/WhatIf/WhatIf'
import Decisions from './pages/Decisions/Decisions'
import Automation from './pages/Automation/Automation'
import Feedback from './pages/Feedback/Feedback'
import Settings from './pages/Settings/Settings'

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/energy" element={<EnergyUsage />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </SettingsProvider>
  )
}
