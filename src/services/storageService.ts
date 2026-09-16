/**
 * storageService — ศูนย์กลางจัดการ localStorage ทั้งระบบ
 *
 * กฎเหล็ก:
 * - ห้าม component เรียก localStorage ตรงๆ ให้เรียกผ่าน service นี้เท่านั้น
 * - ทุก key มี prefix 'shine.'
 * - มี default values ครบทุก key
 * - มี fallback in-memory ถ้า localStorage ใช้ไม่ได้ (private mode)
 */

import type {
  StorageKey,
  AppSettings,
  UserPreferences,
  BaselineMode,
  Permission,
  SelectedPlan,
  Feedback,
  ControlHistoryEntry,
} from '../types'

// ============================================================
// Constants
// ============================================================

const PREFIX = 'shine.'

// ============================================================
// In-memory fallback (กรณี localStorage ใช้ไม่ได้)
// ============================================================

const memoryStore = new Map<string, string>()

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__shine_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const canUseLocalStorage = typeof window !== 'undefined' && isLocalStorageAvailable()

function rawGet(key: string): string | null {
  if (canUseLocalStorage) return window.localStorage.getItem(key)
  return memoryStore.get(key) ?? null
}

function rawSet(key: string, value: string): void {
  if (canUseLocalStorage) {
    window.localStorage.setItem(key, value)
  } else {
    memoryStore.set(key, value)
  }
}

function rawRemove(key: string): void {
  if (canUseLocalStorage) {
    window.localStorage.removeItem(key)
  } else {
    memoryStore.delete(key)
  }
}

// ============================================================
// Default Values
// ============================================================

/** Settings เริ่มต้น */
export const DEFAULT_SETTINGS: AppSettings = {
  electricityRate: 4.20,       // บาท/kWh
  monthlyGoal: 500,            // บาท/เดือน
  baselineMode: 'CURRENT_BEHAVIOR',
  automationMode: 'ASSISTED',
}

/** Preferences เริ่มต้น */
export const DEFAULT_PREFERENCES: UserPreferences = {
  monthlyGoal: 500,
  electricityRate: 4.20,
  baselineMode: 'CURRENT_BEHAVIOR',
  automationMode: 'ASSISTED',
  priority: 'BALANCED',
  devicePreferences: {},
}

/** Permission เริ่มต้นของแต่ละอุปกรณ์ (ตาม spec) */
export const DEFAULT_PERMISSIONS: Record<string, Permission> = {
  ac: 'ASK',
  tv: 'AUTO',
  lights: 'AUTO',
  fan: 'AUTO',
  washing_machine: 'ASK',
  refrigerator: 'NEVER',
  wifi_router: 'NEVER',
}

const DEFAULTS: Record<StorageKey, unknown> = {
  userPreferences: DEFAULT_PREFERENCES,
  userGoal: 500,
  baselineMode: 'CURRENT_BEHAVIOR' as BaselineMode,
  devicePermissions: DEFAULT_PERMISSIONS,
  selectedPlan: null,
  feedback: [],
  controlHistory: [],
  settings: DEFAULT_SETTINGS,
}

// ============================================================
// Helper: get / set / remove
// ============================================================

/**
 * อ่านค่าจาก localStorage (พร้อม default)
 * ถ้าไม่มีข้อมูลหรือ parse ไม่ได้ → คืน default
 */
export function getItem<T>(key: StorageKey, defaultValue?: T): T {
  const fullKey = PREFIX + key
  const fallback = (defaultValue ?? DEFAULTS[key]) as T

  try {
    const raw = rawGet(fullKey)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`[storageService] Failed to read "${key}", using default.`, err)
    return fallback
  }
}

/** เขียนค่าลง localStorage */
export function setItem<T>(key: StorageKey, value: T): void {
  const fullKey = PREFIX + key
  try {
    rawSet(fullKey, JSON.stringify(value))
  } catch (err) {
    console.warn(`[storageService] Failed to write "${key}".`, err)
  }
}

/** ลบค่าออกจาก localStorage */
export function removeItem(key: StorageKey): void {
  rawRemove(PREFIX + key)
}

/** ล้างข้อมูลทั้งหมดของ Shine (ใช้ตอน reset) */
export function clearAll(): void {
  const keys: StorageKey[] = [
    'userPreferences',
    'userGoal',
    'baselineMode',
    'devicePermissions',
    'selectedPlan',
    'feedback',
    'controlHistory',
    'settings',
  ]
  keys.forEach((k) => removeItem(k))
}

// ============================================================
// Typed Accessors (ใช้บ่อย — เพื่อความสะดวกและ type-safe)
// ============================================================

export function getSettings(): AppSettings {
  return getItem<AppSettings>('settings')
}

export function setSettings(settings: AppSettings): void {
  setItem('settings', settings)
}

export function getPreferences(): UserPreferences {
  return getItem<UserPreferences>('userPreferences')
}

export function setPreferences(prefs: UserPreferences): void {
  setItem('userPreferences', prefs)
}

export function getPermissions(): Record<string, Permission> {
  return getItem<Record<string, Permission>>('devicePermissions')
}

export function setPermissions(perms: Record<string, Permission>): void {
  setItem('devicePermissions', perms)
}

export function getSelectedPlan(): SelectedPlan | null {
  return getItem<SelectedPlan | null>('selectedPlan', null)
}

export function setSelectedPlan(plan: SelectedPlan | null): void {
  setItem('selectedPlan', plan)
}

export function getFeedback(): Feedback[] {
  return getItem<Feedback[]>('feedback')
}

export function setFeedback(list: Feedback[]): void {
  setItem('feedback', list)
}

export function getControlHistory(): ControlHistoryEntry[] {
  return getItem<ControlHistoryEntry[]>('controlHistory')
}

export function setControlHistory(list: ControlHistoryEntry[]): void {
  setItem('controlHistory', list)
}

export function getBaselineMode(): BaselineMode {
  return getItem<BaselineMode>('baselineMode')
}

export function setBaselineMode(mode: BaselineMode): void {
  setItem('baselineMode', mode)
}
