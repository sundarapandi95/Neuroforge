const PRIORITY_CLASS = {
  LOW: 'badge-priority-low',
  MEDIUM: 'badge-priority-medium',
  HIGH: 'badge-priority-high',
  URGENT: 'badge-priority-urgent',
}

export default function PriorityBadge({ priority }) {
  const cls = PRIORITY_CLASS[priority] || 'badge-priority-medium'
  return <span className={`badge ${cls}`}>{priority[0] + priority.slice(1).toLowerCase()}</span>
}