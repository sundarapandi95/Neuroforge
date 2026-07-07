/**
 * Generic vertical bar chart. `data` is [{ label, value }]. No external
 * charting library - just plain SVG with scaling math, same approach as
 * BurndownChart from Module 5.
 */
export default function BarChart({ data, color = 'var(--accent-600)', height = 220 }) {
  if (!data || data.length === 0) return <p className="text-muted">No data yet.</p>

  const width = Math.max(data.length * 70, 300)
  const padding = 32
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = (width - padding * 2) / data.length - 12

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--ink-200)" strokeWidth="1" />
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * (height - padding * 2 - 20)
        const x = padding + i * ((width - padding * 2) / data.length) + 6
        const y = height - padding - barHeight
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={color} />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="12" fill="var(--ink-700)">{d.value}</text>
            <text x={x + barWidth / 2} y={height - padding + 16} textAnchor="middle" fontSize="11" fill="var(--ink-500)">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}