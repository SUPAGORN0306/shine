/**
 * energyService — จัดการข้อมูลพลังงาน
 * - อ่าน readings ย้อนหลัง
 * - คำนวณ KPI (Total, Average, Peak, Cost)
 * - Device breakdown
 * ⚠️ Prototype Simulation — ใช้ mock data
 */

import type { EnergyReading } from '../types'
import {
  MOCK_READINGS,
  MOCK_DEVICE_BREAKDOWN_DAILY,
  type DeviceBreakdown,
} from '../data/mockData'
import { getSettings } from './storageService'
import { round } from '../utils/calculations'

export type PeriodOption = 'daily' | 'weekly' | 'monthly'

/** KPI สรุปสำหรับหน้า Energy Usage */
export interface EnergyKpis {
  totalEnergyKwh: number
  averageEnergyKwh: number
  peakPowerW: number
  estimatedCost: number
}

/** จุดข้อมูลในกราฟ */
export interface EnergyChartPoint {
  timestamp: string
  label: string
  powerW: number
  energyKwh: number
  cost: number
}

/** อ่าน readings ตามช่วงเวลา (Prototype: ใช้ mock + scale) */
export function getReadingsByPeriod(period: PeriodOption): EnergyReading[] {
  // Prototype: mock มี 24 ชม. — ขยายเป็น weekly/monthly ด้วยการทำซ้ำ + scale
  if (period === 'daily') return MOCK_READINGS

  if (period === 'weekly') {
    // 7 วัน — ใช้ค่าเฉลี่ยต่อวัน × 7 (จำลอง)
    const dailyTotal = MOCK_READINGS.reduce((s, r) => s + r.energyKwh, 0)
    const result: EnergyReading[] = []
    for (let d = 6; d >= 0; d--) {
      const ts = new Date(Date.now() - d * 86400 * 1000)
      result.push({
        timestamp: ts.toISOString(),
        powerW: 0,
        energyKwh: round(dailyTotal, 3),
        voltage: 220,
        current: 0,
      })
    }
    return result
  }

  // monthly — 30 วัน
  const dailyTotal = MOCK_READINGS.reduce((s, r) => s + r.energyKwh, 0)
  const result: EnergyReading[] = []
  for (let d = 29; d >= 0; d--) {
    const ts = new Date(Date.now() - d * 86400 * 1000)
    result.push({
      timestamp: ts.toISOString(),
      powerW: 0,
      energyKwh: round(dailyTotal * (0.85 + Math.random() * 0.3), 3),
      voltage: 220,
      current: 0,
    })
  }
  return result
}

/** คำนวณ KPI จาก readings */
export function calculateKpis(
  readings: EnergyReading[],
  rate: number,
  period: PeriodOption
): EnergyKpis {
  const totalEnergyKwh = round(
    readings.reduce((s, r) => s + r.energyKwh, 0),
    2
  )
  const peakPowerW = readings.reduce((m, r) => Math.max(m, r.powerW), 0)

  // Average ต่อหน่วย (วัน / ชม.)
  const divisor =
    period === 'daily' ? readings.length : readings.length
  const averageEnergyKwh = divisor > 0 ? round(totalEnergyKwh / divisor, 2) : 0

  const estimatedCost = round(totalEnergyKwh * rate, 2)

  return { totalEnergyKwh, averageEnergyKwh, peakPowerW, estimatedCost }
}

/** ดึง KPI พร้อม rate จาก Settings อัตโนมัติ */
export function getKpis(period: PeriodOption): EnergyKpis {
  const settings = getSettings()
  const readings = getReadingsByPeriod(period)
  return calculateKpis(readings, settings.electricityRate, period)
}

/** สร้างจุดกราฟ (ตาม period) */
export function getChartData(period: PeriodOption): EnergyChartPoint[] {
  const settings = getSettings()
  const readings = getReadingsByPeriod(period)

  return readings.map((r) => {
    const d = new Date(r.timestamp)
    const label =
      period === 'daily'
        ? d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })

    return {
      timestamp: r.timestamp,
      label,
      powerW: r.powerW,
      energyKwh: r.energyKwh,
      cost: round(r.energyKwh * settings.electricityRate, 2),
    }
  })
}

/** Device breakdown (Prototype: ใช้ mock) */
export function getDeviceBreakdown(): DeviceBreakdown[] {
  const total = MOCK_DEVICE_BREAKDOWN_DAILY.reduce(
    (s, d) => s + d.energyKwh,
    0
  )
  return MOCK_DEVICE_BREAKDOWN_DAILY.map((d) => ({
    ...d,
    percentage: total > 0 ? round((d.energyKwh / total) * 100, 1) : 0,
  }))
}

/** พลังงานวันนี้รวม (จาก readings) */
export function getTodayEnergyKwh(): number {
  return round(
    MOCK_READINGS.reduce((s, r) => s + r.energyKwh, 0),
    2
  )
}

/** กำลังไฟปัจจุบัน */
export function getCurrentPowerW(): number {
  const last = MOCK_READINGS[MOCK_READINGS.length - 1]
  return last ? last.powerW : 0
}

/** อ่านค่า reading ล่าสุด */
export function getCurrentReading(): EnergyReading {
  return MOCK_READINGS[MOCK_READINGS.length - 1]
}

/** Weekly energy ของอุปกรณ์ (Prototype: ประมาณการ) */
export function getWeeklyEnergyKwh(deviceId: string): number {
  const breakdown = MOCK_DEVICE_BREAKDOWN_DAILY.find(
    (d) => d.deviceId === deviceId
  )
  return breakdown ? round(breakdown.energyKwh * 7, 2) : 0
}
