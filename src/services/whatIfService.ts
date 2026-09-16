/**
 * whatIfService — จำลองสถานการณ์ What-if
 * คำนวณ Energy Saving, Cost Saving, Comfort Impact
 * logic ทั้งหมดอยู่ที่นี่ ไม่กระจายใน component
 */

import type {
  ComfortImpact,
  Scenario,
  ScenarioAction,
  ScenarioResult,
} from '../types'
import { MOCK_DEVICES, MOCK_USAGE_PATTERNS } from '../data/mockData'
import { getSettings } from './storageService'
import {
  calculateEnergyKwh,
  calculateEnergySaving,
  calculateCostSaving,
  clamp,
  round,
} from '../utils/calculations'

/** ค่า comfort penalty ต่อ action (0 = ไม่กระทบ, 1 = กระทบมาก) */
const COMFORT_PENALTY: Record<ScenarioAction['type'], number> = {
  KEEP_ON: 0,
  TURN_OFF: 1,
  REDUCE_USAGE: 0.5,
  DELAY: 0.2,
}

/** อุปกรณ์ที่กระทบ comfort มาก (ปิดแล้วรู้สึกไม่สบาย) */
const HIGH_COMFORT_DEVICES = ['ac', 'lights', 'fan']

/**
 * จำลอง scenario
 *
 * @param actions - action ที่ผู้ใช้เลือก
 * @returns ผลการจำลอง (Prototype Simulation)
 */
export function simulateScenario(actions: ScenarioAction[]): ScenarioResult {
  const settings = getSettings()
  const rate = settings.electricityRate

  let currentEnergyKwh = 0
  let scenarioEnergyKwh = 0
  let comfortPenaltySum = 0
  let comfortWeightSum = 0

  const breakdownByDevice = MOCK_DEVICES.map((device) => {
    const pattern = MOCK_USAGE_PATTERNS[device.id]
    const hoursPerDay = pattern?.averageHoursPerDay ?? 1

    // พลังงานปัจจุบันของอุปกรณ์นี้
    const beforeKwh = calculateEnergyKwh(device.estimatedPowerW, hoursPerDay)
    currentEnergyKwh += beforeKwh

    // หา action ของอุปกรณ์นี้
    const action = actions.find((a) => a.deviceId === device.id)
    let afterPowerW = device.estimatedPowerW
    let afterHours = hoursPerDay

    if (action) {
      if (action.type === 'TURN_OFF') {
        afterPowerW = 0
        afterHours = 0
      } else if (action.type === 'REDUCE_USAGE') {
        const pct = action.reducePercent ?? 50
        afterHours = hoursPerDay * (1 - pct / 100)
      } else if (action.type === 'DELAY') {
        // เลื่อนเวลา — พลังงานเท่าเดิม (ประหยัดเฉพาะถ้ามี TOU rate)
        // Prototype: ไม่ลดพลังงาน
      }
      // KEEP_ON = ไม่เปลี่ยน

      // สะสม comfort penalty
      const weight = HIGH_COMFORT_DEVICES.includes(device.id) ? 2 : 1
      comfortPenaltySum += COMFORT_PENALTY[action.type] * weight
      comfortWeightSum += weight
    }

    const afterKwh = calculateEnergyKwh(afterPowerW, afterHours)
    scenarioEnergyKwh += afterKwh

    return {
      deviceId: device.id,
      deviceName: device.name,
      beforePowerW: device.estimatedPowerW,
      afterPowerW,
      savingKwh: round(beforeKwh - afterKwh, 3),
    }
  })

  currentEnergyKwh = round(currentEnergyKwh, 2)
  scenarioEnergyKwh = round(scenarioEnergyKwh, 2)
  const energySavingKwh = round(
    calculateEnergySaving(currentEnergyKwh, scenarioEnergyKwh),
    2
  )
  const currentCost = currentEnergyKwh * rate
  const scenarioCost = scenarioEnergyKwh * rate
  const costSaving = round(calculateCostSaving(currentCost, scenarioCost), 2)

  // Comfort impact: 100 = สบายเต็ม, ลดตาม penalty
  const comfortScore =
    comfortWeightSum > 0
      ? clamp(100 - (comfortPenaltySum / comfortWeightSum) * 50, 0, 100)
      : 100

  const comfortImpact: ComfortImpact = {
    score: round(comfortScore, 0),
    level: comfortScore >= 75 ? 'HIGH' : comfortScore >= 45 ? 'MEDIUM' : 'LOW',
  }

  return {
    currentEnergyKwh,
    scenarioEnergyKwh,
    energySavingKwh,
    costSaving,
    comfortImpact,
    breakdownByDevice,
  }
}

// ============================================================
// Preset Scenarios
// ============================================================

/** Scenario สำเร็จรูป 3 แบบ */
export function getPresetScenarios(rate?: number): Scenario[] {
  const settings = getSettings()
  const electricityRate = rate ?? settings.electricityRate

  const presets: Array<{
    id: string
    name: string
    description: string
    actions: ScenarioAction[]
  }> = [
    {
      id: 'keep-current',
      name: 'Keep Current',
      description: 'ไม่เปลี่ยนพฤติกรรม — ใช้พลังงานเท่าเดิม',
      actions: MOCK_DEVICES.map((d) => ({
        deviceId: d.id,
        type: 'KEEP_ON' as const,
      })),
    },
    {
      id: 'balanced-saving',
      name: 'Balanced Saving',
      description: 'ปิด TV และ Lights — ลดการใช้โดยไม่กระทบ comfort มาก',
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
      description: 'ปิดทุกอย่างที่ปิดได้ — ประหยัดสูงสุด',
      actions: [
        { deviceId: 'tv', type: 'TURN_OFF' },
        { deviceId: 'lights', type: 'TURN_OFF' },
        { deviceId: 'fan', type: 'TURN_OFF' },
        { deviceId: 'ac', type: 'TURN_OFF' },
        { deviceId: 'washing_machine', type: 'DELAY' },
      ],
    },
  ]

  return presets.map((p) => {
    const result = simulateScenario(p.actions)
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      actions: p.actions,
      predictedEnergyKwh: result.scenarioEnergyKwh,
      predictedCost: round(result.scenarioEnergyKwh * electricityRate, 2),
      energySavingKwh: result.energySavingKwh,
      costSaving: result.costSaving,
      comfortLevel: result.comfortImpact.score,
      preferenceScore: 0,   // จะคำนวณใน decisionService
    }
  })
}

/** Actions เริ่มต้น (ทุกอุปกรณ์ KEEP_ON) */
export function getDefaultActions(): ScenarioAction[] {
  return MOCK_DEVICES.map((d) => ({
    deviceId: d.id,
    type: 'KEEP_ON' as const,
  }))
}
