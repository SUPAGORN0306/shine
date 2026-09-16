/**
 * feedbackService — Feedback Loop
 * - เปรียบเทียบ Expected vs Actual
 * - บันทึก feedback + rating
 * - trigger preferenceService.updatePreferences()
 */

import type { Feedback, SelectedPlan } from '../types'
import { getFeedback, setFeedback } from './storageService'
import { updatePreferences } from './preferenceService'
import { generateActualResult, type ActualResultSummary } from './controlService'

// ============================================================
// Actual Result Calculation
// ============================================================

/**
 * คำนวณ Actual Result จาก plan ที่ execute
 */
export function calculateActualResult(plan: SelectedPlan): ActualResultSummary {
  return generateActualResult(plan)
}

// ============================================================
// Feedback Form
// ============================================================

export type FeedbackAnswer = 'YES' | 'PARTIALLY' | 'NO'

export interface FeedbackFormData {
  decisionId: string
  answer: FeedbackAnswer
  rating: number              // 1-5
  improvements: string[]      // เช่น ['Reduce interruptions']
  comments: string
}

/**
 * บันทึก feedback + trigger preference update
 */
export function saveFeedback(
  form: FeedbackFormData,
  plan: SelectedPlan,
  actual: ActualResultSummary
): Feedback {
  const feedback: Feedback = {
    decisionId: form.decisionId,
    expectedEnergyKwh: actual.expectedEnergyKwh,
    actualEnergyKwh: actual.actualEnergyKwh,
    expectedSaving: actual.expectedSaving,
    actualSaving: actual.actualSaving,
    rating: form.rating,
    accepted: form.answer !== 'NO',
    comments: form.comments,
    createdAt: new Date().toISOString(),
  }

  const all = getFeedback()
  setFeedback([...all, feedback])

  // อัปเดต preference score ตาม feedback (rule-based)
  const affected = plan.planSnapshot.actions.filter((a) => a.type !== 'KEEP_ON')
  for (const action of affected) {
    if (form.answer === 'YES') {
      updatePreferences({ deviceId: action.deviceId, signal: 'accepted' })
    } else if (form.answer === 'NO') {
      updatePreferences({ deviceId: action.deviceId, signal: 'rejected' })
    } else {
      // Partially: ลดน้ำหนัก
      updatePreferences({ deviceId: action.deviceId, signal: 'accepted', weight: 2 })
    }
  }

  return feedback
}

// ============================================================
// Feedback History
// ============================================================

export function getFeedbackHistory(): Feedback[] {
  return getFeedback()
}

export function getLatestFeedback(): Feedback | null {
  const all = getFeedback()
  return all.length > 0 ? all[all.length - 1] : null
}

export function getFeedbackCount(): number {
  return getFeedback().length
}

// ============================================================
// Improvement Options (สำหรับ UI)
// ============================================================

export const IMPROVEMENT_OPTIONS = [
  'Reduce interruptions',
  'Protect comfort',
  'Save more energy',
  'Avoid controlling certain devices',
  'Other',
] as const

export const FEEDBACK_ANSWERS = [
  { value: 'YES' as const, label: 'Yes' },
  { value: 'PARTIALLY' as const, label: 'Partially' },
  { value: 'NO' as const, label: 'No' },
]
