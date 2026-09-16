/**
 * decisionService — Decision Engine
 * สร้างแผน 2–3 แผนจาก goal/priority/constraints
 * ❌ ห้ามเลือกแผนแทนผู้ใช้ — แค่ generate options
 */

import type {
  Constraints,
  DecisionInput,
  DecisionPlan,
  DecisionPlanResult,
  Priority,
  ScenarioAction,
  SelectedPlan,
} from '../types'
import { MOCK_DEVICES } from '../data/mockData'
import {
  getSettings,
  getPermissions,
  getSelectedPlan,
  setSelectedPlan,
} from './storageService'
import { simulateScenario, getPresetScenarios } from './whatIfService'
import { calculateBaseline, getPreferenceScore } from './preferenceService'
import { round } from '../utils/calculations'

// ============================================================
// Candidate Plan Templates
// ============================================================

interface PlanTemplate {
  id: string
  name: string
  description: string
  priority: Priority
  actions: ScenarioAction[]
}

function buildTemplates(): PlanTemplate[] {
  return [
    {
      id: 'comfort-first',
      name: 'Comfort First',
      description: 'รักษาความสบายสูงสุด — ปรับเฉพาะอุปกรณ์ที่ไม่กระทบ comfort',
      priority: 'COMFORT',
      actions: [
        { deviceId: 'tv', type: 'TURN_OFF' },
        { deviceId: 'washing_machine', type: 'DELAY' },
        { deviceId: 'ac', type: 'KEEP_ON' },
        { deviceId: 'lights', type: 'KEEP_ON' },
        { deviceId: 'fan', type: 'KEEP_ON' },
      ],
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'สมดุลระหว่างความสบายและการประหยัด',
      priority: 'BALANCED',
      actions: [
        { deviceId: 'tv', type: 'TURN_OFF' },
        { deviceId: 'lights', type: 'TURN_OFF' },
        { deviceId: 'ac', type: 'REDUCE_USAGE', reducePercent: 30 },
        { deviceId: 'fan', type: 'KEEP_ON' },
        { deviceId: 'washing_machine', type: 'DELAY' },
      ],
    },
    {
      id: 'energy-saving',
      name: 'Energy Saving',
      description: 'ประหยัดสูงสุด — ลดการใช้ทุกอุปกรณ์ที่ทำได้',
      priority: 'ENERGY_SAVING',
      actions: [
        { deviceId: 'tv', type: 'TURN_OFF' },
        { deviceId: 'lights', type: 'TURN_OFF' },
        { deviceId: 'fan', type: 'TURN_OFF' },
        { deviceId: 'ac', type: 'TURN_OFF' },
        { deviceId: 'washing_machine', type: 'DELAY' },
      ],
    },
  ]
}

// ============================================================
// Constraint Check (hard)
// ============================================================

function checkConstraints(
  expectedEnergyKwh: number,
  expectedCost: number,
  comfortScore: number,
  actions: ScenarioAction[],
  constraints: Constraints,
  permissions: Record<string, string>
): { valid: boolean; reason?: string } {
  // 1. ห้ามใช้เกิน maxDailyUsage
  if (expectedEnergyKwh > constraints.maxDailyUsageKwh) {
    return {
      valid: false,
      reason: `ใช้พลังงานเกินขีดจำกัด (${expectedEnergyKwh} > ${constraints.maxDailyUsageKwh} kWh)`,
    }
  }

  // 2. ห้ามค่าไฟเกิน maxDailyCost
  if (expectedCost > constraints.maxDailyCost) {
    return {
      valid: false,
      reason: `ค่าไฟเกินขีดจำกัด (${expectedCost} > ${constraints.maxDailyCost} บาท)`,
    }
  }

  // 3. comfort ต้องไม่ต่ำกว่า minComfortLevel
  if (comfortScore < constraints.minComfortLevel) {
    return {
      valid: false,
      reason: `Comfort ต่ำกว่าเกณฑ์ (${comfortScore} < ${constraints.minComfortLevel})`,
    }
  }

  // 4. ห้าม action กับ NEVER device
  for (const action of actions) {
    if (permissions[action.deviceId] === 'NEVER' && action.type !== 'KEEP_ON') {
      return {
        valid: false,
        reason: `อุปกรณ์ "${action.deviceId}" ถูกตั้งค่าเป็น NEVER — ห้ามควบคุม`,
      }
    }
  }

  return { valid: true }
}

// ============================================================
// generatePlans
// ============================================================

/**
 * สร้างแผน 2–3 แผนจาก input ของผู้ใช้
 *
 * ขั้นตอน:
 * 1. สร้าง candidate plans
 * 2. ตรวจ hard constraints
 * 3. ตัดแผนที่ผิด constraint
 * 4. คำนวณ energy saving
 * 5. คำนวณ cost saving
 * 6. คำนวณ comfort impact
 * 7. คำนวณ preference score
 * 8. คืนแผนที่ valid
 */
