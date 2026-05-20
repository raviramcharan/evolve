import { createServerSupabaseClient } from '@/lib/supabase-server'
import { MobileNav } from './MobileNav'

export async function NavWrapper() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <MobileNav trainingEnabled={false} nutritionEnabled={false} />
  }

  const { data: program } = await supabase
    .from('programs')
    .select('training_module_enabled, nutrition_module_enabled')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <MobileNav
      trainingEnabled={program?.training_module_enabled !== false}
      nutritionEnabled={program?.nutrition_module_enabled !== false}
    />
  )
}
