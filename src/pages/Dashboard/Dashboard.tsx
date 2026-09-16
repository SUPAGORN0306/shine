/**
 * Dashboard — หน้าหลัก แสดง KPI + Latest Decision + Preference Insight
 * ⚠️ ถ้ายังไม่มีข้อมูล (ไม่เคยเลือกแผน) → แสดง Empty state
 */

import { Link } from 'react-router-dom'
import {
  Zap,
  Activity,
  TrendingUp,
  Wallet,
  ListChecks,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import {
  getCurrentPowerW,
  getTodayEnergyKwh,
  getCurrentReading,
  getKpis,
} from '../../services/energyService'
import { getSelected } from '../../services/decisionService'
import { getLatestFeedback } from '../../services/feedbackService'
import { getPreferenceInsights } from '../../services/preferenceService'
import EnergyCard from '../../components/EnergyCard/EnergyCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Status from '../../components/ui/Status'
import {
  formatPower,
  formatEnergy,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../../utils/formatting'
import './Dashboard.css'

export default function Dashboard() {
  const { settings } = useSettings()

  const currentPower = getCurrentPowerW()
  const todayEnergy = getTodayEnergyKwh()
  const reading = getCurrentReading()
  const dailyKpis = getKpis('daily')

  const selected = getSelected()
  const latestFeedback = getLatestFeedback()
  const insights = getPreferenceInsights()

  return (
    <div className="dashboard">
      {/* ---------- KPI Row ---------- */}
      <section className="dashboard__section" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">ภาพรวมพลังงานวันนี้</h2>
        <div className="dashboard__grid">
          <EnergyCard
            label="Current Power"
            value={formatPower(currentPower)}
            icon={<Zap size={18} />}
            variant="primary"
            hint={`แรงดัน ${reading.voltage}V · กระแส ${formatNumber(reading.current, 2)}A`}
          />
          <EnergyCard
            label="Today's Energy"
            value={formatEnergy(todayEnergy)}
            icon={<Activity size={18} />}
            variant="success"
          />
          <EnergyCard
            label="Peak Power"
            value={formatPower(dailyKpis.peakPowerW)}
            icon={<TrendingUp size={18} />}
          />
          <EnergyCard
            label="Estimated Cost"
            value={formatCurrency(todayEnergy * settings.electricityRate)}
            icon={<Wallet size={18} />}
            variant="warning"
            hint={`อัตรา ${formatCurrency(settings.electricityRate)}/kWh`}
          />
        </div>
      </section>

      {/* ---------- Latest Decision ---------- */}
      <section className="dashboard__section">
        <Card
          title="Latest Decision"
          subtitle="แผนล่าสุดที่คุณเลือก"
          actions={
            <Link to="/decisions" className="dashboard__link">
              ไปที่ Decisions <ArrowRight size={14} />
            </Link>
          }
        >
          {selected ? (
            <div className="dashboard__decision">
              <div className="dashboard__decision-head">
                <span className="dashboard__decision-name">
                  {selected.planSnapshot.name}
                </span>
                <Status type="completed" label="Selected" />
              </div>
              <p className="dashboard__decision-desc">
                {selected.planSnapshot.description}
              </p>
              <dl className="dashboard__decision-stats">
                <div>
                  <dt>Selected at</dt>
                  <dd>{formatDateTime(selected.selectedAt)}</dd>
                </div>
                <div>
                  <dt>Expected Saving</dt>
                  <dd className="dashboard__saving">
                    {formatEnergy(selected.planSnapshot.expectedSaving)}
                  </dd>
                </div>
                <div>
                  <dt>Expected Cost</dt>
                  <dd>{formatCurrency(selected.planSnapshot.expectedCost)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <EmptyState
              icon={<ListChecks size={32} />}
              title="ยังไม่มีแผนที่เลือก"
              description="ไปที่หน้า Decisions เพื่อสร้างและเลือกแผน"
              action={
                <Link to="/decisions">
                  <Button variant="primary" size="sm">ไปที่ Decisions</Button>
                </Link>
              }
            />
          )}
        </Card>
      </section>

      {/* ---------- Expected vs Actual ---------- */}
      <section className="dashboard__section">
        <Card
          title="Expected vs Actual Saving"
          subtitle="เปรียบเทียบผลลัพธ์ที่คาดหวังกับผลจริง"
        >
          {selected && latestFeedback ? (
            <dl className="dashboard__compare">
              <div>
                <dt>Expected Saving</dt>
                <dd>{formatEnergy(latestFeedback.expectedSaving)}</dd>
              </div>
              <div>
                <dt>Actual Saving</dt>
                <dd>{formatEnergy(latestFeedback.actualSaving)}</dd>
              </div>
              <div>
                <dt>Difference</dt>
                <dd
                  className={
                    latestFeedback.actualSaving >= latestFeedback.expectedSaving
                      ? 'dashboard__positive'
                      : 'dashboard__negative'
                  }
                >
                  {formatEnergy(
                    latestFeedback.actualSaving - latestFeedback.expectedSaving
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <EmptyState
              icon={<MessageSquare size={32} />}
              title="ยังไม่มี Feedback"
              description="หลัง execute แผนแล้ว ให้ feedback เพื่อให้ระบบเรียนรู้"
              action={
                <Link to="/feedback">
                  <Button variant="secondary" size="sm">ไปที่ Feedback</Button>
                </Link>
              }
            />
          )}
        </Card>
      </section>

      {/* ---------- Preference Insight ---------- */}
      <section className="dashboard__section">
        <Card
          title="Preference Insight"
          subtitle="User Preference Learning — Prototype"
          actions={<Badge variant="primary" size="sm">Rule-based</Badge>}
        >
          {insights.length > 0 ? (
            <ul className="dashboard__insights">
              {insights.map((ins) => (
                <li key={ins.deviceId} className="dashboard__insight">
                  <span className="dashboard__insight-name">{ins.deviceName}</span>
                  <div className="dashboard__insight-bar">
                    <div
                      className={`dashboard__insight-fill dashboard__insight-fill--${ins.direction}`}
                      style={{ width: `${ins.score}%` }}
                    />
                  </div>
                  <span className="dashboard__insight-score">{ins.score}</span>
                  {ins.direction === 'up' && (
                    <Badge variant="success" size="sm">+ ยอมรับ</Badge>
                  )}
                  {ins.direction === 'down' && (
                    <Badge variant="danger" size="sm">− ปฏิเสธ</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Sparkles size={32} />}
              title="ยังไม่มีข้อมูล Preference"
              description="ให้ feedback กับแผนเพื่อให้ระบบเรียนรู้ความชอบของคุณ"
            />
          )}
        </Card>
      </section>
    </div>
  )
}
