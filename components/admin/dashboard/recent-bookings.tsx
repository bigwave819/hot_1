import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import type { RecentBooking } from '@/actions/dashboard'

interface Props {
  bookings: RecentBooking[]
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gold/10 text-gold',
  CONFIRMED: 'bg-teal/10 text-teal',
  CANCELLED: 'bg-red-400/10 text-red-400',
  CHECKED_IN: 'bg-emerald-500/10 text-emerald-500',
  CHECKED_OUT: 'bg-[--surface-2] text-[--text-muted]',
  NO_SHOW: 'bg-red-400/10 text-red-400',
}

// Initials from a single name string
function initials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
export function RecentBookingsTable({ bookings }: Props) {
  return (
    <div className="rounded-xl border border-[--border-color]/60
                    bg-[--surface] overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center justify-between
                      border-b border-[--border-color]/60 px-5 py-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase
                        text-[--text-muted] font-medium">
            Recent Inquiries
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="flex items-center gap-1.5 text-[11px] text-gold
                     hover:text-gold-light transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Rows */}
      {bookings.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-[--text-muted]">No bookings yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[--border-color]/40">
          {bookings.map(booking => (
            <Link
              key={booking.id}
              href={`/admin/bookings/${booking.id}`}
              className="flex items-center gap-4 px-5 py-3.5
                         hover:bg-[--bg] transition-colors group"
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center
                              rounded-full bg-teal/10 text-teal
                              text-[11px] font-medium">
                {initials(booking.user.name)}
              </div>

              {/* Guest + room */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[--text-color]">
                  {booking.user.name}
                </p>
                <p className="flex items-center gap-1.5 text-[11px]
                               text-[--text-muted] mt-0.5">
                  <CalendarDays size={10} className="shrink-0" />
                  <span className="truncate">{booking.room.name}</span>
                  <span className="shrink-0">·</span>
                  <span className="shrink-0">{booking.totalNights}n</span>
                </p>
              </div>

              {/* Amount + status */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <p className="text-sm font-medium text-[--text-color]">
                  ${booking.totalAmount.toLocaleString()}
                </p>
                <span className={`inline-flex rounded-full px-2 py-0.5
                                  text-[9px] tracking-wide uppercase font-medium
                                  ${STATUS_STYLES[booking.status] ?? ''}`}>
                  {booking.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}