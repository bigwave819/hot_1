'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { addBookingNote }          from '@/actions/bookings'
import { Save, Loader2, Check }    from 'lucide-react'

interface Props {
  bookingId:   string
  currentNote: string
}

export function BookingNotes({ bookingId, currentNote }: Props) {
  const router           = useRouter()
  const [note,  setNote] = useState(currentNote)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()

  async function handleSave() {
    setError('')
    setSaved(false)
    start(async () => {
      const result = await addBookingNote(bookingId, note)
      if (!result.success) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const isDirty = note !== currentNote

  return (
    <div className="rounded-xl bg-[--surface] overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 bg-[--surface-2]">
        <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--muted] font-medium">
          Internal Notes
        </p>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-[12px] text-[--muted] font-light">
          Visible to staff only. Not shared with the guest.
        </p>

        <textarea
          value={note}
          onChange={e => { setNote(e.target.value); setSaved(false) }}
          rows={4}
          placeholder="Add internal notes about this booking…"
          className="w-full resize-none rounded-lg
                     bg-[--bg] border border-[--border-color]
                     px-4 py-3 text-sm text-[--text-color] font-light
                     placeholder:text-[--muted]
                     focus:outline-none focus:ring-2 focus:ring-teal/20
                     transition-colors"
        />

        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px]
                             text-emerald-500">
              <Check size={12} />
              Saved
            </span>
          )}
          {!saved && <span />}

          <button
            onClick={handleSave}
            disabled={pending || !isDirty}
            className="flex items-center gap-2 rounded-lg
                       bg-teal px-4 py-2.5
                       text-[11px] tracking-[0.15em] uppercase
                       font-medium text-white
                       hover:bg-teal-light transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending
              ? <Loader2 size={13} className="animate-spin" />
              : <Save size={13} />
            }
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}