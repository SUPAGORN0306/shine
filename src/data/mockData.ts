/**
 * Mock Data สำหรับ Prototype Simulation
 * ⚠️ ข้อมูลทั้งหมดเป็นค่าจำลอง ไม่ได้มาจากอุปกรณ์จริง
 * โครงสร้างออกแบบให้พร้อมเชื่อมกับ Energy Monitor จริงในอนาคต
 */

import type {
  Device,
  EnergyReading,
  Permission,
} from '../types'

// ============================================================
// Devices — อุปกรณ์ในบ้าน (7 ตัว)
// ============================================================

export const MOCK_DEVICES: Device[] = [
  {
    id: 'ac',
    name: 'Air Conditioner',
    type: 'AIR_CONDITIONER',
    status: 'ON',
    estimatedPowerW: 1200,
    todayEnergyKwh: 5.6,
    permission: 'ASK',
    controllable: true,
  },
  {
    id: 'tv',
    name: 'TV',
    type: 'TV',
    status: 'ON',
    estimatedPowerW: 130,
    todayEnergyKwh: 0.9,
    permission: 'AUTO',
    controllable: true,
  },
  {
    id: 'lights',
    name: 'Lights',
    type: 'LIGHTS',
    status: 'ON',
    estimatedPowerW: 85,
    todayEnergyKwh: 0.4,
    permission: 'AUTO',
    controllable: true,
  },
  {
    id: 'fan',
    name: 'Fan',
    type: 'FAN',
    status: 'ON',
    estimatedPowerW: 65,
    todayEnergyKwh: 0.3,
    permission: 'AUTO',
    controllable: true,
  },
  {
    id: 'washing_machine',
    name: 'Washing Machine',
    type: 'WASHING_MACHINE',
    status: 'OFF',
    estimatedPowerW: 500,
    todayEnergyKwh: 0.5,
    permission: 'ASK',
    controllable: true,
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    type: 'REFRIGERATOR',
    status: 'ON',
    estimatedPowerW: 150,
    todayEnergyKwh: 1.8,
    permission: 'NEVER',
    controllable: false,
  },
  {
    id: 'wifi_router',
    name: 'Wi-Fi Router',
    type: 'WIFI_ROUTER',
    status: 'ON',
    estimatedPowerW: 12,
    todayEnergyKwh: 0.3,
    permission: 'NEVER',
    controllable: false,
  },
]

/** Permission เริ่มต้น (ใช้ตอน seed localStorage) */
export const DEFAULT_DEVICE_PERMISSIONS: Record<string, Permission> = {
  ac: 'ASK',
  tv: 'AUTO',
  lights: 'AUTO',
  fan: 'AUTO',
  washing_machine: 'ASK',
  refrigerator: 'NEVER',
  wifi_router: 'NEVER',
}

// ============================================================
// Energy Readings — ข้อมูลย้อนหลัง 24 ชั่วโมง
// ============================================================

/**
 * สร้าง readings 24 ชั่วโมงล่าสุด (ค่าจำลองตาม pattern ของบ้านจริง)
 * Pattern: กลางคืนต่ำ, เช้าสูงขึ้น, บ่ายสูง, เย็น-ค่ำสูงสุด
 */
function generateHourlyReadings(): EnergyReading[] {
  const readings: EnergyReading[] = []
  const now = new Date()
  const profileW = [
    180, 160, 150, 140, 150, 200,   // 00:00–05:00 (กลางคืน ต่ำ)
    350, 520, 680, 720, 700, 680,   // 06:00–11:00 (เช้า)
    750, 780, 820, 800, 760, 720,   // 12:00–17:00 (บ่าย)
    980, 1450, 1620, 1480, 1200, 900, // 18:00–23:00 (เย็น-ค่ำ สูงสุด)
  ]

  for (let i = 23; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3600 * 1000)
    const powerW = profileW[ts.getHours()]
    readings.push({
      timestamp: ts.toISOString(),
      powerW,
      energyKwh: +(powerW / 1000).toFixed(3),   // ต่อชั่วโมง
      voltage: 220 + Math.round((Math.random() - 0.5) * 4),
      current: +(powerW / 220).toFixed(2),
    })
  }
  return readings
}

export const MOCK_READINGS: EnergyReading[] = generateHourlyReadings()

/** Reading ปัจจุบัน (จุดสุดท้าย) */
export const MOCK_CURRENT_READING: EnergyReading =
  MOCK_READINGS[MOCK_READINGS.length - 1]

/** ค่า Aggregate Power ปัจจุบัน (วัตต์) — ใช้กับ NILM */
export const MOCK_AGGREGATE_POWER_W = 1886

// ============================================================
// Device Breakdown — สำหรับ Donut Chart
// ============================================================

export interface DeviceBreakdown {
  deviceId: string
  deviceName: string
  energyKwh: number
  percentage: number
}

