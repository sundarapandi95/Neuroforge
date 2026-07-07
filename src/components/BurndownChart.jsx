/**
 * Minimal burndown chart: two lines (ideal vs actual remaining story points)
 * over the sprint's days. `data` is an array of
 * { date: '2026-07-01', idealPoints: 40, remainingPoints: 38 }.
 * No charting library needed - just plain SVG with a bit of scaling math.
 */
export default function BurndownChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-muted">No burndown data yet.</p>
  }

  const width = 600
  const height = 260
  const padding = 40

  const maxPoints = Math.max(...data.map((d) => Math.max(d.idealPoints, d.remainingPoints)), 1)
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1)

  function coords(points) {
    return points
      .map((v, i) => {
        const x = padding + i * stepX
        const y = height - padding - (v / maxPoints) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')
  }

  const idealPoints = coords(data.map((d) => d.idealPoints))
  const actualPoints = coords(data.map((d) => d.remainingPoints))

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sprint burndown chart">
        {/* Y axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--ink-200)" strokeWidth="1" />
        {/* X axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--ink-200)" strokeWidth="1" />

        <polyline points={idealPoints} fill="none" stroke="var(--ink-300)" strokeWidth="2" strokeDasharray="5 5" />
        <polyline points={actualPoints} fill="none" stroke="var(--accent-600)" strokeWidth="2.5" />

        {data.map((d, i) => {
          const x = padding + i * stepX
          const y = height - padding - (d.remainingPoints / maxPoints) * (height - padding * 2)
          return <circle key={d.date} cx={x} cy={y} r="3" fill="var(--accent-600)" />
        })}
      </svg>
      <div className="chart-legend">
        <span><span className="legend-dot" style={{ background: 'var(--accent-600)' }} /> Actual remaining</span>
        <span><span className="legend-dot" style={{ background: 'var(--ink-300)' }} /> Ideal burndown</span>
      </div>
    </div>
  )
}