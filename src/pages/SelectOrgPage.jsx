import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

export default function SelectOrgPage() {
  const [orgs, setOrgs] = useState([])
  const [error, setError] = useState('')
  const [submittingId, setSubmittingId] = useState(null)
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem('neuroforge_org_options')
    const preAuth = sessionStorage.getItem('neuroforge_preauth_token')
    if (!stored || !preAuth) {
      navigate('/login')
      return
    }
    setOrgs(JSON.parse(stored))
  }, [navigate])

  async function choose(orgId) {
    setError('')
    setSubmittingId(orgId)
    try {
      const preAuthToken = sessionStorage.getItem('neuroforge_preauth_token')
      const res = await api.post('/api/auth/select-org', { preAuthToken, orgId })
      sessionStorage.removeItem('neuroforge_preauth_token')
      sessionStorage.removeItem('neuroforge_org_options')
      setToken(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmittingId(null)
    }
  }

  return (
    <AuthLayout eyebrow="ONE MORE STEP" title="Choose a workspace" subtitle="You belong to more than one organization">
      <div>
        {orgs.map((org) => (
          <button
            key={org.orgId}
            onClick={() => choose(org.orgId)}
            disabled={submittingId !== null}
            className="org-option"
          >
            <span className="org-option-name">{org.orgName}</span>
            <RoleBadge role={org.role} />
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error">{error}</p>}
    </AuthLayout>
  )
}