export const MOCK_DEVICE_BREAKDOWN_DAILY: DeviceBreakdown[] = [
  { deviceId: 'ac',              deviceName: 'Air Conditioner', energyKwh: 5.6, percentage: 0 },
  { deviceId: 'tv',              deviceName: 'TV',              energyKwh: 0.9, percentage: 0 },
  { deviceId: 'lights',          deviceName: 'Lights',          energyKwh: 0.4, percentage: 0 },
  { deviceId: 'fan',             deviceName: 'Fan',             energyKwh: 0.3, percentage: 0 },
  { deviceId: 'washing_machine', deviceName: 'Washing Machine', energyKwh: 0.5, percentage: 0 },
  { deviceId: 'refrigerator',    deviceName: 'Refrigerator',    energyKwh: 1.8, percentage: 0 },
  { deviceId: 'wifi_router',     deviceName: 'Wi-Fi Router',    energyKwh: 0.3, percentage: 0 },
  { deviceId: 'other',           deviceName: 'Other',           energyKwh: 0.7, percentage: 0 },
]

// ============================================================
// Usage Patterns — รายชั่วโมงต่ออุปกรณ์ (24 ค่า)
// ============================================================

export interface UsagePattern {
  deviceId: string
  hourly: number[]     // 24 ค่า (W ต่อชั่วโมง ตั้งแต่ 00:00)
  peakWindow: string   // เช่น '18:00–23:00'
  averageHoursPerDay: number
}

/** Pattern ของแต่ละอุปกรณ์ (ค่าจำลอง) */
export const MOCK_USAGE_PATTERNS: Record<string, UsagePattern> = {
  ac: {
    deviceId: 'ac',
    hourly: [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      1200, 1200, 1200, 1200, 1200, 0,
    ],
    peakWindow: '18:00–23:00',
    averageHoursPerDay: 4.2,
  },
  tv: {
    deviceId: 'tv',
    hourly: [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 130,
      130, 130, 130, 130, 0, 0,
    ],
    peakWindow: '17:00–22:00',
    averageHoursPerDay: 5.0,
  },
  lights: {
    deviceId: 'lights',
    hourly: [
      0, 0, 0, 0, 0, 20,
      40, 30, 20, 10, 10, 10,
      10, 10, 10, 10, 20, 60,
      85, 85, 85, 85, 60, 20,
    ],
    peakWindow: '18:00–22:00',
    averageHoursPerDay: 6.5,
  },
  fan: {
    deviceId: 'fan',
    hourly: [
      0, 0, 0, 0, 0, 0,
      30, 50, 65, 65, 65, 65,
      65, 65, 65, 65, 50, 50,
      65, 65, 65, 65, 50, 0,
    ],
    peakWindow: '08:00–22:00',
    averageHoursPerDay: 9.0,
  },
  washing_machine: {
    deviceId: 'washing_machine',
    hourly: [
      0, 0, 0, 0, 0, 0,
      0, 0, 500, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    peakWindow: '08:00–09:00',
    averageHoursPerDay: 1.0,
  },
  refrigerator: {
    deviceId: 'refrigerator',
    hourly: Array(24).fill(150),
    peakWindow: 'ตลอดวัน',
    averageHoursPerDay: 24,
  },
  wifi_router: {
    deviceId: 'wifi_router',
    hourly: Array(24).fill(12),
    peakWindow: 'ตลอดวัน',
    averageHoursPerDay: 24,
  },
}

// ============================================================
// NILM — ผลการแยกอุปกรณ์ (Prototype Simulation)
// ⚠️ ค่าทั้งหมดมาจากการจำลอง ไม่ใช่ ML จริง
// ============================================================

export const MOCK_NILM_RESULT = {
  aggregatePowerW: 1886,
  devices: [
    { deviceId: 'ac',     deviceName: 'Air Conditioner', estimatedPowerW: 1200, confidence: 0.82 },
    { deviceId: 'tv',     deviceName: 'TV',              estimatedPowerW: 130,  confidence: 0.91 },
    { deviceId: 'lights', deviceName: 'Lights',          estimatedPowerW: 85,   confidence: 0.95 },
    { deviceId: 'fan',    deviceName: 'Fan',             estimatedPowerW: 65,   confidence: 0.93 },
  ],
  otherPowerW: 406,
}

// ============================================================
// Baseline Profile — ค่ากำลังไฟเฉลี่ยต่อชั่วโมง (ใช้คำนวณ baseline)
// ============================================================

/** ค่าเฉลี่ยกำลังไฟต่อชั่วโมงของวัน (วัตต์) — ใช้สำหรับ baseline */
export const MOCK_HOURLY_AVERAGE_W: number[] = [
  180, 160, 150, 140, 150, 200,
  350, 520, 680, 720, 700, 680,
  750, 780, 820, 800, 760, 720,
  980, 1450, 1620, 1480, 1200, 900,
]

// ============================================================
// Helpers
// ============================================================

/** ดึง device จาก id */
export function getDeviceById(id: string): Device | undefined {
  return MOCK_DEVICES.find((d) => d.id === id)
}

/** อัตราค่าไฟเริ่มต้น (บาท/kWh) — ตรงกับ DEFAULT_SETTINGS */
export const DEFAULT_ELECTRICITY_RATE = 4.20
