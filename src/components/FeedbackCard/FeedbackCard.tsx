/**
 * FeedbackCard — แสดง feedback ที่บันทึกไว้
 */

import type { Feedback } from '../../types'
import { formatDateTime, formatNumber } from '../../utils/formatting'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const ratingBadge =
    feedback.rating >= 4 ? 'success' : feedback.rating >= 3 ? 'warning' : 'danger'

  return (
    <Card padding="md" className="feedback-card">
      <header className="feedback-card__head">
        <div>
          <span className="feedback-card__decision">Plan: {feedback.decisionId}</span>
          <span className="feedback-card__date">{formatDateTime(feedback.createdAt)}</span>
        </div>
        <Badge variant={ratingBadge} size="sm">Rating {feedback.rating}/5</Badge>
      </header>

      <dl className="feedback-card__compare">
        <div>
          <dt>Expected Energy</dt>
          <dd>{formatNumber(feedback.expectedEnergyKwh, 2)} kWh</dd>
        </div>
        <div>
          <dt>Actual Energy</dt>
          <dd>{formatNumber(feedback.actualEnergyKwh, 2)} kWh</dd>
        </div>
        <div>
          <dt>Expected Saving</dt>
          <dd>{formatNumber(feedback.expectedSaving, 2)} kWh</dd>
        </div>
        <div>
          <dt>Actual Saving</dt>
          <dd>{formatNumber(feedback.actualSaving, 2)} kWh</dd>
        </div>
      </dl>

      {feedback.comments && (
        <p className="feedback-card__comments">"{feedback.comments}"</p>
      )}
    </Card>
  )
}
