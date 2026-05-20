'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { PhotoUpload } from '@/components/photos/PhotoUpload'
import { Header } from '@/components/layout/Header'

export default function PhotoUploadPage() {
  const router = useRouter()
  const [programId, setProgramId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: program } = await supabase
        .from('programs')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (!program) {
        setError('No active program found.')
        setLoading(false)
        return
      }

      setProgramId(program.id)
      setUserId(user.id)
      setLoading(false)
    }
    fetchData()
  }, [router])

  function handleSuccess() {
    router.push('/photos')
  }

  if (loading) {
    return (
      <div>
        <Header showBack title="Upload Photo" />
        <div className="px-4 py-5 animate-pulse flex flex-col gap-4">
          <div className="aspect-square bg-surface border border-border rounded-2xl max-w-sm mx-auto w-full" />
        </div>
      </div>
    )
  }

  if (error || !programId || !userId) {
    return (
      <div>
        <Header showBack title="Upload Photo" />
        <div className="px-4 py-5">
          <p className="text-danger text-sm">{error || 'Unable to load upload form.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header showBack title="Upload Photo" />
      <div className="px-4 py-5">
        <PhotoUpload
          programId={programId}
          userId={userId}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}
