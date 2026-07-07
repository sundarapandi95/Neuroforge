export default function EmptyState({ title, description, action }) {
  return (
    <div className="card empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
