'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate, weekLabel } from '@/lib/formatters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Header } from '@/components/layout/Header'
import { Program, CoachNote } from '@/types'

interface ProfileForm {
  name: string
  reminder_email: string
  date_of_birth: string
  sex: string
  height_cm: string
}

interface ProgramForm {
  goal_weight: string
}

interface CoachInfo {
  name: string | null
  email: string
}

const SEX_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Prefer not to say' },
]

export default function SettingsPage() {
  const router = useRouter()

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '', reminder_email: '', date_of_birth: '', sex: '', height_cm: '',
  })
  const [programForm, setProgramForm] = useState<ProgramForm>({ goal_weight: '' })
  const [program, setProgram] = useState<Program | null>(null)
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingGoal, setSavingGoal] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [newProgram, setNewProgram] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [goalError, setGoalError] = useState('')
  const [goalSuccess, setGoalSuccess] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users')
        .select('name, reminder_email, coach_id, date_of_birth, sex, height_cm')
        .eq('id', user.id)
        .maybeSingle()

      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      setProfileForm({
        name: userData?.name ?? '',
        reminder_email: userData?.reminder_email ?? '',
        date_of_birth: userData?.date_of_birth ?? '',
        sex: userData?.sex ?? '',
        height_cm: userData?.height_cm?.toString() ?? '',
      })

      const prog = programData as Program ?? null
      setProgram(prog)
      setProgramForm({ goal_weight: prog?.goal_weight?.toString() ?? '' })

      if (userData?.coach_id) {
        const { data: coachUser } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userData.coach_id)
          .maybeSingle()

        if (coachUser) setCoachInfo({ name: coachUser.name, email: coachUser.email })

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
    setSavingProfile(true)
    setProfileError('')
    setProfileSuccess('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingProfile(false); return }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: profileForm.name.trim() || null,
      reminder_email: profileForm.reminder_email.trim() || null,
      date_of_birth: profileForm.date_of_birth || null,
      sex: profileForm.sex || null,
      height_cm: profileForm.height_cm ? parseFloat(profileForm.height_cm) : null,
      updated_at: new Date().toISOString(),
    })

    if (error) setProfileError(error.message)
    else setProfileSuccess('Profile saved.')
    setSavingProfile(false)
  }

  async function handleSaveGoal() {
    if (!program || !programForm.goal_weight) return
    setSavingGoal(true)
    setGoalError('')
    setGoalSuccess('')
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('programs')
      .update({ goal_weight: parseFloat(programForm.goal_weight), updated_at: new Date().toISOString() })
      .eq('id', program.id)

    if (error) setGoalError(error.message)
    else {
      setProgram((p) => p ? { ...p, goal_weight: parseFloat(programForm.goal_weight) } : p)
      setGoalSuccess('Goal weight updated.')
    }
    setSavingGoal(false)
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

  const today = new Date().toISOString().split('T')[0]

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

        {/* Personal info */}
        <div>
          <SectionHeader title="My Info" />
          <Card>
            <div className="flex flex-col gap-4">
              <Input
                label="Name"
                type="text"
                placeholder="Your name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Date of birth"
                type="date"
                value={profileForm.date_of_birth}
                max={today}
                onChange={(e) => setProfileForm((p) => ({ ...p, date_of_birth: e.target.value }))}
              />
              <Select
                label="Biological sex"
                value={profileForm.sex}
                onChange={(e) => setProfileForm((p) => ({ ...p, sex: e.target.value }))}
                options={SEX_OPTIONS}
              />
              <Input
                label="Height (cm)"
                type="number"
                placeholder="e.g. 178"
                value={profileForm.height_cm}
                inputMode="numeric"
                min="0"
                onChange={(e) => setProfileForm((p) => ({ ...p, height_cm: e.target.value }))}
              />
              <Input
                label="Reminder email"
                type="email"
                placeholder="you@example.com"
                value={profileForm.reminder_email}
                inputMode="email"
                onChange={(e) => setProfileForm((p) => ({ ...p, reminder_email: e.target.value }))}
              />
            </div>
            {profileError && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-danger">{profileError}</p></div>}
            {profileSuccess && <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-success">{profileSuccess}</p></div>}
            <Button fullWidth onClick={handleSaveProfile} disabled={savingProfile} className="mt-4">
              {savingProfile ? 'Saving...' : 'Save Info'}
            </Button>
          </Card>
        </div>

        {/* Goal weight */}
        {program && (
          <div>
            <SectionHeader title="Goal" />
            <Card>
              <Input
                label="Goal weight (kg)"
                type="number"
                step="0.1"
                placeholder="e.g. 80.0"
                value={programForm.goal_weight}
                inputMode="decimal"
                min="0"
                onChange={(e) => setProgramForm({ goal_weight: e.target.value })}
              />
              {goalError && <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-danger">{goalError}</p></div>}
              {goalSuccess && <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 mt-4"><p className="text-sm text-success">{goalSuccess}</p></div>}
              <Button fullWidth onClick={handleSaveGoal} disabled={savingGoal || !programForm.goal_weight} className="mt-4">
                {savingGoal ? 'Saving...' : 'Update Goal Weight'}
              </Button>
            </Card>
          </div>
        )}

        {/* Coach */}
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

        {/* Active program info */}
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
                  ...(program.calorie_target ? [['Calories', `${program.calorie_target} kcal/day`]] : []),
                  ...(program.protein_target ? [['Protein', `${program.protein_target} g/day`]] : []),
                  ...(program.workout_target ? [['Workouts', `${program.workout_target}x/week`]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm text-text font-medium">{value}</span>
                  </div>
                ))}
              </div>
              {!program.calorie_target && (
                <p className="text-xs text-muted italic mb-3">Your coach hasn't set targets yet.</p>
              )}
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
