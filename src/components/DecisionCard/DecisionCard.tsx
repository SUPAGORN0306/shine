/**
 * DecisionCard — การ์ดแผน (ยังไม่เลือก — ผู้ใช้ต้องกด Choose Plan เอง)
 */

import type { DecisionPlan } from '../../types'
import { formatEnergy, formatCurrency, formatNumber } from '../../utils/formatting'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface DecisionCardProps {
  plan: DecisionPlan
  onChoose: (plan: DecisionPlan) => void
  disabled?: boolean
}

export default function DecisionCard({ plan, onChoose, disabled }: DecisionCardProps) {
  const comfortVariant =
    plan.comfortImpact.level === 'HIGH' ? 'success' : plan.comfortImpact.level === 'MEDIUM' ? 'warning' : 'danger'

  return (
    <Card className="decision-card" padding="md">
      <header className="decision-card__head">
        <div>
          <h3 className="decision-card__name">{plan.name}</h3>
          <p className="decision-card__desc">{plan.description}</p>
        </div>
        <Badge variant="primary" size="sm">
          Score {formatNumber(plan.preferenceScore, 0)}
        </Badge>
      </header>

      <dl className="decision-card__stats">
        <div>
          <dt>Expected Energy</dt>
          <dd>{formatEnergy(plan.expectedEnergyKwh)}</dd>
        </div>
        <div>
          <dt>Expected Cost</dt>
          <dd>{formatCurrency(plan.expectedCost)}</dd>
        </div>
        <div>
          <dt>Expected Saving</dt>
          <dd className="decision-card__saving">{formatEnergy(plan.expectedSaving)}</dd>
        </div>
        <div>
          <dt>Comfort Impact</dt>
          <dd>
            <Badge variant={comfortVariant} size="sm">
              {plan.comfortImpact.level} ({formatNumber(plan.comfortImpact.score, 0)})
            </Badge>
          </dd>
        </div>
      </dl>

      <div className="decision-card__actions">
        <Button
          variant="primary"
          onClick={() => onChoose(plan)}
          disabled={disabled}
        >
          Choose Plan
        </Button>
      </div>
    </Card>
  )
}
