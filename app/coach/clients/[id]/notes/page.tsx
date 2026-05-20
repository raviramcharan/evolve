'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CoachNote } from '@/types'
import { formatDate, weekLabel } from '@/lib/formatters'
import { Trash2 } from 'lucide-react'

export default function CoachClientNotesPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [notes, setNotes] = useState<CoachNote[]>([])
  const [clientName, setClientName] = useState('')
  const [content, setContent] = useState('')
  const [weekNumber, setWeekNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchNotes() {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: client } = await supabase
      .from('users')
      .select('name')
      .eq('id', clientId)
      .eq('coach_id', user.id)
      .maybeSingle()

    if (!client) { router.push('/coach/clients'); return }
    setClientName(client.name ?? 'Client')

    const { data } = await supabase
      .from('coach_notes')
      .select('*')
      .eq('coach_id', user.id)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    setNotes((data ?? []) as CoachNote[])
    setLoading(false)
  }

  useEffect(() => { fetchNotes() }, [clientId])

  async function handleAddNote() {
    if (!content.trim()) { setError('Note content is required.'); return }
    setSaving(true)
    setError('')
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('coach_notes').insert({
      coach_id: user.id,
      client_id: clientId,
      content: content.trim(),
      week_number: weekNumber ? parseInt(weekNumber, 10) : null,
    })

    if (insertError) { setError(insertError.message); setSaving(false); return }
    setContent('')
    setWeekNumber('')
    await fetchNotes()
    setSaving(false)
  }

  async function handleDelete(noteId: string) {
    const supabase = createSupabaseClient()
    await supabase.from('coach_notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  return (
    <div>
      <Header showBack title={`${clientName} — Notes`} />
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Add note */}
        <Card>
          <p className="text-sm font-semibold text-text mb-3">Add a note</p>
          <div className="flex flex-col gap-3">
            <textarea
              className="bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none text-sm"
              placeholder="Write a note for this client..."
              rows={3}
              value={content}
              onChange={(e) => { setContent(e.target.value); setError('') }}
            />
            <div className="flex items-center gap-3">
              <select
                className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent appearance-none flex-1"
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
              >
                <option value="">No week tag</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                ))}
              </select>
              <Button onClick={handleAddNote} disabled={saving} className="shrink-0">
                {saving ? 'Saving...' : 'Add Note'}
              </Button>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        </Card>

        {/* Notes list */}
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-surface border border-border rounded-2xl" />)}
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <p className="text-sm text-muted text-center py-4">No notes yet. Add your first note above.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {note.week_number && (
                      <p className="text-xs text-accent font-medium mb-1">{weekLabel(note.week_number)}</p>
                    )}
                    <p className="text-sm text-text whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted mt-2">{formatDate(note.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-muted hover:text-danger transition-colors shrink-0 p-1"
                    aria-label="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
