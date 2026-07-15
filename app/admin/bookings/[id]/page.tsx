import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, CalendarDays, Users,
    Hash, BedDouble, MapPin, Clock,
} from 'lucide-react'
import { getBookingById } from '@/actions/bookings'
import { StatusUpdater } from '@/components/admin/booking/status-updater'
import { BookingNotes } from '@/components/admin/booking/booking-notes'

export const metadata: Metadata = { title: 'Booking Detail' }

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-gold/10 text-gold border-gold/20',
    CONFIRMED: 'bg-teal/10 text-teal border-teal/20',
    CANCELLED: 'bg-red-400/10 text-red-400 border-red-400/20',
    CHECKED_IN: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    CHECKED_OUT: 'bg-[--surface-2] text-[--muted] border-[--border-color]',
    NO_SHOW: 'bg-red-400/10 text-red-400 border-red-400/20',
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    NO_SHOW: 'No Show',
}

function initials(name: string) {
    const p = name.trim().split(' ')
    return p.length === 1
        ? p[0][0].toUpperCase()
        : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

export default async function BookingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const result = await getBookingById(id)

    if (!result.success) notFound()

    const booking = result.data
    const room = booking.room
    const guest = booking.user

    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)

    const primaryPhoto = room.photos?.find((p: any) => p.isPrimary)
        ?? room.photos?.[0]

    return (
        <div className="max-w-5xl space-y-6">

            {/* Back + header */}
            <div>
                <Link
                    href="/admin/bookings"
                    className="mb-5 inline-flex items-center gap-2 text-sm
                     text-[--muted] hover:text-[--text-color] transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to Bookings
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
                            Booking Reference
                        </p>
                        <h1 className="font-display text-[32px] font-light
                           text-[--text-color] leading-none">
                            {booking.id.slice(0, 8).toUpperCase()}
                        </h1>
                    </div>
                    <span className={`self-start rounded-full px-4 py-2
                            text-[11px] font-medium tracking-wide
                            uppercase border
                            ${STATUS_STYLES[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                    </span>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">

                {/* ── Left: main info ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Guest card */}
                    <InfoCard title="Guest Information">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center
                              rounded-full bg-teal/10 text-teal
                              font-display text-[20px] font-light">
                                {initials(guest.name)}
                            </div>
                            <div>
                                <p className="font-medium text-[--text-color] text-base">
                                    {guest.name}
                                </p>
                                <p className="text-[13px] text-[--muted]">{guest.email}</p>
                                {(guest as any).phone && (
                                    <p className="text-[13px] text-[--muted]">
                                        {(guest as any).phone}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Detail
                                icon={Hash}
                                label="Guest ID"
                                value={guest.id.slice(0, 8).toUpperCase()}
                            />
                            {(guest as any).nationality && (
                                <Detail
                                    icon={MapPin}
                                    label="Nationality"
                                    value={(guest as any).nationality}
                                />
                            )}
                            <Detail
                                icon={Users}
                                label="Role"
                                value="Guest"
                            />
                            <Detail
                                icon={Clock}
                                label="Member Since"
                                value={new Date((guest as any).createdAt).toLocaleDateString('en-US', {
                                    month: 'short', year: 'numeric'
                                })}
                            />
                        </div>
                    </InfoCard>

                    {/* Room card */}
                    <InfoCard title="Room">
                        <div className="flex gap-4">
                            {/* Thumb */}
                            <div className="h-20 w-28 shrink-0 overflow-hidden
                              rounded-lg bg-[--surface-2]">
                                {primaryPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`${(primaryPhoto as any).url}?tr=w-224,h-160,q-80,fo-auto`}
                                        alt={room.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <BedDouble size={18} className="text-[--muted] opacity-30" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-display text-[22px] font-light
                               text-[--text-color] leading-tight mb-1">
                                    {room.name}
                                </p>
                                <div className="flex flex-wrap gap-3 text-[12px] text-[--muted]">
                                    <span>{room.maxGuests} guests max</span>
                                    <span>·</span>
                                    <span>{room.bedrooms} bedroom</span>
                                    {room.sizeM2 && <><span>·</span><span>{room.sizeM2}m²</span></>}
                                </div>
                                {room.view && (
                                    <p className="text-[12px] text-[--muted] mt-1">
                                        View: {room.view}
                                    </p>
                                )}
                                <Link
                                    href={`/admin/rooms/${room.id}`}
                                    className="mt-2 inline-flex text-[11px] text-gold
                             hover:text-gold-light transition-colors
                             underline-offset-2 hover:underline"
                                >
                                    View Room →
                                </Link>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Stay details */}
                    <InfoCard title="Stay Details">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Detail
                                icon={CalendarDays}
                                label="Check In"
                                value={checkIn.toLocaleDateString('en-US', {
                                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            />
                            <Detail
                                icon={CalendarDays}
                                label="Check Out"
                                value={checkOut.toLocaleDateString('en-US', {
                                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            />
                            <Detail
                                icon={Clock}
                                label="Duration"
                                value={`${booking.totalNights} night${booking.totalNights > 1 ? 's' : ''}`}
                            />
                            <Detail
                                icon={Users}
                                label="Guests"
                                value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}${booking.children > 0
                                    ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`
                                    : ''
                                    }`}
                            />
                        </div>

                        {booking.specialRequests && (
                            <div className="mt-4 pt-4 border-t border-[--border-color]">
                                <p className="text-[10px] tracking-[0.15em] uppercase
                              text-[--muted] font-medium mb-2">
                                    Special Requests
                                </p>
                                <p className="text-sm text-[--text-color] font-light leading-relaxed">
                                    {booking.specialRequests}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-[--border-color]">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] tracking-[0.15em] uppercase
                              text-[--muted] font-medium">
                                    Source
                                </p>
                                <span className="text-[12px] capitalize text-[--text-color]">
                                    {booking.source.toLowerCase()}
                                </span>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Notes */}
                    <BookingNotes
                        bookingId={booking.id}
                        currentNote={booking.notes ?? ''}
                    />

                </div>

                {/* ── Right: price + status ── */}
                <div className="space-y-5">

                    {/* Price summary */}
                    <div className="rounded-xl bg-[--surface] p-5 shadow-sm">
                        <p className="text-[10px] tracking-[0.2em] uppercase
                          text-[--muted] font-medium mb-4">
                            Payment
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-[--muted]">
                                    ${room.pricePerNight} × {booking.totalNights} nights
                                </span>
                                <span className="font-medium text-[--text-color]">
                                    ${booking.totalAmount.toFixed(0)}
                                </span>
                            </div>
                            <div className="h-px bg-[--border-color]" />
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold text-[--text-color]">
                                    Total
                                </span>
                                <span className="font-display text-[32px] font-light
                                 text-gold leading-none">
                                    ${booking.totalAmount.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status updater */}
                    <StatusUpdater
                        bookingId={booking.id}
                        currentStatus={booking.status}
                    />

                    {/* Timestamps */}
                    <div className="rounded-xl bg-[--surface] p-5 shadow-sm space-y-3">
                        <p className="text-[10px] tracking-[0.2em] uppercase
                          text-[--muted] font-medium">
                            Timeline
                        </p>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[--muted]">
                                Created
                            </p>
                            <p className="text-[13px] text-[--text-color]">
                                {new Date(booking.createdAt).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-[--muted]">
                                Last Updated
                            </p>
                            <p className="text-[13px] text-[--text-color]">
                                {new Date(booking.updatedAt).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// ── Small helpers ─────────────────────────────────────────────
function InfoCard({
    title, children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-xl bg-[--surface] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-[--surface-2]">
                <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--muted] font-medium">
                    {title}
                </p>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function Detail({
    icon: Icon, label, value,
}: {
    icon: typeof CalendarDays
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full bg-teal/8">
                <Icon size={14} className="text-teal" />
            </div>
            <div>
                <p className="text-[10px] tracking-widest uppercase
                      text-[--muted] font-medium mb-0.5">
                    {label}
                </p>
                <p className="text-sm text-[--text-color] font-light">{value}</p>
            </div>
        </div>
    )
}