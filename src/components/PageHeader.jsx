export default function PageHeader({ eyebrow, title, description, action }) {
  
  const match = eyebrow?.match(/^MODULE\s+(\d+)(.*)$/i)

  return (
    <div className="page-header">
      <div>
        {match ? (
          <div className="module-chip">
            <span className="module-chip-number">{match[1]}</span>
            <span className="module-chip-label">Module{match[2]}</span>
          </div>
        ) : eyebrow ? (
          <p className="auth-eyebrow">{eyebrow}</p>
        ) : null}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  )
}