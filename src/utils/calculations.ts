/**
 * ฟังก์ชันคำนวณพลังงานและค่าใช้จ่าย
 * ใช้ร่วมกันทั้งระบบ — ห้ามเขียนสูตรซ้ำใน component
 */

/** แปลงวัตต์เป็นกิโลวัตต์ */
export function wattsToKw(watts: number): number {
  return watts / 1000
}

/** คำนวณพลังงาน (kWh) = กำลังไฟ (kW) × เวลา (ชั่วโมง) */
export function calculateEnergyKwh(powerW: number, hours: number): number {
  return wattsToKw(powerW) * hours
}

/** คำนวณค่าไฟ (บาท) = พลังงาน (kWh) × อัตราค่าไฟ (บาท/kWh) */
export function calculateCost(energyKwh: number, rate: number): number {
  return energyKwh * rate
}

/** คำนวณพลังงานที่ประหยัดได้ (kWh) */
export function calculateEnergySaving(
  baselineKwh: number,
  scenarioKwh: number
): number {
  return Math.max(0, baselineKwh - scenarioKwh)
}

/** คำนวณค่าไฟที่ประหยัดได้ (บาท) */
export function calculateCostSaving(
  baselineCost: number,
  scenarioCost: number
): number {
  return Math.max(0, baselineCost - scenarioCost)
}

/** คำนวณเปอร์เซ็นต์การประหยัด */
export function calculateSavingPercent(
  baselineValue: number,
  savingValue: number
): number {
  if (baselineValue <= 0) return 0
  return (savingValue / baselineValue) * 100
}

/** จำกัดค่าให้อยู่ในช่วง [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** ปัดทศนิยมแบบปลอดภัย (กัน floating point เพี้ยน) */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Hash string → number (deterministic)
 * ใช้สร้าง jitter ที่ reproducible จาก id (ไม่สุ่มใหม่ทุก refresh)
 */
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}
