import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import UpgradeModal, { type UpgradeReason } from '../UpgradeModal'
import { useAuth } from '../../lib/auth'
import { loadQuota, type QuotaState } from '../../lib/quota'

/** Fire after anything that uses CVs so the watcher re-checks the monthly allowance. */
export const QUOTA_CHANGED = 'hirebest:quota-changed'
export const notifyQuotaChanged = () => window.dispatchEvent(new Event(QUOTA_CHANGED))

/** Share of the monthly allowance at which we nudge once before the hard stop. */
const NEAR_PCT = 80

const seen = (key: string) => {
  try { return sessionStorage.getItem(key) === '1' } catch { return false }
}
const markSeen = (key: string) => {
  try { sessionStorage.setItem(key, '1') } catch { /* private mode */ }
}

/**
 * Dashboard-wide upgrade prompt. Shows the upgrade popup when the monthly CV
 * allowance runs out and a softer one at 80%, each once per browser session
 * per billing month (re-checked after every batch). The New screening
 * page shows its own popup whenever the user tries to go over, so it is skipped here.
 */
export default function LimitWatcher() {
  const { profile } = useAuth()
  const { pathname } = useLocation()
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [reason, setReason] = useState<UpgradeReason | null>(null)

  const check = useCallback(() => {
    if (profile) loadQuota(profile).then(setQuota)
  }, [profile])

  useEffect(() => { check() }, [check])
  useEffect(() => {
    window.addEventListener(QUOTA_CHANGED, check)
    return () => window.removeEventListener(QUOTA_CHANGED, check)
  }, [check])

  useEffect(() => {
    if (!quota || quota.unlimited || reason || pathname.startsWith('/dashboard/new')) return
    if (profile?.active === false) return
    const period = quota.resetsOn ?? 'current'
    if (quota.remaining === 0) {
      const key = `hirebest.limit-popup.${period}.full`
      if (!seen(key)) { markSeen(key); setReason('quota-exceeded') }
    } else if (quota.pct >= NEAR_PCT) {
      const key = `hirebest.limit-popup.${period}.near`
      if (!seen(key)) { markSeen(key); setReason('quota-near') }
    }
  }, [quota, pathname, reason, profile])

  if (!reason) return null
  return <UpgradeModal reason={reason} quota={quota} onClose={() => setReason(null)} />
}