export function generatePlans(input: DecisionInput): DecisionPlanResult {
  const settings = getSettings()
  const permissions = getPermissions()
  const rate = settings.electricityRate

  const templates = buildTemplates()
  const plans: DecisionPlan[] = []
  const rejected: DecisionPlan[] = []

  for (const template of templates) {
    // จำลอง scenario
    const result = simulateScenario(template.actions)

    // Preference score: เฉลี่ย score ของอุปกรณ์ที่ถูก action
    const affected = template.actions.filter((a) => a.type !== 'KEEP_ON')
    const prefScore =
      affected.length > 0
        ? affected.reduce((s, a) => s + getPreferenceScore(a.deviceId), 0) /
          affected.length
        : 50

    // Saving จาก baseline
    const energySavingKwh = round(
      Math.max(0, input.baseline.energyKwh - result.scenarioEnergyKwh),
      2
    )
    const expectedCost = round(result.scenarioEnergyKwh * rate, 2)

    // ตรวจ constraints (hard)
    const check = checkConstraints(
      result.scenarioEnergyKwh,
      expectedCost,
      result.comfortImpact.score,
      template.actions,
      input.constraints,
      permissions
    )

    const plan: DecisionPlan = {
      id: template.id,
      name: template.name,
      description: template.description,
      actions: template.actions,
      expectedEnergyKwh: result.scenarioEnergyKwh,
      expectedCost,
      expectedSaving: energySavingKwh,
      comfortImpact: result.comfortImpact,
      preferenceScore: round(prefScore, 0),
      valid: check.valid,
      rejectReason: check.reason,
    }

    if (check.valid) {
      plans.push(plan)
    } else {
      rejected.push(plan)
    }
  }

  // เรียงตาม preference score (สูงก่อน) — ❌ ไม่ได้เลือกแทนผู้ใช้ แค่จัดลำดับการแสดง
  plans.sort((a, b) => b.preferenceScore - a.preferenceScore)

  return {
    method: 'rule-based-simulated',
    plans,
    rejected,
    generatedAt: new Date().toISOString(),
  }
}

// ============================================================
// Input Builder
// ============================================================

/** สร้าง input เริ่มต้นจาก settings + permissions */
export function buildDefaultDecisionInput(): DecisionInput {
  const settings = getSettings()
  const permissions = getPermissions()

  const uncontrollableDeviceIds = Object.entries(permissions)
    .filter(([, p]) => p === 'NEVER')
    .map(([id]) => id)

  const confirmationDeviceIds = Object.entries(permissions)
    .filter(([, p]) => p === 'ASK')
    .map(([id]) => id)

  const constraints: Constraints = {
    maxDailyUsageKwh: 15,
    maxDailyCost: 70,
    minComfortLevel: 40,
    uncontrollableDeviceIds,
    confirmationDeviceIds,
  }

  return {
    monthlyGoal: settings.monthlyGoal,
    priority: settings.baselineMode === 'MAXIMUM_SAVING' ? 'ENERGY_SAVING' : 'BALANCED',
    constraints,
    baseline: calculateBaseline(),
  }
}

// ============================================================
// Select Plan (Human-in-the-loop)
// ============================================================

/**
 * บันทึกแผนที่ผู้ใช้เลือก (ห้ามระบบเรียกเอง)
 * ต้องเรียกจาก UI เมื่อผู้ใช้กด Confirm เท่านั้น
 */
export function selectPlan(plan: DecisionPlan): SelectedPlan {
  const selected: SelectedPlan = {
    planId: plan.id,
    planSnapshot: plan,
    selectedAt: new Date().toISOString(),
    status: 'selected',
  }
  setSelectedPlan(selected)
  return selected
}

/** อ่านแผนที่เลือกไว้ */
export function getSelected(): SelectedPlan | null {
  return getSelectedPlan()
}

/** ล้างแผนที่เลือก */
export function clearSelected(): void {
  setSelectedPlan(null)
}

/** จำนวนอุปกรณ์ที่จะถูกควบคุมในแผน */
export function getAffectedDevices(plan: DecisionPlan): {
  willControl: string[]
  needsConfirmation: string[]
  untouched: string[]
} {
  const permissions = getPermissions()
  const willControl: string[] = []
  const needsConfirmation: string[] = []
  const untouched: string[] = []

  for (const device of MOCK_DEVICES) {
    const action = plan.actions.find((a) => a.deviceId === device.id)
    const permission = permissions[device.id] ?? device.permission

    if (!action || action.type === 'KEEP_ON') {
      untouched.push(device.name)
      continue
    }

    if (permission === 'NEVER') {
      untouched.push(device.name)
    } else if (permission === 'ASK') {
      needsConfirmation.push(device.name)
    } else {
      willControl.push(device.name)
    }
  }

  return { willControl, needsConfirmation, untouched }
}
