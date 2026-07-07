export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-side">
        <div className="auth-side-brand">
          <div className="auth-side-logo">N</div>
          <span style={{ fontWeight: 600 }}>NeuroForge</span>
        </div>
        <div>
          <p className="auth-side-eyebrow">01 · AUTH &amp; ORGANIZATION</p>
          <h2 className="auth-side-heading">
            One workspace, six roles, everything scoped to the org it belongs to.
          </h2>
          <p className="auth-side-copy">
            Sign in to plan sprints, triage bugs, ship releases, and see delivery
            health across every project your team owns.
          </p>
        </div>
        <p className="auth-side-footer">© {new Date().getFullYear()} NeuroForge</p>
      </div>

      <div className="auth-main">
        <div className="auth-main-inner">
          {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
          <h1 className="auth-title">{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : <div style={{ marginBottom: 24 }} />}
          {children}
        </div>
      </div>
    </div>
  )
}