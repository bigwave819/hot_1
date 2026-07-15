'use client'

import { useTransition, useState } from 'react'
import { useRouter }               from 'next/navigation'
import { updateBooking }           from '@/actions/bookings'
import { Loader2, Check }          from 'lucide-react'

// Valid status transitions
const TRANSITIONS: Record<string, {
  value:  string
  label:  string
  cls:    string
}[]> = {
  PENDING: [
    {
      value: 'CONFIRMED',
      label: 'Confirm Booking',
      cls:   'bg-teal text-white hover:bg-teal-light',
    },
    {
      value: 'CANCELLED',
      label: 'Cancel Booking',
      cls:   'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    },
    {
      value: 'NO_SHOW',
      label: 'Mark No Show',
      cls:   'bg-[--surface-2] text-[--muted] hover:bg-[--surface-2]',
    },
  ],
  CONFIRMED: [
    {
      value: 'CHECKED_IN',
      label: 'Check In Guest',
      cls:   'bg-emerald-500 text-white hover:bg-emerald-600',
    },
    {
      value: 'CANCELLED',
      label: 'Cancel Booking',
      cls:   'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    },
    {
      value: 'NO_SHOW',
      label: 'Mark No Show',
      cls:   'bg-[--surface-2] text-[--muted] hover:bg-[--surface-2]',
    },
  ],
  CHECKED_IN: [
    {
      value: 'CHECKED_OUT',
      label: 'Check Out Guest',
      cls:   'bg-teal text-white hover:bg-teal-light',
    },
  ],
  CHECKED_OUT: [],
  CANCELLED:   [],
  NO_SHOW:     [],
}

interface Props {
  bookingId:     string
  currentStatus: string
}

export function StatusUpdater({ bookingId, currentStatus }: Props) {
  const router           = useRouter()
  const [pending, start] = useTransition()
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const actions = TRANSITIONS[currentStatus] ?? []

  async function handleUpdate(status: string) {
    setError('')
    setSuccess('')
    start(async () => {
      const result = await updateBooking(bookingId, { status: status as any })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSuccess(`Status updated to ${status.replace('_', ' ').toLowerCase()}`)
      router.refresh()
    })
  }

  if (actions.length === 0) {
    return (
      <div className="rounded-xl bg-[--surface] p-5 shadow-sm">
        <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--muted] font-medium mb-3">
          Status Actions
        </p>
        <p className="text-[13px] text-[--muted] font-light">
          No further actions available for this booking.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[--surface] p-5 shadow-sm">
      <p className="text-[10px] tracking-[0.2em] uppercase
                    text-[--muted] font-medium mb-4">
        Status Actions
      </p>

      <div className="flex flex-col gap-2">
        {actions.map(action => (
          <button
            key={action.value}
            onClick={() => handleUpdate(action.value)}
            disabled={pending}
            className={`flex items-center justify-center gap-2
                        rounded-lg px-4 py-3
                        text-[11px] tracking-[0.15em] uppercase font-medium
                        transition-colors duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${action.cls}`}
          >
            {pending
              ? <Loader2 size={13} className="animate-spin" />
              : null
            }
            {action.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-[11px] text-red-400">{error}</p>
      )}

      {success && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-500">
          <Check size={12} />
          {success}
        </div>
      )}
    </div>
  )
}