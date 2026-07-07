const HEALTH_CLASS = {
  ON_TRACK: 'badge-on-track',
  AT_RISK: 'badge-at-risk',
  DELAYED: 'badge-delayed',
}

const HEALTH_LABELS = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  DELAYED: 'Delayed',
}

export default function HealthBadge({ health }) {
  const cls = HEALTH_CLASS[health] || 'badge-on-track'
  const label = HEALTH_LABELS[health] || health
  return <span className={`badge ${cls}`}>{label}</span>
}