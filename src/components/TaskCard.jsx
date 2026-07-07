import PriorityBadge from './PriorityBadge.jsx'

/**
 * A single task card. `draggable` + onDragStart is native HTML5 drag-and-drop.
 * The "View →" link is a separate click target (stopPropagation) so it doesn't
 * fight with the card's drag behavior.
 */
export default function TaskCard({ task, onDragStart, onOpen }) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        onDragStart?.(task)
      }}
    >
      <div className="task-card-top">
        <span className="task-card-points">{task.storyPoints} pt</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="task-card-title">{task.title}</p>
      {task.labels?.length > 0 && (
        <div className="tag-row" style={{ marginTop: 6 }}>
          {task.labels.map((l) => (
            <span key={l} className="tag-pill">{l}</span>
          ))}
        </div>
      )}
      <div className="task-card-footer">
        <span className="text-faint">{task.assigneeName || 'Unassigned'}</span>
        {onOpen && (
          <button
            className="task-card-view-link"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(task.id)
            }}
          >
            View →
          </button>
        )}
      </div>
    </div>
  )
}