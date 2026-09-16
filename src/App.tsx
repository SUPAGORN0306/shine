import { HashRouter } from 'react-router-dom'

/**
 * App root — ใช้ HashRouter เพื่อรองรับ GitHub Pages (ไม่เกิด 404)
 * routes จริงจะถูกเติมใน Batch ถัดไป
 */
export default function App() {
  return (
    <HashRouter>
      <div style={{ padding: 24 }}>
        <h1>Shine</h1>
        <p>Smart Energy Decision &amp; Control System</p>
        <p><strong>Prototype Simulation</strong></p>
      </div>
    </HashRouter>
  )
}
