'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Suspense } from 'react'

function SignupForm() {
  const searchParams = useSearchParams()
  const invite = searchParams.get('code') ?? ''

  const [coachName, setCoachName] = useState<string | null>(null)
  const [codeValid, setCodeValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!invite) return
    async function lookupCoach() {
      const supabase = createSupabaseClient()
      const { data } = await supabase
        .from('coaches')
        .select('id, users(name)')
        .eq('coach_code', invite.toUpperCase().trim())
        .maybeSingle()

      if (data) {
        const u = Array.isArray(data.users) ? data.users[0] : data.users as { name: string | null } | null
        setCoachName(u?.name ?? 'Your coach')
        setCodeValid(true)
      } else {
        setCodeValid(false)
      }
    }
    lookupCoach()
  }, [invite])

  async function handleGoogle() {
    setLoading(true)
    setError('')
    const supabase = createSupabaseClient()
    const params = new URLSearchParams({ next: 'onboarding' })
    if (invite && codeValid) params.set('invite', invite.toUpperCase().trim())

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?${params.toString()}`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-accent mb-2">Evolve</h1>
          <p className="font-display text-2xl font-semibold text-text mb-2">Create your account</p>
          {invite && codeValid === true && (
            <div className="mt-3 bg-success/10 border border-success/30 rounded-xl px-4 py-2">
              <p className="text-sm text-success">
                Invited by <strong>{coachName}</strong>
              </p>
            </div>
          )}
          {invite && codeValid === false && (
            <div className="mt-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-2">
              <p className="text-sm text-warning">Coach code not found — you can still sign up without one.</p>
            </div>
          )}
          {!invite && (
            <p className="text-muted text-sm mt-1">Sign up to start your 12-week program.</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || (!!invite && codeValid === null)}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-xl px-5 py-3 transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p className="text-xs text-muted text-center mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-accent hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
