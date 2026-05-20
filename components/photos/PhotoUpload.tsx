'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import Image from 'next/image'

interface PhotoUploadProps {
  programId: string
  userId: string
  onSuccess: () => void
}

const WEEK_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Week ${i + 1}`,
}))

export function PhotoUpload({ programId, userId, onSuccess }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [week, setWeek] = useState('1')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setError('')
    setFile(selected)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(selected)
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleUpload() {
    if (!file) {
      setError('Please select a photo to upload.')
      return
    }
    setUploading(true)
    setError('')

    try {
      const supabase = createSupabaseClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}.${ext}`
      const storagePath = `${userId}/${week}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(storagePath, file, { contentType: file.type, upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(storagePath)

      const { error: insertError } = await supabase.from('progress_photos').insert({
        user_id: userId,
        program_id: programId,
        week_number: parseInt(week, 10),
        photo_url: publicUrl,
        notes: notes.trim() || null,
        taken_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-input"
        />
        {preview ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface max-w-sm mx-auto">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="photo-input"
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-10 cursor-pointer hover:border-muted transition-colors bg-surface"
          >
            <ImageIcon size={36} className="text-muted mb-3" />
            <p className="text-sm font-medium text-text">Tap to select a photo</p>
            <p className="text-xs text-muted mt-1">JPG, PNG, HEIC supported</p>
          </label>
        )}
      </div>

      <Select
        label="Which week is this photo for?"
        value={week}
        onChange={(e) => setWeek(e.target.value)}
        options={WEEK_OPTIONS}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted font-medium">Notes (optional)</label>
        <textarea
          className="bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="e.g. Front pose, morning lighting..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        fullWidth
        className="flex items-center justify-center gap-2"
      >
        <Upload size={18} />
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </Button>
    </div>
  )
}
