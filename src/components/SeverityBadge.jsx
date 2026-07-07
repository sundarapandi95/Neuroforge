const SEVERITY_CLASS = {
  LOW: 'badge-dev',
  MEDIUM: 'badge-priority-medium',
  HIGH: 'badge-priority-high',
  CRITICAL: 'badge-priority-urgent',
}

export default function SeverityBadge({ severity }) {
  const cls = SEVERITY_CLASS[severity] || 'badge-dev'
  return <span className={`badge ${cls}`}>{severity[0] + severity.slice(1).toLowerCase()}</span>
}