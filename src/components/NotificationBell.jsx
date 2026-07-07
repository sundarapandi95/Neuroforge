import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useNotificationsSocket } from '../hooks/useNotificationsSocket.js'

const CATEGORY_LABEL = {
  ASSIGNMENT: 'Assignment',
  APPROVAL: 'Approval',
  INCIDENT: 'Incident',
  MENTION: 'Mention',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  function loadRecent() {
    api.get('/api/notifications', { params: { limit: 10 } })
      .then((res) => {
        setNotifications(res.data)
        setUnreadCount(res.data.filter((n) => !n.read).length)
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadRecent()
  }, [])

  // Live push: prepend any new notification the moment it arrives.
  useNotificationsSocket((event) => {
    setNotifications((prev) => [event, ...prev].slice(0, 10))
    setUnreadCount((c) => c + 1)
  })

  async function markAllRead() {
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await api.post('/api/notifications/mark-all-read')
    } catch {
      // best-effort - a stale unread count isn't worth surfacing an error for
    }
  }

  return (
    <div className="notif-bell-root">
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown card">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="link-small" onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-faint" style={{ padding: '16px', fontSize: 13 }}>Nothing yet.</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className={`notif-item ${!n.read ? 'notif-item-unread' : ''}`}>
                  <span className={`notif-dot notif-dot-${n.category?.toLowerCase()}`} />
                  <div>
                    <p className="notif-item-text">{n.message}</p>
                    <p className="text-faint" style={{ fontSize: 11, margin: '2px 0 0' }}>
                      {CATEGORY_LABEL[n.category] || n.category} · {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link to="/notifications" className="notif-dropdown-footer" onClick={() => setOpen(false)}>
            View all &amp; preferences →
          </Link>
        </div>
      )}
    </div>
  )
}