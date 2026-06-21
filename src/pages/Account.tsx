import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const MAX_BYTES = 3 * 1024 * 1024 // 3 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function Account() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || '—'
  const avatarUrl = profile?.avatar_url ?? null
  const initial = (displayName || user?.email || '?').slice(0, 1).toUpperCase()

  const pickFile = () => fileRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-uploading the same file later
    if (!file || !user) return
    setErr(null)
    if (!ACCEPTED.includes(file.type)) return setErr('Use a JPG, PNG, WEBP, or GIF image.')
    if (file.size > MAX_BYTES) return setErr('Image must be 3 MB or smaller.')

    setBusy(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })
      if (upErr) throw upErr

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = pub.publicUrl

      const { error: updErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      if (updErr) throw updErr

      // Best-effort clean up of any previous avatar files for this user
      if (avatarUrl) {
        const prev = avatarUrl.split('/avatars/')[1]
        if (prev && prev !== path) {
          await supabase.storage.from('avatars').remove([prev]).catch(() => {})
        }
      }

      await refreshProfile()
    } catch (e: any) {
      setErr(e?.message ?? 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const removeAvatar = async () => {
    if (!user || !avatarUrl) return
    setErr(null)
    setBusy(true)
    try {
      const path = avatarUrl.split('/avatars/')[1]
      if (path) await supabase.storage.from('avatars').remove([path]).catch(() => {})
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
    } catch (e: any) {
      setErr(e?.message ?? 'Could not remove image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-5 py-16">
      <span className="chip">Account</span>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight">Your account</h1>

      <div className="card p-6 mt-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--color-primary)] flex items-center justify-center text-2xl font-bold text-[var(--color-fg)] ring-2 ring-[var(--color-border)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/>
              ) : (
                <span>{initial}</span>
              )}
            </div>
            {busy && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-white"/>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[var(--color-fg)] truncate">{displayName}</div>
            <div className="text-xs text-[var(--color-muted)] truncate">{user?.email ?? '—'}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={pickFile} disabled={busy} className="btn-primary text-xs">
                <Camera size={12}/>{avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
              {avatarUrl && (
                <button onClick={removeAvatar} disabled={busy} className="btn-ghost text-xs">
                  <Trash2 size={12}/>Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-muted)] mt-2">JPG, PNG, WEBP, or GIF · up to 3 MB.</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED.join(',')}
            onChange={onFileChange}
            className="hidden"
          />
        </div>
        {err && <p className="mt-4 text-sm text-red-300">{err}</p>}
      </div>

      <div className="card p-6 mt-5 space-y-3">
        <Row label="Email" value={user?.email ?? '—'} />
        <Row label="Full name" value={displayName} />
        <Row label="Role" value={profile?.role ?? 'user'} />
        <Row label="Signed up" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'} />
      </div>

      <button onClick={signOut} className="btn-ghost mt-6">Sign out</button>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-[var(--color-border)] last:border-0 pb-2 last:pb-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-[var(--color-fg)]">{value}</span>
    </div>
  )
}
