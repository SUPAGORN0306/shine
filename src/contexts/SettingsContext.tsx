/**
 * SettingsContext — ศูนย์กลาง settings ทั้งระบบ
 * ทำให้ทุกหน้าใช้ rate/goal/baseline ร่วมกัน และอัปเดตทันทีเมื่อเปลี่ยน
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppSettings,
  AutomationMode,
  BaselineMode,
} from '../types'
import { getSettings, setSettings as persistSettings } from '../services/storageService'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  setRate: (rate: number) => void
  setGoal: (goal: number) => void
  setBaselineMode: (mode: BaselineMode) => void
  setAutomationMode: (mode: AutomationMode) => void
  reset: () => void
}

const DEFAULT: AppSettings = {
  electricityRate: 4.20,
  monthlyGoal: 500,
  baselineMode: 'CURRENT_BEHAVIOR',
  automationMode: 'ASSISTED',
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      return getSettings()
    } catch {
      return DEFAULT
    }
  })

  // sync ข้ามแท็บ (optional)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'shine.settings') {
        setSettingsState(getSettings())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch }
      persistSettings(next)
      return next
    })
  }, [])

  const setRate = useCallback(
    (rate: number) => updateSettings({ electricityRate: rate }),
    [updateSettings]
  )
  const setGoal = useCallback(
    (goal: number) => updateSettings({ monthlyGoal: goal }),
    [updateSettings]
  )
  const setBaselineMode = useCallback(
    (mode: BaselineMode) => updateSettings({ baselineMode: mode }),
    [updateSettings]
  )
  const setAutomationMode = useCallback(
    (mode: AutomationMode) => updateSettings({ automationMode: mode }),
    [updateSettings]
  )

  const reset = useCallback(() => {
    persistSettings(DEFAULT)
    setSettingsState(DEFAULT)
  }, [])

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    setRate,
    setGoal,
    setBaselineMode,
    setAutomationMode,
    reset,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

/** hook สำหรับใช้งาน Settings */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return ctx
}
