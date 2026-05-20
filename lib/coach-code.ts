import { SupabaseClient } from '@supabase/supabase-js'

export function generateCoachCode(name: string): string {
  const prefix = name.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X').padEnd(2, 'X')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${random}`
}

export async function validateCoachCode(
  supabase: SupabaseClient,
  code: string
): Promise<{ coachId: string; coachName: string } | null> {
  const { data } = await supabase
    .from('coaches')
    .select('id, users(name)')
    .eq('coach_code', code.toUpperCase().trim())
    .maybeSingle()

  if (!data) return null
  const coachUser = Array.isArray(data.users) ? data.users[0] : data.users as { name: string | null } | null
  return { coachId: data.id, coachName: coachUser?.name ?? 'Your coach' }
}
