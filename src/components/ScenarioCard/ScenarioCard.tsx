/**
 * ScenarioCard — การ์ด scenario ที่ preset ไว้
 */

import type { Scenario } from '../../types'
import { formatEnergy, formatCurrency, formatNumber } from '../../utils/formatting'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface ScenarioCardProps {
  scenario: Scenario
  active?: boolean
  onApply?: (scenario: Scenario) => void
}

export default function ScenarioCard({ scenario, active, onApply }: ScenarioCardProps) {
  const comfortVariant =
    scenario.comfortLevel >= 75 ? 'success' : scenario.comfortLevel >= 45 ? 'warning' : 'danger'

  return (
    <Card
      className={active ? 'scenario-card scenario-card--active' : 'scenario-card'}
      padding="md"
    >
      <div className="scenario-card__head">
        <h3 className="scenario-card__name">{scenario.name}</h3>
        {active && <Badge variant="primary" size="sm">Active</Badge>}
      </div>
      <p className="scenario-card__desc">{scenario.description}</p>

      <dl className="scenario-card__stats">
        <div>
          <dt>Expected Energy</dt>
          <dd>{formatEnergy(scenario.predictedEnergyKwh)}</dd>
        </div>
        <div>
          <dt>Expected Cost</dt>
          <dd>{formatCurrency(scenario.predictedCost)}</dd>
        </div>
        <div>
          <dt>Saving</dt>
          <dd className="scenario-card__saving">
            {formatEnergy(scenario.energySavingKwh)} · {formatCurrency(scenario.costSaving)}
          </dd>
        </div>
        <div>
          <dt>Comfort</dt>
          <dd>
            <Badge variant={comfortVariant} size="sm">
              {formatNumber(scenario.comfortLevel, 0)}/100
            </Badge>
          </dd>
        </div>
      </dl>

      {onApply && (
        <Button variant="secondary" size="sm" onClick={() => onApply(scenario)}>
          Apply Scenario
        </Button>
      )}
    </Card>
  )
}
