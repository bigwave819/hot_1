import type { Metadata }      from 'next'
import { redirect }           from 'next/navigation'
import Link                   from 'next/link'
import { getSession }         from '@/lib/guard'
import { getUserBookings }    from '@/actions/public/bookings'
import { hotelConfig }        from '@/config/hotel.config'
import {
  CalendarDays, BedDouble,
  Clock, ArrowRight, Plus,
}                             from 'lucide-react'

export const metadata: Metadata = {
  title:  `My Bookings | ${hotelConfig.name}`,
  robots: { index: false, follow: false },
}

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Pending',     cls: 'bg-gold/10 text-gold'              },
  CONFIRMED:   { label: 'Confirmed',   cls: 'bg-teal/10 text-teal'              },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-400/10 text-red-400'        },
  CHECKED_IN:  { label: 'Checked In',  cls: 'bg-emerald-500/10 text-emerald-500'},
  CHECKED_OUT: { label: 'Checked Out', cls: 'bg-[--surface-2] text-[--muted]'  },
  NO_SHOW:     { label: 'No Show',     cls: 'bg-red-400/10 text-red-400'        },
}

// ── Page ──────────────────────────────────────────────────────
export default async function DashboardBookingsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirect=/dashboard/bookings')
  }

  const result = await getUserBookings()

  const userName = session.user.name
  const parts    = userName.trim().split(' ')
  const firstName = parts[0]

  const userInitials = parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()

  const bookingsList = result.success ? result.data : []

  const now = new Date()
  const upcoming  = bookingsList.filter(b =>
    ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.status)
  )
  const past = bookingsList.filter(b =>
    ['CHECKED_OUT', 'CANCELLED', 'NO_SHOW'].includes(b.status)
  )

  return (
    <div className="bg-[--bg] min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-teal pt-32 pb-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center
                            rounded-full bg-white/15 text-white
                            font-display text-[18px] font-light">
              {userInitials}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80">
                Guest Portal
              </p>
              <h1 className="font-display text-[28px] font-light
                             text-white leading-none">
                Welcome, {firstName}
              </h1>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Stat
              label="Total Bookings"
              value={bookingsList.length}
            />
            <Stat
              label="Upcoming"
              value={upcoming.length}
              highlight
            />
            <Stat
              label="Completed Stays"
              value={past.filter(b => b.status === 'CHECKED_OUT').length}
            />
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10 space-y-10">

        {/* No bookings */}
        {bookingsList.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          rounded-2xl bg-[--surface] py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center
                            rounded-full bg-teal/8">
              <BedDouble size={26} className="text-teal" />
            </div>
            <h2 className="font-display text-[28px] font-light
                           text-[--text-color] mb-2">
              No bookings yet.
            </h2>
            <p className="text-[--muted] text-sm font-light mb-8 max-w-xs">
              When you reserve a room at Peponi, your bookings will appear here.
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 rounded-md
                         bg-teal px-6 py-3
                         text-[11px] tracking-[0.2em] uppercase
                         font-medium text-white hover:bg-teal-light
                         transition-colors"
            >
              <Plus size={14} />
              Reserve a Room
            </Link>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <SectionHeader label="Upcoming & Active" count={upcoming.length} />
            <div className="space-y-4">
              {upcoming.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <SectionHeader label="Past Stays" count={past.length} />
            <div className="space-y-4">
              {past.map(booking => (
                <BookingCard key={booking.id} booking={booking} past />
              ))}
            </div>
          </div>
        )}

        {/* Book another */}
        {bookingsList.length > 0 && (
          <div className="rounded-2xl bg-teal p-8 text-center">
            <p className="font-display text-[28px] font-light
                          text-white mb-2">
              Planning another visit?
            </p>
            <p className="text-white/60 text-sm font-light mb-6">
              Return to Peponi and enjoy our exclusive returning guest experience.
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 rounded-md
                         bg-white/15 px-6 py-3
                         text-[11px] tracking-[0.2em] uppercase
                         font-medium text-white hover:bg-white/25
                         transition-colors"
            >
              Browse Rooms
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Booking card ──────────────────────────────────────────────
function BookingCard({
  booking,
  past = false,
}: {
  booking: any
  past?:   boolean
}) {
  const status   = STATUS_CONFIG[booking.status]
  const photo    = booking.room?.photos?.find((p: any) => p.isPrimary)
               ?? booking.room?.photos?.[0]

  const checkIn  = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)

  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className={`group flex flex-col sm:flex-row gap-0 rounded-2xl
                  overflow-hidden shadow-sm hover:shadow-md
                  transition-all duration-300
                  bg-[--surface]
                  ${past ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      {/* Room photo */}
      <div className="relative h-44 sm:h-auto sm:w-52 shrink-0
                      bg-[--surface-2] overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${photo.url}?tr=w-400,h-352,q-80,fo-auto`}
            alt={booking.room?.name}
            className="h-full w-full object-cover
                       transition-transform duration-500
                       group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BedDouble size={24} className="text-[--muted] opacity-30" />
          </div>
        )}
        {/* Status overlay */}
        <div className="absolute top-3 left-3">
          <span className={`rounded-full px-3 py-1 text-[10px]
                            font-medium tracking-wide uppercase
                            backdrop-blur-sm
                            ${status?.cls ?? ''}`}>
            {status?.label ?? booking.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase
                          text-[--muted] mb-0.5">
              Reference: {booking.id.slice(0, 8).toUpperCase()}
            </p>
            <h3 className="font-display text-[22px] font-light
                           text-[--text-color] leading-none">
              {booking.room?.name ?? 'Room'}
            </h3>
          </div>
          <p className="text-gold font-semibold text-[18px] shrink-0">
            ${booking.totalAmount.toFixed(0)}
          </p>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={13} className="text-[--muted]" />
            <span className="text-[13px] text-[--muted]">
              {checkIn.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
              })}
              {' – '}
              {checkOut.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-[--muted]" />
            <span className="text-[13px] text-[--muted]">
              {booking.totalNights} night{booking.totalNights > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Guests */}
        <p className="text-[12px] text-[--muted] flex-1">
          {booking.adults} adult{booking.adults > 1 ? 's' : ''}
          {booking.children > 0
            ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`
            : ''}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3
                        border-t border-[--border-color]">
          <span className="text-[11px] text-[--muted]">
            Booked {new Date(booking.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1 text-[11px]
                           tracking-[0.15em] uppercase font-medium
                           text-[--text-color] group-hover:text-gold
                           transition-colors">
            View Details
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Small helpers ─────────────────────────────────────────────
function Stat({
  label, value, highlight = false,
}: {
  label:      string
  value:      number
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl bg-white/8 px-5 py-3 text-center">
      <p className={`font-display text-[28px] font-light leading-none
                     ${highlight ? 'text-gold' : 'text-white'}`}>
        {String(value).padStart(2, '0')}
      </p>
      <p className="text-[10px] tracking-[0.15em] uppercase
                    text-white/50 mt-1">
        {label}
      </p>
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-[11px] tracking-[0.25em] uppercase
                     font-medium text-[--muted]">
        {label}
      </h2>
      <span className="flex h-5 w-5 items-center justify-center
                       rounded-full bg-gold/15 text-[10px] text-gold font-medium">
        {count}
      </span>
    </div>
  )
}