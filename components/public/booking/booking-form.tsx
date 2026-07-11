'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    BedDouble, Calendar, Users,
    MessageCircle, ArrowRight,
    Loader2, LogIn, Check,
    ChevronDown, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { createBooking } from '@/actions/public/bookings'
import type { PublicRoom } from '@/actions/rooms'
import { hotelConfig } from '@/config/hotel.config'

// ── Schema ────────────────────────────────────────────────────
const schema = z.object({
    roomId: z.string().uuid('Please select a room'),
    checkIn: z.string().min(1, 'Check-in date required'),
    checkOut: z.string().min(1, 'Check-out date required'),
    adults: z.coerce.number().int().min(1),
    children: z.coerce.number().int().min(0).default(0),
    specialRequests: z.string().max(500).optional(),
}).refine(
    d => !d.checkIn || !d.checkOut || new Date(d.checkOut) > new Date(d.checkIn),
    { message: 'Check-out must be after check-in', path: ['checkOut'] }
)

type FormValues = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────
interface Props {
    rooms: PublicRoom[]
    preselectedRoom: PublicRoom | null
    initialCheckIn: string
    initialCheckOut: string
    initialGuests: number
}

// ── Price helper ──────────────────────────────────────────────
function calcTotal(
    checkIn: string,
    checkOut: string,
    room: PublicRoom | null
): { nights: number; total: number } {
    if (!room || !checkIn || !checkOut) return { nights: 0, total: 0 }
    const ci = new Date(checkIn)
    const co = new Date(checkOut)
    if (co <= ci) return { nights: 0, total: 0 }
    const nights = Math.floor((co.getTime() - ci.getTime()) / 86_400_000)
    let total = 0
    for (let i = 0; i < nights; i++) {
        const d = new Date(ci)
        d.setDate(d.getDate() + i)
        const day = d.getDay()
        total += (day === 5 || day === 6) && room.weekendPrice
            ? room.weekendPrice
            : room.pricePerNight
    }
    return { nights, total }
}

// ── Status styles ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-gold/10 text-gold',
    CONFIRMED: 'bg-teal/10 text-teal',
    CANCELLED: 'bg-red-400/10 text-red-400',
    CHECKED_IN: 'bg-emerald-500/10 text-emerald-500',
    CHECKED_OUT: 'bg-[--surface-2] text-[--muted]',
    NO_SHOW: 'bg-red-400/10 text-red-400',
}

