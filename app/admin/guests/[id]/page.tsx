import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserById } from '@/actions/users'
import {
  ArrowLeft, Mail, Phone, Globe,
  CalendarDays, BedDouble, Clock,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Guest Detail' }

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gold/15 text-gold',
  CONFIRMED: 'bg-teal/15 text-teal',
  CANCELLED: 'bg-red-500/15 text-red-400',
  CHECKED_IN: 'bg-emerald-500/15 text-emerald-400',
  CHECKED_OUT: 'bg-[--surface-2] text-[--text-muted]',
  NO_SHOW: 'bg-red-500/15 text-red-400',
}

// Helper: initials from a single name string
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getUserById(id)

  if (!result.success) notFound()

  const guest = result.data
  const bookingsList = guest.bookings ?? []
  const totalNights = bookingsList.reduce((acc, b) => acc + (b.totalNights ?? 0), 0)

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Back + header */}
      <div>
        <Link href="/admin/guests"
          className="mb-4 inline-flex items-center gap-2 text-sm
                         text-[--text-muted] hover:text-[--text-color] transition-colors">
          <ArrowLeft size={14} />
          Back to Guests
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center
                            rounded-full bg-teal/15 text-teal text-lg font-medium">
              {initials(guest.name)}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-0.5">
                Guest Profile
              </p>
              <h1 className="font-display text-[28px] font-light
                             text-[--text-color] leading-none">
                {guest.name}
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <StatPill label="Total Stays" value={bookingsList.length} />
            <StatPill label="Total Nights" value={totalNights} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-[--border-color] bg-[--surface] p-5">
        <h2 className="mb-4 text-[10px] tracking-[0.2em] uppercase
                       text-[--text-muted] font-medium">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoRow icon={Mail} label="Email" value={guest.email} />
          <InfoRow icon={Phone} label="Phone" value={guest.phone ?? '—'} />
          <InfoRow icon={Globe} label="Nationality" value={guest.nationality ?? '—'} />
        </div>
      </div>

      {/* Booking history */}
      <div className="rounded-xl border border-[--border-color] bg-[--surface] overflow-hidden">
        <div className="border-b border-[--border-color] px-5 py-4">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[--text-muted] font-medium">
            Booking History
          </h2>
        </div>

        {bookingsList.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[--text-muted]">No bookings yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[--border-color]">
            {bookingsList.map(booking => (
              <div key={booking.id}
                className="flex flex-col gap-3 px-5 py-4
                              sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center
                                  justify-center rounded-md bg-[--surface-2]">
                    <BedDouble size={15} className="text-[--text-muted]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[--text-color]">
                      {booking.room?.name ?? 'Room'}
                    </p>
                    <p className="flex items-center gap-1.5 text-[12px]
                                  text-[--text-muted] mt-0.5">
                      <CalendarDays size={11} />
                      {new Date(booking.checkIn).toLocaleDateString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                      {' — '}
                      {new Date(booking.checkOut).toLocaleDateString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-[--text-muted]">
                    <Clock size={11} />
                    {booking.totalNights}n
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-1
                                    text-[10px] tracking-wide uppercase font-medium
                                    ${STATUS_STYLES[booking.status] ?? ''}`}>
                    {booking.status}
                  </span>
                  <Link href={`/admin/bookings/${booking.id}`}
                    className="text-[11px] text-gold hover:text-gold-light
                                   transition-colors underline-offset-2 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[--border-color]
                    bg-[--surface] px-4 py-2.5 text-center">
      <p className="font-display text-[24px] font-light text-[--text-color]">{value}</p>
      <p className="text-[10px] tracking-widest uppercase text-[--text-muted]">{label}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: {
  icon: typeof Mail; label: string; value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                      rounded-md bg-[--surface-2]">
        <Icon size={13} className="text-[--text-muted]" />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[--text-muted] mb-0.5">
          {label}
        </p>
        <p className="text-sm text-[--text-color] break-all">{value}</p>
      </div>
    </div>
  )
}