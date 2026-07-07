const STATUS_CLASS = {
  OPEN: 'badge-priority-urgent',
  TRIAGED: 'badge-priority-high',
  IN_PROGRESS: 'badge-pending',
  FIXED: 'badge-pm',
  VERIFIED: 'badge-on-track',
  CLOSED: 'badge-dev',
}

export default function BugStatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || 'badge-dev'
  return <span className={`badge ${cls}`}>{status.replaceAll('_', ' ').toLowerCase()}</span>
}