// ── Component ─────────────────────────────────────────────────
export function BookingForm({
    rooms,
    preselectedRoom,
    initialCheckIn,
    initialCheckOut,
    initialGuests,
}: Props) {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

    const [serverError, setServerError] = useState('')
    const [success, setSuccess] = useState(false)
    const [bookingRef, setBookingRef] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roomId: preselectedRoom?.id ?? '',
            checkIn: initialCheckIn || today,
            checkOut: initialCheckOut || tomorrow,
            adults: Math.min(Math.max(initialGuests || 2, 1), 10),
            children: 0,
            specialRequests: '',
        },
    })

    const watchedRoomId = watch('roomId')
    const watchedCheckIn = watch('checkIn')
    const watchedCheckOut = watch('checkOut')
    const watchedAdults = watch('adults')

    const selectedRoom = useMemo(
        () => rooms.find(r => r.id === watchedRoomId) ?? preselectedRoom ?? null,
        [watchedRoomId, rooms, preselectedRoom]
    )

    const { nights, total } = useMemo(
        () => calcTotal(watchedCheckIn, watchedCheckOut, selectedRoom),
        [watchedCheckIn, watchedCheckOut, selectedRoom]
    )

    const primaryPhoto = selectedRoom?.photos.find(p => p.isPrimary)
        ?? selectedRoom?.photos[0]

    async function onSubmit(values: FormValues) {
        setServerError('')
        const result = await createBooking({
            roomId: values.roomId,
            checkIn: values.checkIn,
            checkOut: values.checkOut,
            adults: Number(values.adults),
            children: Number(values.children ?? 0),
            specialRequests: values.specialRequests,
        })
        if (!result.success) {
            setServerError(result.error)
            return
        }
        setSuccess(true)
        setBookingRef(result.data.id.slice(0, 8).toUpperCase())
    }

    // ── Success state ─────────────────────────────────────────
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center
                        rounded-full bg-teal/10">
                    <Check size={36} className="text-teal" />
                </div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
                    Booking Confirmed
                </p>
                <h2 className="font-display text-[40px] font-light
                       text-[--text-color] mb-3 leading-none">
                    You're all set.
                </h2>
                <p className="text-[--muted] text-base font-light mb-2 max-w-sm">
                    Your reservation at {selectedRoom?.name ?? 'Peponi'} is pending confirmation.
                    We'll reach out within 2 hours.
                </p>
                <div className="mt-3 mb-8 rounded-full bg-[--surface]
                        px-5 py-2.5 text-sm font-medium text-[--text-color]">
                    Reference: <span className="text-gold font-semibold">{bookingRef}</span>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/bookings"
                        className="rounded-md bg-teal px-6 py-3 text-[11px]
                       tracking-[0.2em] uppercase font-medium text-white
                       hover:bg-teal-light transition-colors"
                    >
                        View My Bookings
                    </Link>
                    <Link
                        href="/"
                        className="rounded-md bg-[--surface] px-6 py-3 text-[11px]
                       tracking-[0.2em] uppercase font-medium text-[--muted]
                       hover:text-[--text-color] transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-8 lg:grid-cols-3">

            {/* ── Left: form ── */}
            <div className="lg:col-span-2 space-y-6">

                {/* Auth gate */}
                {!isPending && !session?.user && (
                    <div className="flex items-start gap-4 rounded-xl
                          bg-teal/5 border border-teal/15 p-5">
                        <LogIn size={20} className="text-teal mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[--text-color] mb-1">
                                Sign in to complete your booking
                            </p>
                            <p className="text-[13px] text-[--muted] font-light mb-3">
                                You need an account to reserve a room.
                            </p>
                            <Link
                                href={`/login?redirect=${encodeURIComponent(
                                    `/book?room=${selectedRoom?.slug ?? ''}&checkIn=${watchedCheckIn}&checkOut=${watchedCheckOut}&guests=${watchedAdults}`
                                )}`}
                                className="inline-flex items-center gap-2 rounded-md
                           bg-teal px-4 py-2 text-[11px]
                           tracking-[0.15em] uppercase font-medium text-white
                           hover:bg-teal-light transition-colors"
                            >
                                Sign In
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Room selection */}
                <FormSection
                    step="01"
                    title="Select Room"
                    subtitle="Choose the room you'd like to reserve"
                >
                    <div className="grid gap-3">
                        {rooms.map(room => {
                            const photo = room.photos.find(p => p.isPrimary) ?? room.photos[0]
                            const selected = room.id === watchedRoomId
                            return (
                                <label
                                    key={room.id}
                                    className={`flex cursor-pointer items-center gap-4
                              rounded-xl p-4 transition-all duration-150
                              ${selected
                                            ? 'bg-teal/8 ring-2 ring-teal/30'
                                            : 'bg-[--surface] hover:bg-[--surface-2]'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={room.id}
                                        {...register('roomId')}
                                        className="sr-only"
                                    />
                                    {/* Room thumb */}
                                    <div className="h-14 w-20 shrink-0 overflow-hidden
                                  rounded-lg bg-[--surface-2]">
                                        {photo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`${photo.url}?tr=w-160,h-112,q-75,fo-auto`}
                                                alt={room.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BedDouble size={18} className="text-[--muted] opacity-40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Room info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-display text-[18px] font-light leading-none mb-1
                                   ${selected ? 'text-teal' : 'text-[--text-color]'}`}>
                                            {room.name}
                                        </p>
                                        <p className="text-[12px] text-[--muted]">
                                            {room.maxGuests} guests · {room.bedrooms} bedroom
                                            {room.sizeM2 ? ` · ${room.sizeM2}m²` : ''}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="shrink-0 text-right">
                                        <p className="text-gold font-medium text-[15px]">
                                            ${room.pricePerNight}
                                        </p>
                                        <p className="text-[10px] text-[--muted]">/night</p>
                                    </div>

                                    {/* Selected indicator */}
                                    {selected && (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center
                                    rounded-full bg-teal text-white">
                                            <Check size={13} />
                                        </div>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                    {errors.roomId && (
                        <FieldError message={errors.roomId.message} />
                    )}
                </FormSection>

                {/* Dates */}
                <FormSection
                    step="02"
                    title="Select Dates"
                    subtitle="Choose your check-in and check-out dates"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelCls}>Check In</label>
                            <div className={inputWrapCls(!!errors.checkIn)}>
                                <Calendar size={15} className="text-[--muted] shrink-0" />
                                <input
                                    type="date"
                                    min={today}
                                    {...register('checkIn', {
                                        onChange: e => {
                                            if (e.target.value >= watchedCheckOut) {
                                                const next = new Date(e.target.value)
                                                next.setDate(next.getDate() + 1)
                                                setValue('checkOut', next.toISOString().split('T')[0])
                                            }
                                        }
                                    })}
                                    className="flex-1 bg-transparent text-sm text-[--text-color]
                             font-medium focus:outline-none"
                                />
                            </div>
                            {errors.checkIn && <FieldError message={errors.checkIn.message} />}
                        </div>

                        <div>
                            <label className={labelCls}>Check Out</label>
                            <div className={inputWrapCls(!!errors.checkOut)}>
                                <Calendar size={15} className="text-[--muted] shrink-0" />
                                <input
                                    type="date"
                                    min={watchedCheckIn || today}
                                    {...register('checkOut')}
                                    className="flex-1 bg-transparent text-sm text-[--text-color]
                             font-medium focus:outline-none"
                                />
                            </div>
                            {errors.checkOut && <FieldError message={errors.checkOut.message} />}
                        </div>
                    </div>
                </FormSection>

                {/* Guests */}
                <FormSection
                    step="03"
                    title="Guests"
                    subtitle="How many people are staying?"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelCls}>Adults</label>
                            <div className={inputWrapCls(!!errors.adults)}>
                                <Users size={15} className="text-[--muted] shrink-0" />
                                <select
                                    {...register('adults')}
                                    className="flex-1 bg-transparent text-sm text-[--text-color]
                             font-medium focus:outline-none cursor-pointer"
                                >
                                    {Array.from(
                                        { length: selectedRoom?.maxGuests ?? 6 },
                                        (_, i) => i + 1
                                    ).map(n => (
                                        <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="text-[--muted] shrink-0" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Children</label>
                            <div className={inputWrapCls(!!errors.children)}>
                                <Users size={15} className="text-[--muted] shrink-0" />
                                <select
                                    {...register('children')}
                                    className="flex-1 bg-transparent text-sm text-[--text-color]
                             font-medium focus:outline-none cursor-pointer"
                                >
                                    {[0, 1, 2, 3, 4].map(n => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'child' : 'children'}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="text-[--muted] shrink-0" />
                            </div>
                        </div>
                    </div>
                </FormSection>

                {/* Special requests */}
                <FormSection
                    step="04"
                    title="Special Requests"
                    subtitle="Let us know if you need anything specific (optional)"
                >
                    <textarea
                        {...register('specialRequests')}
                        rows={4}
                        placeholder="Early check-in, dietary requirements, accessibility needs..."
                        className="w-full resize-none rounded-lg bg-[--bg]
                       border border-[--border-color] px-4 py-3
                       text-sm text-[--text-color] font-light
                       placeholder:text-[--muted]
                       focus:outline-none focus:ring-2 focus:ring-teal/20
                       transition-colors"
                    />
                    {errors.specialRequests && (
                        <FieldError message={errors.specialRequests.message} />
                    )}
                </FormSection>

                {/* Server error */}
                {serverError && (
                    <div className="flex items-start gap-3 rounded-xl
                          bg-red-500/6 border border-red-500/15 p-4">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-400">{serverError}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="button"
                    disabled={isSubmitting || isPending || !session?.user || nights === 0}
                    onClick={handleSubmit(onSubmit)}
                    className="flex w-full items-center justify-center gap-2.5
                     rounded-xl bg-teal py-4
                     text-[11px] tracking-[0.2em] uppercase
                     font-semibold text-white shadow-sm
                     hover:bg-teal-light transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSubmitting
                        ? <><Loader2 size={15} className="animate-spin" /> Confirming…</>
                        : isPending
                            ? <><Loader2 size={15} className="animate-spin" /> Loading…</>
                            : !session?.user
                                ? <><LogIn size={15} /> Sign In to Reserve</>
                                : <><ArrowRight size={15} /> Confirm Reservation</>
                    }
                </button>

            </div>

            {/* ── Right: sticky summary ── */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl bg-[--surface]
                        shadow-md overflow-hidden">

                    {/* Selected room preview */}
                    {selectedRoom ? (
                        <>
                            <div className="relative h-36 bg-[--surface-2] overflow-hidden">
                                {primaryPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`${primaryPhoto.url}?tr=w-600,h-288,q-80,fo-auto`}
                                        alt={selectedRoom.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <BedDouble size={24} className="text-[--muted] opacity-30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t
                                from-black/50 to-transparent" />
                                <p className="absolute bottom-3 left-4 font-display
                              text-[18px] font-light text-white">
                                    {selectedRoom.name}
                                </p>
                            </div>

                            <div className="p-5 space-y-4">

                                {/* Dates summary */}
                                {watchedCheckIn && watchedCheckOut && nights > 0 && (
                                    <div className="space-y-2.5">
                                        <SummaryRow
                                            label="Check In"
                                            value={new Date(watchedCheckIn).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                        />
                                        <SummaryRow
                                            label="Check Out"
                                            value={new Date(watchedCheckOut).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                        />
                                        <SummaryRow
                                            label="Guests"
                                            value={`${watchedAdults} adult${watchedAdults > 1 ? 's' : ''}`}
                                        />
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="h-px bg-[--border-color]" />

                                {/* Price breakdown */}
                                {nights > 0 && selectedRoom ? (
                                    <div className="space-y-2">
                                        <SummaryRow
                                            label={`$${selectedRoom.pricePerNight} × ${nights} night${nights > 1 ? 's' : ''}`}
                                            value={`$${total.toFixed(0)}`}
                                        />
                                        {selectedRoom.weekendPrice && (
                                            <p className="text-[11px] text-[--muted]">
                                                * Weekend rate ${selectedRoom.weekendPrice}/night may apply
                                            </p>
                                        )}
                                        <div className="h-px bg-[--border-color]" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-[--text-color]">
                                                Total
                                            </span>
                                            <span className="font-display text-[28px] font-light text-gold leading-none">
                                                ${total.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[13px] text-[--muted] text-center py-2">
                                        Select dates to see pricing
                                    </p>
                                )}

                                {/* Inclusions */}
                                <div className="space-y-2 pt-1">
                                    {[
                                        'Free cancellation · 48h before check-in',
                                        `Check-in from ${hotelConfig.policies.checkIn}`,
                                        `Check-out by ${hotelConfig.policies.checkOut}`,
                                    ].map(item => (
                                        <div key={item} className="flex items-start gap-2">
                                            <Check size={12} className="text-gold shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-[--muted] font-light">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* WhatsApp */}

                                <a href={`https://wa.me/${hotelConfig.contact.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2
                                rounded-lg bg-[--bg] py-3
                                text-[11px] tracking-widest uppercase
                                font-medium text-[--muted]
                                hover:text-[--text-color] transition-colors"
                                >
                                    <MessageCircle size={14} className="text-[#25D366]" />
                                    Ask via WhatsApp
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center
                            gap-3 py-14 px-6 text-center">
                            <BedDouble size={28} className="text-[--muted] opacity-30" />
                            <p className="text-[13px] text-[--muted]">
                                Select a room to see pricing
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div >
    )
}

// ── Small helpers ─────────────────────────────────────────────
function FormSection({
    step, title, subtitle, children,
}: {
    step: string
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-2xl bg-[--surface] p-6 space-y-5">
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full bg-teal text-white text-[11px] font-medium">
                    {step}
                </div>
                <div>
                    <p className="font-medium text-[--text-color] text-[15px] leading-none mb-1">
                        {title}
                    </p>
                    <p className="text-[12px] text-[--muted] font-light">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[12px] text-[--muted]">{label}</span>
            <span className="text-[13px] font-medium text-[--text-color]">{value}</span>
        </div>
    )
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-400">
            <AlertCircle size={12} />
            {message}
        </p>
    )
}

const labelCls = 'block text-[10px] tracking-[0.15em] uppercase font-medium text-[--muted] mb-2'

const inputWrapCls = (hasError: boolean) =>
    `flex items-center gap-3 rounded-lg bg-[--bg] px-4 py-3
   border transition-colors duration-200 focus-within:ring-2 focus-within:ring-teal/20
   ${hasError
        ? 'border-red-400/50 focus-within:ring-red-400/20'
        : 'border-[--border-color] focus-within:border-teal'
    }`