import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PhotoGrid } from '@/components/photos/PhotoGrid'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { ProgressPhoto } from '@/types'
import { Upload } from 'lucide-react'

export default async function PhotosPage() {
  const user = await requireAuth()
  const supabase = createServerSupabaseClient()

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!program) redirect('/onboarding')

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .eq('program_id', program.id)
    .order('week_number', { ascending: false })

  const allPhotos: ProgressPhoto[] = photos ?? []

  return (
    <div>
      <Header title="Progress Photos" />
      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted">
            {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}
          </p>
          <Link href="/photos/upload">
            <Button className="flex items-center gap-2 text-sm py-2.5 px-4">
              <Upload size={16} />
              Upload
            </Button>
          </Link>
        </div>
        <PhotoGrid photos={allPhotos} />
      </div>
    </div>
  )
}
