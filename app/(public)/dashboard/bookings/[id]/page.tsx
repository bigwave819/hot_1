import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/guard'
import { getUserBookingById } from '@/actions/public/bookings'
import { hotelConfig } from '@/config/hotel.config'
import {
    ArrowLeft, CalendarDays, Users,
    BedDouble, Clock, Hash,
    MessageCircle, Check, MapPin,
} from 'lucide-react'

export const metadata: Metadata = {
    title: `Booking Detail | ${hotelConfig.name}`,
    robots: { index: false, follow: false },
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; desc: string }> = {
    PENDING: {
        label: 'Awaiting Confirmation',
        cls: 'bg-gold/10 text-gold border-gold/20',
        desc: 'Your booking is under review. We\'ll confirm within 2 hours.',
    },
    CONFIRMED: {
        label: 'Confirmed',
        cls: 'bg-teal/10 text-teal border-teal/20',
        desc: 'Your reservation is confirmed. We look forward to welcoming you.',
    },
    CANCELLED: {
        label: 'Cancelled',
        cls: 'bg-red-400/10 text-red-400 border-red-400/20',
        desc: 'This booking has been cancelled.',
    },
    CHECKED_IN: {
        label: 'Checked In',
        cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        desc: 'Welcome to Peponi! Enjoy your stay.',
    },
    CHECKED_OUT: {
        label: 'Stay Completed',
        cls: 'bg-[--surface-2] text-[--muted] border-[--border-color]',
        desc: 'Thank you for staying with us at Peponi.',
    },
    NO_SHOW: {
        label: 'No Show',
        cls: 'bg-red-400/10 text-red-400 border-red-400/20',
        desc: 'This booking was marked as no-show.',
    },
}

