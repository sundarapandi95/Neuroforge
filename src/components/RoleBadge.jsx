const ROLE_CLASS = {
  ORG_ADMIN: 'badge-org-admin',
  PROJECT_MANAGER: 'badge-pm',
  DEVELOPER: 'badge-dev',
  QA_TESTER: 'badge-qa',
  CLIENT: 'badge-client',
}

const ROLE_LABELS = {
  ORG_ADMIN: 'Org Admin',
  PROJECT_MANAGER: 'Project Manager',
  DEVELOPER: 'Developer',
  QA_TESTER: 'QA / Tester',
  CLIENT: 'Client',
}

export function RoleBadge({ role }) {
  const cls = ROLE_CLASS[role] || 'badge-dev'
  const label = ROLE_LABELS[role] || role
  return <span className={`badge ${cls}`}>{label}</span>
}

const INVITE_CLASS = {
  PENDING: 'badge-pending',
  ACCEPTED: 'badge-accepted',
  REVOKED: 'badge-revoked',
  EXPIRED: 'badge-expired',
}

export function InviteStatusBadge({ status }) {
  const cls = INVITE_CLASS[status] || 'badge-expired'
  return <span className={`badge ${cls}`}>{status[0] + status.slice(1).toLowerCase()}</span>
}
