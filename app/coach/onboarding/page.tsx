'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { generateCoachCode } from '@/lib/coach-code'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function CoachOnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!name.trim()) { setError('Please enter your name.'); return }
    setLoading(true)
    setError('')

    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const code = generateCoachCode(name)

    const { error: profileErr } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      name: name.trim(),
      role: 'coach',
      updated_at: new Date().toISOString(),
    })
    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    const { error: coachErr } = await supabase.from('coaches').upsert({ id: user.id, coach_code: code })
    if (coachErr) { setError(coachErr.message); setLoading(false); return }

    router.push('/coach/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-accent mb-2">Evolve</h1>
          <p className="font-display text-2xl font-semibold text-text mb-2">One last thing</p>
          <p className="text-muted text-sm">What should your clients call you?</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <Input
            label="Your name"
            type="text"
            placeholder="e.g. Sam"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />

          <Button fullWidth onClick={handleSubmit} disabled={loading} className="mt-5">
            {loading ? 'Setting up your account...' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  )
}
