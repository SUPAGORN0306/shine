/**
 * preferenceService — User Preference Learning (Prototype)
 * - Rule-based (ไม่ใช่ Deep Learning)
 * - อัปเดต preference score 0–100 ตามการเลือกของผู้ใช้
 * - คำนวณ baseline + เปรียบเทียบ scenario กับ baseline
 */

import type {
  BaselineMode,
  BaselineResult,
  ComparisonResult,
  PreferenceEvent,
  UserPreferences,
  DevicePreference,
} from '../types'
import {
  getPreferences,
  setPreferences,
  getBaselineMode,
  setBaselineMode,
  getSettings,
} from './storageService'
import { MOCK_HOURLY_AVERAGE_W, MOCK_DEVICES } from '../data/mockData'
import { clamp, round, wattsToKw, calculateSavingPercent } from '../utils/calculations'

// ============================================================
// Preference Learning (Rule-based)
// ============================================================

const SIGNAL_DELTA: Record<PreferenceEvent['signal'], number> = {
  accepted: +5,
  rejected: -5,
  overridden: -3,
}

/** อ่าน preference score ของอุปกรณ์ (ค่าเริ่มต้น 50) */
export function getPreferenceScore(deviceId: string): number {
  const prefs = getPreferences()
  return prefs.devicePreferences[deviceId]?.score ?? 50
}

/** อ่าน preferences ทั้งหมด */
export function getAllPreferences(): UserPreferences {
  return getPreferences()
}

/**
 * อัปเดต preference จาก signal ของผู้ใช้
 * Rule-based: accepted +5, rejected −5, overridden −3 (clamp 0–100)
 */
export function updatePreferences(event: PreferenceEvent): UserPreferences {
  const prefs = getPreferences()
  const delta = event.weight ?? SIGNAL_DELTA[event.signal]
  const current: DevicePreference = prefs.devicePreferences[event.deviceId] ?? {
    deviceId: event.deviceId,
    score: 50,
    updatedAt: new Date().toISOString(),
  }

  const newScore = clamp(current.score + delta, 0, 100)

  const updated: UserPreferences = {
    ...prefs,
    devicePreferences: {
      ...prefs.devicePreferences,
      [event.deviceId]: {
        deviceId: event.deviceId,
        score: newScore,
        updatedAt: new Date().toISOString(),
      },
    },
  }

  setPreferences(updated)
  return updated
}

/** รีเซ็ต preference ทั้งหมด */
export function resetPreferences(): UserPreferences {
  const prefs = getPreferences()
  const reset: UserPreferences = { ...prefs, devicePreferences: {} }
  setPreferences(reset)
  return reset
}

/** Insight สำหรับแสดงบน Dashboard */
export interface PreferenceInsight {
  deviceId: string
  deviceName: string
  score: number
  direction: 'up' | 'down' | 'stable'
}

export function getPreferenceInsights(): PreferenceInsight[] {
  const prefs = getPreferences()
  return MOCK_DEVICES.map((d) => {
    const score = prefs.devicePreferences[d.id]?.score ?? 50
    const direction: 'up' | 'down' | 'stable' =
      score > 55 ? 'up' : score < 45 ? 'down' : 'stable'
    return { deviceId: d.id, deviceName: d.name, score, direction }
  }).filter((i) => i.score !== 50)   // แสดงเฉพาะที่เปลี่ยนจาก default
}

// ============================================================
// Baseline (ใช้ร่วมกันทั้งระบบ)
// ============================================================

const BASELINE_FACTOR: Record<BaselineMode, number> = {
  CURRENT_BEHAVIOR: 1.0,     // ค่าจริงของปัจจุบัน
  BALANCED: 0.85,            // ลด 15%
  ENERGY_SAVING: 0.70,       // ลด 30%
  MAXIMUM_SAVING: 0.55,      // ลด 45%
}

const BASELINE_LABEL: Record<BaselineMode, string> = {
  CURRENT_BEHAVIOR: 'Current Behavior',
  BALANCED: 'Balanced',
  ENERGY_SAVING: 'Energy Saving',
  MAXIMUM_SAVING: 'Maximum Saving',
}

/**
 * คำนวณ baseline ตามโหมดที่เลือก
 * ⚠️ ใช้ค่าจำลองจาก MOCK_HOURLY_AVERAGE_W
 */
export function calculateBaseline(mode?: BaselineMode): BaselineResult {
  const selectedMode = mode ?? getBaselineMode()
  const settings = getSettings()

  // พลังงานรวมต่อวันจากค่าเฉลี่ย hourly
  const totalKwh = MOCK_HOURLY_AVERAGE_W.reduce(
    (s, w) => s + wattsToKw(w),
    0
  )

  const factor = BASELINE_FACTOR[selectedMode]
  const energyKwh = round(totalKwh * factor, 2)
  const cost = round(energyKwh * settings.electricityRate, 2)

  return {
    mode: selectedMode,
    energyKwh,
    cost,
    label: BASELINE_LABEL[selectedMode],
  }
}

/**
 * เปรียบเทียบ scenario กับ baseline
 */
export function compareWithBaseline(
  scenarioEnergyKwh: number,
  scenarioCost: number,
  baseline: BaselineResult
): ComparisonResult {
  const energySavingKwh = round(
    Math.max(0, baseline.energyKwh - scenarioEnergyKwh),
    2
  )
  const costSaving = round(Math.max(0, baseline.cost - scenarioCost), 2)
  const savingPercentage = round(
    calculateSavingPercent(baseline.energyKwh, energySavingKwh),
    1
  )

  return {
    baselineEnergyKwh: baseline.energyKwh,
    baselineCost: baseline.cost,
    scenarioEnergyKwh: round(scenarioEnergyKwh, 2),
    scenarioCost: round(scenarioCost, 2),
    energySavingKwh,
    costSaving,
    savingPercentage,
  }
}

/** เปลี่ยน baseline mode + บันทึก */
export function setBaseline(mode: BaselineMode): void {
  setBaselineMode(mode)
}

/** อ่าน baseline mode ปัจจุบัน */
export function getBaseline(): BaselineMode {
  return getBaselineMode()
}
