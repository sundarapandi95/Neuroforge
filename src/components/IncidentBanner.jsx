import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

/**
 * Polls for active critical-severity incidents and shows a persistent banner
 * across the whole app while any are unresolved. Sits in AppLayout, above
 * the page content, so it's visible no matter which page you're on.
 */
export default function IncidentBanner() {
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    function load() {
      api.get('/api/incidents/active').then((res) => setIncidents(res.data)).catch(() => {})
    }
    load()
    const interval = setInterval(load, 15000) // check every 15s
    return () => clearInterval(interval)
  }, [])

  if (incidents.length === 0) return null

  return (
    <div className="incident-banner">
      {incidents.map((inc) => (
        <div key={inc.bugId} className="incident-banner-row">
          <span className="incident-banner-dot" />
          <span>
            <strong>Critical incident:</strong> {inc.title}
          </span>
          <Link to={`/bugs/${inc.bugId}`} className="incident-banner-link">View bug →</Link>
        </div>
      ))}
    </div>
  )
}