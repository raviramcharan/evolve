'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Copy, Check } from 'lucide-react'

export default function CoachSettingsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [coachCode, setCoachCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).maybeSingle()
      const { data: coach } = await supabase.from('coaches').select('coach_code, bio').eq('id', user.id).maybeSingle()

      setName(profile?.name ?? '')
      setBio(coach?.bio ?? '')
      setCoachCode(coach?.coach_code ?? '')
      setLoading(false)
    }
    fetchData()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: profileErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: name.trim() || null,
      updated_at: new Date().toISOString(),
    })
    if (profileErr) { setError(profileErr.message); setSaving(false); return }

    const { error: coachErr } = await supabase.from('coaches').update({ bio: bio.trim() || null }).eq('id', user.id)
    if (coachErr) { setError(coachErr.message); setSaving(false); return }

    setSuccess('Settings saved.')
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleCopy() {
    navigator.clipboard.writeText(coachCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div>
        <Header title="Settings" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          {[1, 2].map((i) => <div key={i} className="h-32 bg-surface border border-border rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Coach Settings" />
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Coach code */}
        <div>
          <SectionHeader title="Your Coach Code" subtitle="Share this with clients so they can connect to you." />
          <Card>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl font-bold text-accent tracking-widest">{coachCode}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors border border-border rounded-lg px-3 py-1.5"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </Card>
        </div>

        {/* Profile */}
        <div>
          <SectionHeader title="Profile" />
          <Card>
            <div className="flex flex-col gap-4">
              <Input
                label="Display name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); setSuccess('') }}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted font-medium">Bio (optional)</label>
                <textarea
                  className="bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none text-sm"
                  placeholder="A short bio about your coaching style..."
                  rows={3}
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); setError(''); setSuccess('') }}
                />
              </div>
            </div>

            {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-danger">{error}</p></div>}
            {success && <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-success">{success}</p></div>}

            <Button fullWidth onClick={handleSave} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Card>
        </div>

        {/* Account */}
        <div>
          <SectionHeader title="Account" />
          <Card>
            <Button variant="danger" fullWidth onClick={handleSignOut}>Sign Out</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