export default async function BookingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getSession()
    if (!session) redirect('/login?redirect=/dashboard/bookings')

    const { id } = await params
    const result = await getUserBookingById(id)
    if (!result.success) notFound()

    const booking = result.data
    const room = booking.room
    const status = STATUS_CONFIG[booking.status]

    const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]

    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)

    const whatsappMsg = encodeURIComponent(
        `Hi, I'm following up on my booking (Ref: ${booking.id.slice(0, 8).toUpperCase()}) for ${room.name}.`
    )

    return (
        <div className="bg-[--bg] min-h-screen">

            {/* Hero */}
            <section className="bg-teal pt-32 pb-10 px-6">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/dashboard/bookings"
                        className="mb-5 inline-flex items-center gap-2 text-[12px]
                       text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} />
                        My Bookings
                    </Link>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-2">
                                Booking Reference
                            </p>
                            <h1 className="font-display text-[40px] font-light
                             text-white leading-none">
                                {booking.id.slice(0, 8).toUpperCase()}
                            </h1>
                        </div>
                        <span className={`self-start rounded-full px-4 py-2
                              text-[11px] font-medium tracking-wide uppercase
                              border ${status?.cls}`}>
                            {status?.label}
                        </span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10">
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── Left: booking details ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status message */}
                        {status?.desc && (
                            <div className={`flex items-start gap-3 rounded-xl p-4
                               border ${status.cls} bg-opacity-50`}>
                                <Check size={16} className="mt-0.5 shrink-0" />
                                <p className="text-sm font-light">{status.desc}</p>
                            </div>
                        )}

                        {/* Room info */}
                        <div className="rounded-2xl bg-[--surface] overflow-hidden shadow-sm">
                            <div className="relative h-48 bg-[--surface-2] overflow-hidden">
                                {primaryPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`${primaryPhoto.url}?tr=w-800,h-384,q-80,fo-auto`}
                                        alt={room.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <BedDouble size={32} className="text-[--muted] opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <p className="text-[10px] tracking-[0.25em] uppercase
                              text-gold font-medium mb-1">
                                    Your Room
                                </p>
                                <h2 className="font-display text-[28px] font-light
                               text-[--text-color] mb-2">
                                    {room.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4">
                                    <DetailChip icon={Users} value={`${booking.adults} adult${booking.adults > 1 ? 's' : ''}`} />
                                    <DetailChip icon={BedDouble} value={`${room.bedrooms} bedroom`} />
                                    {room.view && <DetailChip icon={MapPin} value={room.view} />}
                                </div>
                            </div>
                        </div>

                        {/* Dates & stay details */}
                        <div className="rounded-2xl bg-[--surface] p-6 shadow-sm">
                            <p className="text-[10px] tracking-[0.25em] uppercase
                            text-[--muted] font-medium mb-5">
                                Stay Details
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailBlock
                                    icon={CalendarDays}
                                    label="Check In"
                                    value={checkIn.toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                    sub={`From ${hotelConfig.policies.checkIn}`}
                                />
                                <DetailBlock
                                    icon={CalendarDays}
                                    label="Check Out"
                                    value={checkOut.toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                    sub={`By ${hotelConfig.policies.checkOut}`}
                                />
                                <DetailBlock
                                    icon={Clock}
                                    label="Duration"
                                    value={`${booking.totalNights} night${booking.totalNights > 1 ? 's' : ''}`}
                                    sub={`${booking.adults} guest${booking.adults > 1 ? 's' : ''}`}
                                />
                                <DetailBlock
                                    icon={Hash}
                                    label="Booking Source"
                                    value={booking.source.charAt(0) + booking.source.slice(1).toLowerCase()}
                                    sub={`Booked ${new Date(booking.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}`}
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
                        </div>

                    </div>

                    {/* ── Right: price + contact ── */}
                    <div className="space-y-5">

                        {/* Price summary */}
                        <div className="rounded-2xl bg-[--surface] p-5 shadow-sm">
                            <p className="text-[10px] tracking-[0.25em] uppercase
                            text-[--muted] font-medium mb-4">
                                Payment Summary
                            </p>
                            <div className="space-y-3">
                                <SummaryRow
                                    label={`$${room.pricePerNight} × ${booking.totalNights} nights`}
                                    value={`$${booking.totalAmount.toFixed(0)}`}
                                />
                                <div className="h-px bg-[--border-color]" />
                                <div className="flex justify-between items-center">
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

                        {/* Contact hotel */}
                        <div className="rounded-2xl bg-[--surface] p-5 shadow-sm">
                            <p className="text-[10px] tracking-[0.25em] uppercase
                            text-[--muted] font-medium mb-4">
                                Need Help?
                            </p>

                            <a href={`https://wa.me/${hotelConfig.contact.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-xl
                           bg-[--bg] px-4 py-3.5
                           text-sm text-[--muted]
                           hover:text-[--text-color] transition-colors"
                            >
                                <MessageCircle size={18} className="text-[#25D366] shrink-0" />
                                <div>
                                    <p className="text-[12px] font-medium text-[--text-color]">
                                        WhatsApp
                                    </p>
                                    <p className="text-[11px] text-[--muted]">
                                        {hotelConfig.contact.whatsapp}
                                    </p>
                                </div>
                            </a>

                            <a href={`mailto:${hotelConfig.contact.email}?subject=Booking ${booking.id.slice(0, 8).toUpperCase()}`}
                                className="mt-2 flex items-center gap-3 rounded-xl
                           bg-[--bg] px-4 py-3.5
                           text-sm text-[--muted]
                           hover:text-[--text-color] transition-colors"
                            >
                                <div className="flex h-4.5 w-4.5 shrink-0 items-center
                                justify-center text-teal text-[13px] font-bold">
                                    @
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-[--text-color]">
                                        Email Us
                                    </p>
                                    <p className="text-[11px] text-[--muted] truncate">
                                        {hotelConfig.contact.email}
                                    </p>
                                </div>
                            </a>
                        </div>

                        {/* Browse more rooms */}
                        <Link
                            href="/rooms"
                            className="flex items-center justify-center gap-2
                         rounded-2xl bg-teal py-4
                         text-[11px] tracking-[0.2em] uppercase
                         font-medium text-white
                         hover:bg-teal-light transition-colors"
                        >
                            Browse More Rooms
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Helpers ───────────────────────────────────────────────────
function DetailChip({ icon: Icon, value }: { icon: typeof Users; value: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon size={13} className="text-[--muted]" />
            <span className="text-[13px] text-[--muted]">{value}</span>
        </div>
    )
}

function DetailBlock({
    icon: Icon, label, value, sub,
}: {
    icon: typeof CalendarDays
    label: string
    value: string
    sub: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-full bg-teal/8">
                <Icon size={16} className="text-teal" />
            </div>
            <div>
                <p className="text-[10px] tracking-[0.15em] uppercase
                      text-[--muted] font-medium mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-medium text-[--text-color]">{value}</p>
                <p className="text-[11px] text-[--muted]">{sub}</p>
            </div>
        </div>
    )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-[13px] text-[--muted]">{label}</span>
            <span className="text-[13px] font-medium text-[--text-color]">{value}</span>
        </div>
    )
}