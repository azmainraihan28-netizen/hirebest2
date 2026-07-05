import { useEffect, useState } from 'react'
import { getMyOrgs, type MyOrg } from '../lib/orgs'
import { useAuth } from '../lib/auth'

const KEY = 'hirebest.currentOrgId'

export function useCurrentOrg() {
  const { user } = useAuth()
  const [orgs, setOrgs] = useState<MyOrg[]>([])
  const [currentOrgId, setCurrentOrgIdState] = useState<string | null>(() => localStorage.getItem(KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    if (!user) {
      setOrgs([]); setLoading(false); return
    }
    setLoading(true)
    getMyOrgs().then(list => {
      if (!alive) return
      setOrgs(list)
      // Clear currentOrgId if it's no longer valid
      if (currentOrgId && !list.some(o => o.org_id === currentOrgId)) {
        setCurrentOrgIdState(null)
        localStorage.removeItem(KEY)
      }
      setLoading(false)
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const setCurrentOrgId = (id: string | null) => {
    setCurrentOrgIdState(id)
    if (id) localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  }

  const currentOrg = orgs.find(o => o.org_id === currentOrgId) ?? null
  return { orgs, currentOrg, currentOrgId, setCurrentOrgId, loading }
}
