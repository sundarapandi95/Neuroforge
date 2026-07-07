import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'

export default function OrgMembersPage() {
  const [members, setMembers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/org/members')
      .then((res) => setMembers(res.data))
      .catch(() => setError('Could not load organization members.'))
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 02"
        title="Organization members"
        description="Everyone with access to this workspace, and the role they hold."
      />

      {error && <p className="alert alert-error">{error}</p>}
      {!members && !error && <p className="text-muted">Loading…</p>}

      {members && (
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId}>
                  <td className="cell-strong">{m.fullName}</td>
                  <td className="text-muted">{m.email}</td>
                  <td><RoleBadge role={m.role} /></td>
                  <td className="text-faint">{new Date(m.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
