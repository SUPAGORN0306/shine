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
  const currentCost = currentEnergy
