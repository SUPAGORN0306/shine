/**
 * nilmService — ประมาณการแยกอุปกรณ์จาก Aggregate Power
 * ⚠️ Prototype Simulation: ใช้ผลจำลอง ไม่ใช่ ML model จริง
 * Future: Real NILM model
 */

import type { EnergyReading, NilmResult } from '../types'
import { MOCK_NILM_RESULT, MOCK_READINGS } from '../data/mockData'

/**
 * ประมาณการการใช้งานของแต่ละอุปกรณ์จาก aggregate power
 *
 * @param readings - ถ้าไม่ส่ง จะใช้ reading ปัจจุบัน
 * @returns ผลการแยกอุปกรณ์ (Prototype Simulation)
 *
 * ⚠️ ฟังก์ชันนี้ใช้ rule-based simulation
 *    ยังไม่ใช่ NILM machine learning model จริง
 */
export function identifyDevices(readings?: EnergyReading[]): NilmResult {
  const source = readings && readings.length > 0 ? readings : MOCK_READINGS
  const latest = source[source.length - 1]

  // Prototype: คืนค่าจำลองที่เตรียมไว้
  // พร้อมโครงสร้างที่สามารถแทนด้วย ML model จริงในอนาคต
  return {
    method: 'simulated',
    aggregatePowerW: latest.powerW || MOCK_NILM_RESULT.aggregatePowerW,
    devices: MOCK_NILM_RESULT.devices.map((d) => ({ ...d })),
    otherPowerW: MOCK_NILM_RESULT.otherPowerW,
    timestamp: new Date().toISOString(),
  }
}

/** ค่า aggregate ปัจจุบัน */
export function getAggregatePowerW(): number {
  const last = MOCK_READINGS[MOCK_READINGS.length - 1]
  return last ? last.powerW : MOCK_NILM_RESULT.aggregatePowerW
}

/** ข้อความแสดงใน UI เพื่อความโปร่งใส */
export const NILM_DISCLAIMER = {
  title: 'Device Identification — Prototype Simulation',
  description:
    'Energy Monitor ตรวจวัด Aggregate Power และระบบประมาณการใช้งานของแต่ละอุปกรณ์',
  futureNote:
    'Future integration: Real NILM model',
} as const
