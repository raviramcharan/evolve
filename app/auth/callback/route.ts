import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') // 'coach-onboarding' | 'onboarding' | null
  const invite = searchParams.get('invite') // coach code for client signups

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        // Returning user — route by role, ignore next param
        if (profile) {
          if (profile.role === 'coach') return NextResponse.redirect(`${origin}/coach/dashboard`)
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // New user — follow next param
        if (next === 'coach-onboarding') {
          return NextResponse.redirect(`${origin}/coach/onboarding`)
        }

        if (next === 'onboarding') {
          const dest = invite
            ? `${origin}/onboarding?invite=${invite}`
            : `${origin}/onboarding`
          return NextResponse.redirect(dest)
        }

        // Fallback for new user with no next param
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
