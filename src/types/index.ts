/**
 * Types ศูนย์กลางของระบบ Shine — Smart Energy Decision & Control System
 * ทุกหน้าต้อง import จากไฟล์นี้ ห้ามประกาศ type ซ้ำ
 */

// ============================================================
// Enums / Union Types
// ============================================================

/** สิทธิ์การควบคุมอุปกรณ์ */
export type Permission = 'AUTO' | 'ASK' | 'NEVER'

/** สถานะเปิด/ปิดอุปกรณ์ */
export type DeviceStatus = 'ON' | 'OFF'

/** โหมดการทำงานอัตโนมัติ */
export type AutomationMode = 'RECOMMEND' | 'ASSISTED' | 'AUTO'

/** โหมด baseline สำหรับเปรียบเทียบ */
export type BaselineMode =
  | 'CURRENT_BEHAVIOR'
  | 'BALANCED'
  | 'ENERGY_SAVING'
  | 'MAXIMUM_SAVING'

/** ลำดับความสำคัญของผู้ใช้ */
export type Priority = 'COMFORT' | 'BALANCED' | 'ENERGY_SAVING'

/** ประเภทอุปกรณ์ในบ้าน */
export type DeviceType =
  | 'AIR_CONDITIONER'
  | 'TV'
  | 'LIGHTS'
  | 'FAN'
  | 'WASHING_MACHINE'
  | 'REFRIGERATOR'
  | 'WIFI_ROUTER'
  | 'OTHER'

// ============================================================
// Core Data Models
// ============================================================

/** ค่าการใช้พลังงาน 1 จุด (จาก Energy Monitor) */
export interface EnergyReading {
  timestamp: string     // ISO string
  powerW: number        // กำลังไฟ (วัตต์)
  energyKwh: number     // พลังงานสะสม (kWh)
  voltage: number       // แรงดัน (V)
  current: number       // กระแส (A)
}

/** อุปกรณ์ภายในบ้าน */
export interface Device {
  id: string
  name: string
  type: DeviceType
  status: DeviceStatus
  estimatedPowerW: number   // กำลังไฟประมาณการ (วัตต์)
  todayEnergyKwh: number    // พลังงานวันนี้ (kWh)
  permission: Permission
  controllable: boolean
}

/** ผลการคาดการณ์พลังงาน 1 จุด */
export interface Prediction {
  timestamp: string
  predictedPowerW: number
  predictedEnergyKwh: number
  predictedCost: number
}

/** ช่วงเวลาคาดการณ์ */
export type ForecastHorizon = '1h' | '3h' | '6h'

/** ผลลัพธ์การคาดการณ์ */
export interface PredictionResult {
  method: 'simulated-rule-based'   // ระบุชัดว่าเป็น simulation
  horizon: ForecastHorizon
  points: Prediction[]
  summary: {
    predictedEnergyKwh: number
    predictedCost: number
    averagePowerW: number
  }
}

// ============================================================
// Scenario & What-if
// ============================================================

/** Action ใน scenario */
export type ScenarioActionType =
  | 'KEEP_ON'
  | 'TURN_OFF'
  | 'REDUCE_USAGE'
  | 'DELAY'

export interface ScenarioAction {
  deviceId: string
  type: ScenarioActionType
  reducePercent?: number   // ใช้กับ REDUCE_USAGE (เช่น 50 = ลด 50%)
}

/** Scenario ที่ผู้ใช้กำหนด */
export interface Scenario {
  id: string
  name: string
  description: string
  actions: ScenarioAction[]
  predictedEnergyKwh: number
  predictedCost: number
  energySavingKwh: number
  costSaving: number
  comfortLevel: number      // 0-100
  preferenceScore: number   // 0-100
}

/** Comfort impact */
export interface ComfortImpact {
  score: number              // 0-100 (สูง = สบาย)
  level: 'HIGH' | 'MEDIUM' | 'LOW'
}

/** ผลการจำลอง scenario */
export interface ScenarioResult {
  currentEnergyKwh: number
  scenarioEnergyKwh: number
  energySavingKwh: number
  costSaving: number
  comfortImpact: ComfortImpact
  breakdownByDevice: Array<{
    deviceId: string
    deviceName: string
    beforePowerW: number
    afterPowerW: number
    savingKwh: number
  }>
}

// ============================================================
// Baseline
// ============================================================

/** ผลการคำนวณ baseline */
export interface BaselineResult {
  mode: BaselineMode
  energyKwh: number
  cost: number
  label: string
}

/** ผลการเปรียบเทียบ scenario กับ baseline */
export interface ComparisonResult {
  baselineEnergyKwh: number
  baselineCost: number
  scenarioEnergyKwh: number
  scenarioCost: number
  energySavingKwh: number
  costSaving: number
  savingPercentage: number   // %
}

// ============================================================
// Decision Engine
// ============================================================

