import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckInSummary } from '@/components/check-in/CheckInSummary'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { CheckIn, Program } from '@/types'

interface CheckInDetailPageProps {
  params: { id: string }
}

export default async function CheckInDetailPage({ params }: CheckInDetailPageProps) {
  const user = await requireAuth()
  const supabase = createServerSupabaseClient()

  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!checkIn) notFound()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', checkIn.program_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!program) redirect('/dashboard')

  return (
    <div>
      <Header showBack title={`Week ${checkIn.week_number} Check-in`} />
      <div className="px-4 py-5">
        <div className="flex justify-end mb-4">
          <Link href={`/check-in/${checkIn.id}/edit`}>
            <Button variant="ghost" className="text-sm py-2 px-4">
              Edit
            </Button>
          </Link>
        </div>
        <CheckInSummary checkIn={checkIn as CheckIn} program={program as Program} />
      </div>
    </div>
  )
}
