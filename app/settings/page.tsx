'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate, weekLabel } from '@/lib/formatters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Header } from '@/components/layout/Header'
import { Program, CoachNote } from '@/types'

interface UserProfile {
  name: string | null
  reminder_email: string | null
  coach_id: string | null
}

interface CoachInfo {
  name: string | null
  email: string
  coach_code: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({ name: '', reminder_email: '', coach_id: null })
  const [program, setProgram] = useState<Program | null>(null)
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([])
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
        .select('name, reminder_email, coach_id')
        .eq('id', user.id)
        .maybeSingle()

      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      const p: UserProfile = {
        name: userData?.name ?? null,
        reminder_email: userData?.reminder_email ?? null,
        coach_id: userData?.coach_id ?? null,
      }
      setProfile(p)
      setForm({ name: p.name ?? '', reminder_email: p.reminder_email ?? '' })
      setProgram(programData as Program ?? null)

      // Fetch coach info and notes if client has a coach
      if (userData?.coach_id) {
        const { data: coachUser } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userData.coach_id)
          .maybeSingle()

        const { data: coachRecord } = await supabase
          .from('coaches')
          .select('coach_code')
          .eq('id', userData.coach_id)
          .maybeSingle()

        if (coachUser) {
          setCoachInfo({ name: coachUser.name, email: coachUser.email, coach_code: coachRecord?.coach_code ?? '' })
        }

        const { data: notes } = await supabase
          .from('coach_notes')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        setCoachNotes((notes ?? []) as CoachNote[])
      }

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

    const { error: updateError } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: form.name.trim() || null,
      reminder_email: form.reminder_email.trim() || null,
      updated_at: new Date().toISOString(),
    })

    if (updateError) { setError(updateError.message) }
    else { setSuccess('Profile updated.') }
    setSaving(false)
  }

  async function handleNewProgram() {
    setNewProgram(true)
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !program) { setNewProgram(false); return }

    await supabase.from('programs').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', program.id)
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
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-surface border border-border rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Settings" />
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Profile */}
        <div>
          <SectionHeader title="Profile" />
          <Card>
            <div className="flex flex-col gap-4">
              <Input label="Display name" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <Input label="Reminder email" type="email" placeholder="you@example.com" value={form.reminder_email} onChange={(e) => setForm((p) => ({ ...p, reminder_email: e.target.value }))} inputMode="email" />
            </div>
            {error && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-danger">{error}</p></div>}
            {success && <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-success">{success}</p></div>}
            <Button fullWidth onClick={handleSaveProfile} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Card>
        </div>

        {/* Coach info */}
        {coachInfo && (
          <div>
            <SectionHeader title="Your Coach" />
            <Card>
              <p className="font-display font-semibold text-text mb-0.5">{coachInfo.name ?? 'Coach'}</p>
              <p className="text-xs text-muted">{coachInfo.email}</p>
            </Card>
          </div>
        )}

        {/* Coach notes */}
        {coachNotes.length > 0 && (
          <div>
            <SectionHeader title="Coach Notes" />
            <div className="flex flex-col gap-3">
              {coachNotes.map((note) => (
                <Card key={note.id}>
                  {note.week_number && (
                    <p className="text-xs text-accent font-medium mb-1">{weekLabel(note.week_number)}</p>
                  )}
                  <p className="text-sm text-text whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted mt-2">{formatDate(note.created_at)}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active program */}
        {program && (
          <div>
            <SectionHeader title="Active Program" />
            <Card>
              <p className="font-display text-base font-semibold text-text mb-3">{program.title}</p>
              <div className="flex flex-col gap-1.5 mb-4">
                {[
                  ['Start date', formatDate(program.start_date)],
                  ['End date', formatDate(program.end_date)],
                  ['Start weight', `${program.start_weight} kg`],
                  ['Goal weight', `${program.goal_weight} kg`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm text-text font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth onClick={handleNewProgram} disabled={newProgram}>
                {newProgram ? 'Starting new program...' : 'Start New Program'}
              </Button>
            </Card>
          </div>
        )}

        {/* Account */}
        <div>
          <SectionHeader title="Account" />
          <Card>
            <Button variant="danger" fullWidth onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
