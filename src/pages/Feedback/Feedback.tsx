/**
 * Feedback — Expected vs Actual + Form
 * เมื่อ submit → trigger preferenceService.updatePreferences()
 */

import { useState } from 'react'
import { Star, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react'
import type { SelectedPlan } from '../../types'
import { getSelected } from '../../services/decisionService'
import {
  calculateActualResult,
  saveFeedback,
  getFeedbackHistory,
  IMPROVEMENT_OPTIONS,
  FEEDBACK_ANSWERS,
  type FeedbackAnswer,
} from '../../services/feedbackService'
import { getPreferenceInsights } from '../../services/preferenceService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Status from '../../components/ui/Status'
import FeedbackCard from '../../components/FeedbackCard/FeedbackCard'
import EmptyState from '../../components/ui/EmptyState'
import { formatEnergy, formatNumber } from '../../utils/formatting'
import './Feedback.css'

export default function Feedback() {
  const [selected] = useState<SelectedPlan | null>(() => getSelected())
  const [actual] = useState(() => (selected ? calculateActualResult(selected) : null))

  const [answer, setAnswer] = useState<FeedbackAnswer>('YES')
  const [rating, setRating] = useState(4)
  const [improvements, setImprovements] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [history, setHistory] = useState(() => getFeedbackHistory())
  const [insights, setInsights] = useState(() => getPreferenceInsights())

  const toggleImprovement = (opt: string) => {
    setImprovements((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !actual) return

    saveFeedback(
      {
        decisionId: selected.planId,
        answer,
        rating,
        improvements,
        comments,
      },
      selected,
      actual
    )

    setSubmitted(true)
    setHistory(getFeedbackHistory())
    setInsights(getPreferenceInsights())
  }

  return (
    <div className="feedback">
      {/* ---------- Expected vs Actual ---------- */}
      {selected && actual ? (
        <Card
          title="Expected vs Actual Result"
          subtitle={`แผน: ${selected.planSnapshot.name}`}
          actions={<Badge variant="primary" size="sm">Prototype Simulation</Badge>}
        >
          <div className="feedback__compare">
            <div className="feedback__col">
              <h3 className="feedback__col-title">Expected</h3>
              <dl className="feedback__stats">
                <div>
                  <dt>Energy</dt>
                  <dd>{formatEnergy(actual.expectedEnergyKwh)}</dd>
                </div>
                <div>
                  <dt>Saving</dt>
                  <dd>{formatEnergy(actual.expectedSaving)}</dd>
                </div>
              </dl>
            </div>

            <div className="feedback__col">
              <h3 className="feedback__col-title">Actual</h3>
              <dl className="feedback__stats">
                <div>
                  <dt>Energy</dt>
                  <dd>{formatEnergy(actual.actualEnergyKwh)}</dd>
                </div>
                <div>
                  <dt>Saving</dt>
                  <dd>{formatEnergy(actual.actualSaving)}</dd>
                </div>
              </dl>
            </div>

            <div className="feedback__col feedback__col--diff">
              <h3 className="feedback__col-title">Difference</h3>
              <dl className="feedback__stats">
                <div>
                  <dt>Δ Energy</dt>
                  <dd className={actual.differenceKwh >= 0 ? 'feedback__neg' : 'feedback__pos'}>
                    {actual.differenceKwh >= 0 ? '+' : ''}{formatNumber(actual.differenceKwh, 2)} kWh
                  </dd>
                </div>
                <div>
                  <dt>Prediction Error</dt>
                  <dd className={actual.predictionErrorPercent >= 0 ? 'feedback__neg' : 'feedback__pos'}>
                    {actual.predictionErrorPercent >= 0 ? '+' : ''}{formatNumber(actual.predictionErrorPercent, 1)}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Expected vs Actual Result">
          <EmptyState
            icon={<MessageSquare size={32} />}
            title="ยังไม่มีแผนที่เลือก"
            description="ไปที่ Decisions เพื่อเลือกแผนก่อน แล้วกลับมาให้ feedback"
          />
        </Card>
      )}

      {/* ---------- Feedback Form ---------- */}
      {selected && actual && !submitted && (
        <Card title="Your Feedback" subtitle="ช่วยให้ระบบเรียนรู้ความชอบของคุณ">
          <form className="feedback__form" onSubmit={handleSubmit}>
            <fieldset className="feedback__field">
              <legend>Did this recommendation work for you?</legend>
              <div className="feedback__radios" role="radiogroup">
                {FEEDBACK_ANSWERS.map((opt) => (
                  <label key={opt.value} className={`feedback__radio ${answer === opt.value ? 'feedback__radio--active' : ''}`}>
                    <input
                      type="radio"
                      name="answer"
                      value={opt.value}
                      checked={answer === opt.value}
                      onChange={() => setAnswer(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="feedback__field">
              <legend>Rating</legend>
              <div className="feedback__stars" role="radiogroup" aria-label="ให้คะแนน 1-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} ดาว`}
                    className={`feedback__star ${n <= rating ? 'feedback__star--active' : ''}`}
                    onClick={() => setRating(n)}
                  >
                    <Star size={24} fill={n <= rating ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                ))}
                <span className="feedback__rating-text">{rating}/5</span>
              </div>
            </fieldset>

            <fieldset className="feedback__field">
              <legend>What should the system improve?</legend>
              <div className="feedback__checks">
                {IMPROVEMENT_OPTIONS.map((opt) => (
                  <label key={opt} className="feedback__check">
                    <input
                      type="checkbox"
                      checked={improvements.includes(opt)}
                      onChange={() => toggleImprovement(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="feedback__field">
              <label htmlFor="comments">Additional comments</label>
              <textarea
                id="comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="ความคิดเห็นเพิ่มเติม (ไม่บังคับ)"
              />
            </div>

            <div className="feedback__actions">
              <Button variant="primary" type="submit">
                Submit Feedback
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ---------- Submitted ---------- */}
      {submitted && (
        <Card className="feedback__submitted">
          <div className="feedback__submitted-head">
            <Status type="completed" label="Feedback recorded" />
          </div>
          <p className="feedback__submitted-text">
            ขอบคุณ! ระบบได้นำ feedback ไปอัปเดต preference score แล้ว
          </p>
          <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
            ให้ feedback อีกครั้ง
          </Button>
        </Card>
      )}

      {/* ---------- Preference Impact ---------- */}
      {insights.length > 0 && (
        <Card
          title="Preference Impact"
          subtitle="User Preference Learning — Prototype"
          actions={<Badge variant="primary" size="sm">Rule-based</Badge>}
        >
          <ul className="feedback__insights">
            {insights.map((ins) => (
              <li key={ins.deviceId} className="feedback__insight">
                <span className="feedback__insight-name">{ins.deviceName}</span>
                <div className="feedback__insight-bar">
                  <div
                    className={`feedback__insight-fill feedback__insight-fill--${ins.direction}`}
                    style={{ width: `${ins.score}%` }}
                  />
                </div>
                <span className="feedback__insight-score">{ins.score}</span>
                {ins.direction === 'up' && <TrendingUp size={16} className="feedback__pos" aria-hidden="true" />}
                {ins.direction === 'down' && <TrendingDown size={16} className="feedback__neg" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ---------- History ---------- */}
      {history.length > 0 && (
        <section>
          <h2 className="feedback__history-title">Feedback History</h2>
          <div className="feedback__history">
            {history
              .slice()
              .reverse()
              .map((fb, i) => (
                <FeedbackCard key={`${fb.decisionId}-${i}`} feedback={fb} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