/** ข้อจำกัดของผู้ใช้ */
export interface Constraints {
  maxDailyUsageKwh: number
  maxDailyCost: number
  minComfortLevel: number
  uncontrollableDeviceIds: string[]   // NEVER
  confirmationDeviceIds: string[]     // ASK
}

/** Input สำหรับ Decision Engine */
export interface DecisionInput {
  monthlyGoal: number       // บาท/เดือน
  priority: Priority
  constraints: Constraints
  baseline: BaselineResult
}

/** แผนการตัดสินใจ */
export interface DecisionPlan {
  id: string
  name: string
  description: string
  actions: ScenarioAction[]
  expectedEnergyKwh: number
  expectedCost: number
  expectedSaving: number
  comfortImpact: ComfortImpact
  preferenceScore: number
  valid: boolean
  rejectReason?: string
}

/** ผลลัพธ์การ generate plans */
export interface DecisionPlanResult {
  method: 'rule-based-simulated'
  plans: DecisionPlan[]
  rejected: DecisionPlan[]
  generatedAt: string
}

/** แผนที่ผู้ใช้เลือกแล้ว (บันทึกใน localStorage) */
export interface SelectedPlan {
  planId: string
  planSnapshot: DecisionPlan
  selectedAt: string
  status: 'selected' | 'executed'
}

// ============================================================
// Control
// ============================================================

/** ผลการตรวจสอบ permission */
export interface PermissionCheckResult {
  allowed: boolean
  requiresConfirmation: boolean
  reason: string
  permission: Permission
}

/** สถานะการควบคุม */
export type ControlStatus =
  | 'IDLE'
  | 'EXECUTED'
  | 'PENDING_CONFIRMATION'
  | 'BLOCKED'

/** วิธีควบคุม */
export type ControlMethod = 'SIMULATED' | 'SMART_PLUG' | 'SMART_SWITCH' | 'DEVICE_API'

/** ประวัติการควบคุม */
export interface ControlHistoryEntry {
  id: string
  deviceId: string
  deviceName: string
  action: ScenarioActionType
  status: ControlStatus
  method: ControlMethod
  reason?: string
  timestamp: string
}

// ============================================================
// Feedback
// ============================================================

/** ผลการเปรียบเทียบ Expected vs Actual */
export interface ActualResult {
  expectedEnergyKwh: number
  actualEnergyKwh: number
  expectedSaving: number
  actualSaving: number
  differenceKwh: number
  predictionErrorPercent: number   // %
}

/** Feedback จากผู้ใช้ */
export interface Feedback {
  decisionId: string
  expectedEnergyKwh: number
  actualEnergyKwh: number
  expectedSaving: number
  actualSaving: number
  rating: number             // 1-5
  accepted: boolean
  comments: string
  createdAt: string
}

// ============================================================
// User Preferences
// ============================================================

/** Preference ของอุปกรณ์แต่ละตัว */
export interface DevicePreference {
  deviceId: string
  score: number         // 0-100
  updatedAt: string
}

/** Event ที่ทำให้ preference เปลี่ยน */
export interface PreferenceEvent {
  deviceId: string
  signal: 'accepted' | 'rejected' | 'overridden'
  weight?: number
}

/** ค่า preferences ทั้งหมดของผู้ใช้ */
export interface UserPreferences {
  monthlyGoal: number
  electricityRate: number    // บาท/kWh
  baselineMode: BaselineMode
  automationMode: AutomationMode
  priority: Priority
  devicePreferences: Record<string, DevicePreference>   // keyed by deviceId
}

// ============================================================
// NILM
// ============================================================

/** ผลการประมาณการแยกอุปกรณ์ (Prototype Simulation) */
export interface NilmResult {
  method: 'simulated'    // ⚠️ ยังไม่ใช่ ML จริง
  aggregatePowerW: number
  devices: Array<{
    deviceId: string
    deviceName: string
    estimatedPowerW: number
    confidence: number   // 0-1
  }>
  otherPowerW: number
  timestamp: string
}

// ============================================================
// Storage
// ============================================================

/** Keys ทั้งหมดที่ใช้ใน localStorage (มี prefix 'shine.') */
export type StorageKey =
  | 'userPreferences'
  | 'userGoal'
  | 'baselineMode'
  | 'devicePermissions'
  | 'selectedPlan'
  | 'feedback'
  | 'controlHistory'
  | 'settings'

/** Settings ที่ผู้ใช้ตั้งค่าได้ */
export interface AppSettings {
  electricityRate: number
  monthlyGoal: number
  baselineMode: BaselineMode
  automationMode: AutomationMode
}

// ============================================================
// UI Helpers
// ============================================================

/** สถานะที่แสดงใน UI (มี text/icon กำกับ ไม่พึ่งสี) */
export type UiStatus =
  | 'on'
  | 'off'
  | 'completed'
  | 'waiting'
  | 'blocked'
  | 'idle'
