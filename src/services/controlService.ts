/**
 * controlService — Control Layer (Prototype Simulation)
 * - ตรวจ permission ก่อน execute
 * - NEVER → blocked ทันที
 * - ASK → ต้องขอ confirmation
 * ⚠️ ยังไม่เชื่อม Smart Plug จริง
 */

import type {
  ControlHistoryEntry,
  ControlStatus,
  Permission,
  PermissionCheckResult,
  ScenarioAction,
  SelectedPlan,
} from '../types'
import { MOCK_DEVICES } from '../data/mockData'
import {
  getPermissions,
  setPermissions,
  getControlHistory,
  setControlHistory,
} from './storageService'
import { round } from '../utils/calculations'

// ============================================================
// Permission Check
// ============================================================

/**
 * ตรวจสอบว่า action นี้ทำได้หรือไม่ ตาม permission
 *
 * AUTO  → execute ได้
 * ASK   → ต้องขอ confirmation ก่อน
 * NEVER → ห้าม execute เด็ดขาด
 */
export function checkPermission(
  deviceId: string,
  _action: ScenarioAction
): PermissionCheckResult {
  const permissions = getPermissions()
  const permission: Permission = permissions[deviceId] ?? 'ASK'

  if (permission === 'NEVER') {
    return {
      allowed: false,
      requiresConfirmation: false,
      reason: `อุปกรณ์นี้ถูกตั้งค่าเป็น NEVER — ระบบห้ามควบคุม`,
      permission,
    }
  }

  if (permission === 'ASK') {
    return {
      allowed: true,
      requiresConfirmation: true,
      reason: `ต้องได้รับการยืนยันจากผู้ใช้ก่อน`,
      permission,
    }
  }

  return {
    allowed: true,
    requiresConfirmation: false,
    reason: `สามารถดำเนินการได้ตามแผน`,
    permission,
  }
}

// ============================================================
// Permission Management
// ============================================================

/** เปลี่ยน permission ของอุปกรณ์ */
export function updatePermission(deviceId: string, permission: Permission): void {
  const current = getPermissions()
  setPermissions({ ...current, [deviceId]: permission })
}

/** อ่าน permission ปัจจุบันทั้งหมด */
export function getAllPermissions(): Record<string, Permission> {
  return getPermissions()
}

// ============================================================
// Execute Decision (Prototype Simulation)
// ============================================================

export interface ExecutionResult {
  entries: ControlHistoryEntry[]
  executedCount: number
  pendingCount: number
  blockedCount: number
}

/**
 * จำลองการ execute plan
 * - ตรวจ permission ก่อน
 * - บันทึกประวัติลง controlHistory
 * - ⚠️ ไม่ได้ควบคุมอุปกรณ์จริง
 */
export function executeDecision(plan: SelectedPlan): ExecutionResult {
  const permissions = getPermissions()
  const history = getControlHistory()
  const entries: ControlHistoryEntry[] = []

  let executedCount = 0
  let pendingCount = 0
  let blockedCount = 0

  const now = new Date().toISOString()

  for (const action of plan.planSnapshot.actions) {
    if (action.type === 'KEEP_ON') continue

    const device = MOCK_DEVICES.find((d) => d.id === action.deviceId)
    if (!device) continue

    const check = checkPermission(action.deviceId, action)
    let status: ControlStatus

    if (!check.allowed) {
      status = 'BLOCKED'
      blockedCount++
    } else if (check.requiresConfirmation) {
      status = 'PENDING_CONFIRMATION'
      pendingCount++
    } else {
      status = 'EXECUTED'
      executedCount++
    }

    const entry: ControlHistoryEntry = {
      id: `${action.deviceId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deviceId: action.deviceId,
      deviceName: device.name,
      action: action.type,
      status,
      method: 'SIMULATED',
      reason: check.reason,
      timestamp: now,
    }

    entries.push(entry)
  }

  const updated = [...history, ...entries]
  setControlHistory(updated)

  // อัปเดตสถานะ selected plan เป็น executed
  // (จะทำใน decisionService.selectPlan ฝั่ง UI)

  return { entries, executedCount, pendingCount, blockedCount }
}

/**
 * อนุมัติ pending action (ผู้ใช้ยืนยัน)
 */
export function confirmPending(entryId: string): ControlHistoryEntry | null {
  const history = getControlHistory()
  const idx = history.findIndex((e) => e.id === entryId)
  if (idx === -1) return null

  const updated = [...history]
  updated[idx] = { ...updated[idx], status: 'EXECUTED' }
  setControlHistory(updated)
  return updated[idx]
}

/** อ่านประวัติการควบคุม */
export function getHistory(): ControlHistoryEntry[] {
  return getControlHistory()
}

/** ล้างประวัติ */
export function clearHistory(): void {
  setControlHistory([])
}

// ============================================================
// Actual Result Generation (สำหรับ Feedback)
// ============================================================

export interface ActualResultSummary {
  expectedEnergyKwh: number
  actualEnergyKwh: number
  expectedSaving: number
  actualSaving: number
  differenceKwh: number
  predictionErrorPercent: number
}

/**
 * สร้าง Actual Result จากแผน (จำลองผลจริง)
 * ใช้ deterministic jitter จาก planId เพื่อให้ reproducible
 */
export function generateActualResult(plan: SelectedPlan): ActualResultSummary {
  // deterministic jitter: hash จาก planId → ±2–5%
  const hash = plan.planId
    .split('')
    .reduce((s, c) => s + c.charCodeAt(0), 0)
  const jitterPct = ((hash % 4) + 2) / 100   // 2–5%
  const sign = hash % 2 === 0 ? 1 : -1

  const expectedEnergy = plan.planSnapshot.expectedEnergyKwh
  const expectedSaving = plan.planSnapshot.expectedSaving

  const actualEnergy = round(expectedEnergy * (1 + sign * jitterPct), 2)
  const actualSaving = round(expectedSaving * (1 - sign * jitterPct), 2)

  const differenceKwh = round(actualEnergy - expectedEnergy, 2)
  const predictionErrorPercent =
    expectedEnergy > 0
      ? round((differenceKwh / expectedEnergy) * 100, 1)
      : 0

  return {
    expectedEnergyKwh: expectedEnergy,
    actualEnergyKwh: actualEnergy,
    expectedSaving,
    actualSaving,
    differenceKwh,
    predictionErrorPercent,
  }
}

/** ข้อความแสดงใน UI */
export const CONTROL_DISCLAIMER = {
  title: 'Control Layer',
  badge: 'Prototype Simulation',
  futureNote: 'Future: Smart Plug / Smart Switch / Device API',
} as const
