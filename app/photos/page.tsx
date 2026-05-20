import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { PhotoGrid } from '@/components/photos/PhotoGrid'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { ProgressPhoto } from '@/types'
import { Upload } from 'lucide-react'

// Handles both old records (full public URL) and new records (bare storage path)
function toStoragePath(photoUrl: string): string {
  const marker = '/object/public/progress-photos/'
  const idx = photoUrl.indexOf(marker)
  return idx !== -1 ? photoUrl.slice(idx + marker.length) : photoUrl
}

export default async function PhotosPage() {
  const user = await requireAuth()
  const supabase = createServerSupabaseClient()
  const admin = createAdminSupabaseClient()

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

  // Admin client bypasses RLS — safe here since we already verified ownership above
  const photosWithUrls = await Promise.all(
    allPhotos.map(async (photo) => {
      const path = toStoragePath(photo.photo_url)
      const { data } = await admin.storage
        .from('progress-photos')
        .createSignedUrl(path, 3600)
      return { ...photo, signed_url: data?.signedUrl ?? null }
    })
  )

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
        <PhotoGrid photos={photosWithUrls} />
      </div>
    </div>
  )
}
