import { useEffect, useState } from 'react'

/**
 * Shows time elapsed since a critical bug was opened, ticking every second
 * while unresolved. Once `resolvedAt` is set, it freezes at the final
 * time-to-resolution instead of continuing to count.
 */
export default function SlaTimer({ startedAt, resolvedAt }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (resolvedAt) return // frozen - no need to tick
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [resolvedAt])

  const end = resolvedAt ? new Date(resolvedAt).getTime() : now
  const elapsedMs = Math.max(end - new Date(startedAt).getTime(), 0)

  const hours = Math.floor(elapsedMs / 3600000)
  const minutes = Math.floor((elapsedMs % 3600000) / 60000)
  const seconds = Math.floor((elapsedMs % 60000) / 1000)

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className={`sla-timer ${resolvedAt ? 'sla-timer-resolved' : 'sla-timer-live'}`}>
      <span className="sla-timer-dot" />
      <span className="mono">{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
      <span className="text-faint" style={{ fontSize: 12 }}>
        {resolvedAt ? 'time to resolution' : 'time since opened'}
      </span>
    </div>
  )
}