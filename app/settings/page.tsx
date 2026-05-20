'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Header } from '@/components/layout/Header'
import { Program } from '@/types'

interface UserProfile {
  name: string | null
  reminder_email: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({ name: '', reminder_email: '' })
  const [program, setProgram] = useState<Program | null>(null)
  const [form, setForm] = useState({ name: '', reminder_email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [newProgram, setNewProgram] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users')
        .select('name, reminder_email')
        .eq('id', user.id)
        .maybeSingle()

      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      const p: UserProfile = { name: userData?.name ?? null, reminder_email: userData?.reminder_email ?? null }
      setProfile(p)
      setForm({ name: p.name ?? '', reminder_email: p.reminder_email ?? '' })
      setProgram(programData as Program ?? null)
      setLoading(false)
    }
    fetchData()
  }, [router])

  async function handleSaveProfile() {
    setSaving(true)
    setError('')
    setSuccess('')

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        name: form.name.trim() || null,
        reminder_email: form.reminder_email.trim() || null,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Profile updated successfully.')
      setProfile({ name: form.name.trim() || null, reminder_email: form.reminder_email.trim() || null })
    }
    setSaving(false)
  }

  async function handleNewProgram() {
    setNewProgram(true)
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !program) { setNewProgram(false); return }

    const { error: deactivateError } = await supabase
      .from('programs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', program.id)

    if (deactivateError) {
      setError(deactivateError.message)
      setNewProgram(false)
      return
    }

    router.push('/onboarding')
  }

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div>
        <Header title="Settings" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          <div className="h-40 bg-surface border border-border rounded-2xl" />
          <div className="h-24 bg-surface border border-border rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Settings" />
      <div className="px-4 py-5 flex flex-col gap-6">
        <div>
          <SectionHeader title="Profile" />
          <Card>
            <div className="flex flex-col gap-4">
              <Input
                label="Display name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Reminder email"
                type="email"
                placeholder="you@example.com"
                value={form.reminder_email}
                onChange={(e) => setForm((prev) => ({ ...prev, reminder_email: e.target.value }))}
                inputMode="email"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-success">{success}</p>
              </div>
            )}

            <Button fullWidth onClick={handleSaveProfile} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Card>
        </div>

        {program && (
          <div>
            <SectionHeader title="Active Program" />
            <Card>
              <p className="font-display text-base font-semibold text-text mb-3">{program.title}</p>
              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Start date</span>
                  <span className="text-sm text-text font-medium">{formatDate(program.start_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">End date</span>
                  <span className="text-sm text-text font-medium">{formatDate(program.end_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Start weight</span>
                  <span className="text-sm text-text font-medium">{program.start_weight} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Goal weight</span>
                  <span className="text-sm text-text font-medium">{program.goal_weight} kg</span>
                </div>
              </div>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleNewProgram}
                disabled={newProgram}
              >
                {newProgram ? 'Starting new program...' : 'Start New Program'}
              </Button>
            </Card>
          </div>
        )}

        <div>
          <SectionHeader title="Account" />
          <Card>
            <Button
              variant="danger"
              fullWidth
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
