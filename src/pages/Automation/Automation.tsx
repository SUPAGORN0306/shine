/**
 * Automation — Device Permission Matrix + Control Simulation
 * - แสดงตาราง permission ต่ออุปกรณ์ (เปลี่ยนได้)
 * - Execution Log จากการ execute plan
 * - NEVER device ถูก block ที่ service layer
 */

import { useState } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldX,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Circle,
} from 'lucide-react'
import type { Permission } from '../../types'
import { MOCK_DEVICES } from '../../data/mockData'
import {
  getAllPermissions,
  updatePermission,
  executeDecision,
  getHistory,
  confirmPending,
  CONTROL_DISCLAIMER,
} from '../../services/controlService'
import { getSelected } from '../../services/decisionService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Status from '../../components/ui/Status'
import EmptyState from '../../components/ui/EmptyState'
import { formatDateTime } from '../../utils/formatting'
import './Automation.css'

const PERMISSION_META: Record<Permission, { label: string; icon: React.ReactNode; description: string }> = {
  AUTO:  { label: 'AUTO',  icon: <Shield size={14} />,      description: 'ระบบสามารถดำเนินการตามแผนได้' },
  ASK:   { label: 'ASK',   icon: <ShieldAlert size={14} />, description: 'ระบบต้องถามผู้ใช้ก่อน' },
  NEVER: { label: 'NEVER', icon: <ShieldX size={14} />,     description: 'ระบบห้ามควบคุมอุปกรณ์นี้' },
}

const PERMISSIONS: Permission[] = ['AUTO', 'ASK', 'NEVER']

