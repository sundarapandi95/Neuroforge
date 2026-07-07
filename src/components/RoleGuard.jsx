import { useAuth } from '../context/AuthContext.jsx'

/**
 * Hides children unless the current user's org role is in `allow`.
 * This is a UI convenience only - the backend re-checks every permission for
 * real, so hiding a button here is not a security boundary by itself.
 */
export default function RoleGuard({ allow, children }) {
  const { user } = useAuth()
  if (!user) return null
  if (!allow.includes(user.role)) return null
  return children
}
