import SeverityBadge from './SeverityBadge.jsx'

export default function BugCard({ bug, onDragStart, onOpen }) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', bug.id)
        onDragStart?.(bug)
      }}
    >
      <div className="task-card-top">
        <span className="mono text-faint" style={{ fontSize: 12 }}>{bug.bugRef}</span>
        <SeverityBadge severity={bug.severity} />
      </div>
      <p className="task-card-title">{bug.title}</p>
      <div className="task-card-footer">
        <span className="text-faint">{bug.assigneeName || 'Unassigned'}</span>
        <button
          className="task-card-view-link"
          onClick={(e) => {
            e.stopPropagation()
            onOpen(bug.id)
          }}
        >
          View →
        </button>
      </div>
    </div>
  )
}