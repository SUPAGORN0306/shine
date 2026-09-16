/**
 * predictionService — คาดการณ์การใช้พลังงาน
 * ⚠️ Prototype Simulation: ใช้ rule-based heuristic
 * Future: XGBoost / Gradient Boosting
 */

import type {
  EnergyReading,
  ForecastHorizon,
  Prediction,
  PredictionResult,
} from '../types'
import { MOCK_READINGS, MOCK_HOURLY_AVERAGE_W } from '../data/mockData'
import { getSettings } from './storageService'
import { round, wattsToKw } from '../utils/calculations'

/**
 * คาดการณ์พลังงานในอนาคต
 *
 * @param readings - ข้อมูลย้อนหลัง (ถ้าไม่ส่ง ใช้ mock)
 * @param horizon - ช่วงคาดการณ์: '1h' | '3h' | '6h'
 * @param rate - อัตราค่าไฟ (ถ้าไม่ส่ง ดึงจาก Settings)
 * @returns ผลการคาดการณ์ (Prototype Simulation)
 *
 * ⚠️ Prototype ใช้ heuristic จาก hour-of-day profile
 *    ไม่ใช่ ML model ที่ train จริง
 *    โครงสร้างฟังก์ชันออกแบบให้เปลี่ยนเป็น XGBoost ได้ในอนาคต
 */
export function predictEnergy(
  readings: EnergyReading[] = MOCK_READINGS,
  horizon: ForecastHorizon = '6h',
  rate?: number
): PredictionResult {
  const electricityRate = rate ?? getSettings().electricityRate
  const horizonHours = horizon === '1h' ? 1 : horizon === '3h' ? 3 : 6

  const now = new Date()
  const points: Prediction[] = []

  for (let i = 1; i <= horizonHours; i++) {
    const future = new Date(now.getTime() + i * 3600 * 1000)
    const hour = future.getHours()

    // Rule-based: ใช้ค่าเฉลี่ย hour-of-day จาก mock + ปรับตาม trend ล่าสุด
    const baseline = MOCK_HOURLY_AVERAGE_W[hour]

    // Trend factor จาก 3 จุดล่าสุด (เบาๆ)
    const recent = readings.slice(-3)
    const recentAvg =
      recent.reduce((s, r) => s + r.powerW, 0) / (recent.length || 1)
    const overallAvg =
      readings.reduce((s, r) => s + r.powerW, 0) / (readings.length || 1)
    const trendFactor = overallAvg > 0 ? recentAvg / overallAvg : 1

    const predictedPowerW = Math.round(baseline * Math.min(trendFactor, 1.2))
    const predictedEnergyKwh = round(wattsToKw(predictedPowerW), 3)
    const predictedCost = round(predictedEnergyKwh * electricityRate, 2)

    points.push({
      timestamp: future.toISOString(),
      predictedPowerW,
      predictedEnergyKwh,
      predictedCost,
    })
  }

  const totalEnergy = round(
    points.reduce((s, p) => s + p.predictedEnergyKwh, 0),
    2
  )
  const totalCost = round(
    points.reduce((s, p) => s + p.predictedCost, 0),
    2
  )
  const avgPower =
    points.length > 0
      ? Math.round(
          points.reduce((s, p) => s + p.predictedPowerW, 0) / points.length
        )
      : 0

  return {
    method: 'simulated-rule-based',
    horizon,
    points,
    summary: {
      predictedEnergyKwh: totalEnergy,
      predictedCost: totalCost,
      averagePowerW: avgPower,
    },
  }
}

/** ดึงข้อมูลคาดการณ์สำหรับ 3 horizons พร้อมกัน */
export function getAllForecasts(rate?: number): {
  '1h': PredictionResult
  '3h': PredictionResult
  '6h': PredictionResult
} {
  return {
    '1h': predictEnergy(MOCK_READINGS, '1h', rate),
    '3h': predictEnergy(MOCK_READINGS, '3h', rate),
    '6h': predictEnergy(MOCK_READINGS, '6h', rate),
  }
}

/** ข้อความแสดงใน UI เพื่อความโปร่งใส */
export const PREDICTION_DISCLAIMER = {
  title: 'Prediction Engine',
  badge: 'Prototype Simulation',
  futureNote:
    'Future Implementation: XGBoost / Gradient Boosting model using historical energy data and time-based features.',
} as const
