/**
 * ฟังก์ชันจัดรูปแบบการแสดงผล (ตัวเลข, วันที่, หน่วย)
 * ใช้ร่วมกันทั้งโปรเจกต์
 */

/** จัดรูปแบบตัวเลขทศนิยม */
export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** จัดรูปแบบพลังงาน kWh */
export function formatEnergy(kwh: number, decimals = 2): string {
  return `${formatNumber(kwh, decimals)} kWh`
}

/** จัดรูปแบบกำลังไฟ W (หรือ kW ถ้ามาก) */
export function formatPower(watts: number): string {
  if (watts >= 1000) {
    return `${formatNumber(watts / 1000, 2)} kW`
  }
  return `${formatNumber(watts, 0)} W`
}

/** จัดรูปแบบเงินบาท */
export function formatCurrency(amount: number, decimals = 2): string {
  return `฿${formatNumber(amount, decimals)}`
}

/** จัดรูปแบบเปอร์เซ็นต์ */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`
}

/** จัดรูปแบบวันที่เวลา (แบบสั้น) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** จัดรูปแบบเวลา HH:mm */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** จัดรูปแบบวันที่ */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** แสดงค่าที่มีเครื่องหมาย +/- */
export function formatSigned(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatNumber(value, decimals)}`
}
