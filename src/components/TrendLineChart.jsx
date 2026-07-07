/**
 * Generic multi-series line chart. `labels` is the shared x-axis (e.g. dates
 * or sprint names). `series` is [{ name, color, values: [...] }], each the
 * same length as `labels`. Same hand-built SVG approach as BurndownChart.
 */
export default function TrendLineChart({ labels, series, height = 240 }) {
  if (!labels || labels.length === 0) return <p className="text-muted">No data yet.</p>

  const width = 600
  const padding = 40
  const maxValue = Math.max(...series.flatMap((s) => s.values), 1)
  const stepX = (width - padding * 2) / Math.max(labels.length - 1, 1)

  function coords(values) {
    return values
      .map((v, i) => {
        const x = padding + i * stepX
        const y = height - padding - (v / maxValue) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--ink-200)" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--ink-200)" strokeWidth="1" />

        {series.map((s) => (
          <polyline key={s.name} points={coords(s.values)} fill="none" stroke={s.color} strokeWidth="2.5" />
        ))}

        {labels.map((label, i) => (
          <text key={label} x={padding + i * stepX} y={height - padding + 18} textAnchor="middle" fontSize="11" fill="var(--ink-500)">
            {label}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.name}><span className="legend-dot" style={{ background: s.color }} /> {s.name}</span>
        ))}
      </div>
    </div>
  )
}