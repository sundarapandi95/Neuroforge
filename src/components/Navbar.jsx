import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import RoleGuard from './RoleGuard.jsx'
import NotificationBell from './NotificationBell.jsx'
function linkClass({ isActive }) {
  return isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
}

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-links">
          <span className="navbar-brand">NeuroForge</span>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
          <NavLink to="/projects" className={linkClass}>Projects</NavLink>
          <NavLink to="/org/members" className={linkClass}>Members</NavLink>
          <NavLink to="/org/teams" className={linkClass}>Teams</NavLink>
          <RoleGuard allow={['ORG_ADMIN']}>
            <NavLink to="/org/invites" className={linkClass}>Invites</NavLink>
          </RoleGuard>
        </div>
        <div className="navbar-right">
  <NotificationBell />
  {user && (
    <span className="navbar-user">
      {user.fullName} · <strong>{user.role}</strong> · {user.orgName}
    </span>
  )}
  <button onClick={logout} className="btn btn-secondary">Log out</button>
</div>
      </div>
    </nav>
  )
}
