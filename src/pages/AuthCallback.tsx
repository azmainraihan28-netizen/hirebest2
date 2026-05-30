import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function AuthCallback() {
  const { loading, user } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (!loading) {
      nav(user ? '/dashboard' : '/login', { replace: true })
    }
  }, [loading, user, nav])

  return (
    <div className="min-h-screen flex items-center justify-center text-[var(--color-muted)]">
      Signing you in…
    </div>
  )
}