export default function Automation() {
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    () => getAllPermissions()
  )
  const [history, setHistory] = useState(() => getHistory())
  const [selected] = useState(() => getSelected())
  const [lastRun, setLastRun] = useState<{ executed: number; pending: number; blocked: number } | null>(null)

  const handlePermissionChange = (deviceId: string, p: Permission) => {
    updatePermission(deviceId, p)
    setPermissions((prev) => ({ ...prev, [deviceId]: p }))
  }

  const handleExecute = () => {
    if (!selected) return
    const result = executeDecision(selected)
    setHistory(getHistory())
    setLastRun({
      executed: result.executedCount,
      pending: result.pendingCount,
      blocked: result.blockedCount,
    })
  }

  const handleConfirm = (entryId: string) => {
    confirmPending(entryId)
    setHistory(getHistory())
  }

  return (
    <div className="automation">
      {/* ---------- Permission Matrix ---------- */}
      <Card
        title="Device Permission Matrix"
        subtitle="กำหนดสิทธิ์การควบคุมของแต่ละอุปกรณ์"
        actions={<Badge variant="primary" size="sm">{CONTROL_DISCLAIMER.badge}</Badge>}
      >
        {/* Desktop: table */}
        <div className="automation__table-wrap">
          <table className="automation__table">
            <thead>
              <tr>
                <th scope="col">Device</th>
                <th scope="col">Permission</th>
                <th scope="col">Control Method</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEVICES.map((d) => {
                const p = permissions[d.id] ?? d.permission
                return (
                  <tr key={d.id}>
                    <td data-label="Device">
                      <span className="automation__device-name">{d.name}</span>
                    </td>
                    <td data-label="Permission">
                      <div className="automation__perm-group" role="radiogroup" aria-label={`Permission ของ ${d.name}`}>
                        {PERMISSIONS.map((perm) => {
                          const meta = PERMISSION_META[perm]
                          return (
                            <button
                              key={perm}
                              type="button"
                              role="radio"
                              aria-checked={p === perm}
                              aria-label={meta.description}
                              className={`automation__perm-btn automation__perm-btn--${perm.toLowerCase()} ${p === perm ? 'automation__perm-btn--active' : ''}`}
                              onClick={() => handlePermissionChange(d.id, perm)}
                              title={meta.description}
                            >
                              {meta.icon}
                              <span>{meta.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td data-label="Control Method">
                      <Badge variant="neutral" size="sm">Simulated</Badge>
                    </td>
                    <td data-label="Status">
                      <Status
                        type={d.status === 'ON' ? 'on' : 'off'}
                        size="sm"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="automation__note">
          <strong>Future:</strong> {CONTROL_DISCLAIMER.futureNote.replace('Future: ', '')}
        </p>
      </Card>

      {/* ---------- Execute Panel ---------- */}
      <Card
        title="Control Simulation"
        subtitle="จำลองการ execute แผนที่เลือกไว้"
        actions={<Badge variant="primary" size="sm">Prototype Simulation</Badge>}
      >
        {selected ? (
          <div className="automation__execute">
            <div className="automation__execute-info">
              <p className="automation__execute-plan">
                แผน: <strong>{selected.planSnapshot.name}</strong>
              </p>
              <p className="automation__execute-time">
                เลือกเมื่อ {formatDateTime(selected.selectedAt)}
              </p>
            </div>

            <Button
              variant="primary"
              iconLeft={<Play size={16} />}
              onClick={handleExecute}
            >
              Execute Plan
            </Button>

            {lastRun && (
              <dl className="automation__last-run">
                <div>
                  <dt>Executed</dt>
                  <dd><Status type="completed" label={`${lastRun.executed}`} /></dd>
                </div>
                <div>
                  <dt>Pending</dt>
                  <dd><Status type="waiting" label={`${lastRun.pending}`} /></dd>
                </div>
                <div>
                  <dt>Blocked</dt>
                  <dd><Status type="blocked" label={`${lastRun.blocked}`} /></dd>
                </div>
              </dl>
            )}
          </div>
        ) : (
          <EmptyState
            title="ยังไม่มีแผนที่เลือก"
            description="ไปที่หน้า Decisions เพื่อเลือกแผนก่อน execute"
          />
        )}
      </Card>

      {/* ---------- Execution Log ---------- */}
      <Card title="Execution Log" subtitle="ประวัติการ execute">
        {history.length > 0 ? (
          <ul className="automation__log">
            {history
              .slice()
              .reverse()
              .map((entry) => {
                const Icon =
                  entry.status === 'EXECUTED'
                    ? CheckCircle2
                    : entry.status === 'PENDING_CONFIRMATION'
                    ? AlertCircle
                    : entry.status === 'BLOCKED'
                    ? XCircle
                    : Circle

                const statusClass =
                  entry.status === 'EXECUTED'
                    ? 'success'
                    : entry.status === 'PENDING_CONFIRMATION'
                    ? 'warning'
                    : entry.status === 'BLOCKED'
                    ? 'danger'
                    : 'neutral'

                return (
                  <li key={entry.id} className={`automation__log-item automation__log-item--${statusClass}`}>
                    <Icon size={18} className={`automation__log-icon automation__log-icon--${statusClass}`} aria-hidden="true" />
                    <div className="automation__log-main">
                      <span className="automation__log-device">{entry.deviceName}</span>
                      <span className="automation__log-action">→ {entry.action}</span>
                    </div>
                    <Status
                      type={
                        entry.status === 'EXECUTED'
                          ? 'completed'
                          : entry.status === 'PENDING_CONFIRMATION'
                          ? 'waiting'
                          : entry.status === 'BLOCKED'
                          ? 'blocked'
                          : 'idle'
                      }
                      size="sm"
                    />
                    <span className="automation__log-time">{formatDateTime(entry.timestamp)}</span>
                    {entry.status === 'PENDING_CONFIRMATION' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConfirm(entry.id)}
                      >
                        อนุมัติ
                      </Button>
                    )}
                    {entry.reason && (
                      <span className="automation__log-reason">{entry.reason}</span>
                    )}
                  </li>
                )
              })}
          </ul>
        ) : (
          <EmptyState
            title="ยังไม่มีประวัติ"
            description="เมื่อ execute แผนแล้ว ประวัติจะแสดงที่นี่"
          />
        )}
      </Card>
    </div>
  )
}
