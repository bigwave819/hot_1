'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Calendar, Users, MessageCircle,
    ArrowRight, Check,
} from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'
import { hotelConfig } from '@/config/hotel.config'

interface Props { room: PublicRoom }

export function RoomBookingCard({ room }: Props) {
    const router = useRouter()

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

    const [checkIn, setCheckIn] = useState(today)
    const [checkOut, setCheckOut] = useState(tomorrow)
    const [guests, setGuests] = useState(Math.min(2, room.maxGuests))

    // Compute number of nights and total
    const nights = Math.max(
        1,
        Math.floor(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
        )
    )

    // Weekend price logic: use weekendPrice on Fri/Sat nights if set
    function priceForNight(dateStr: string): number {
        const day = new Date(dateStr).getUTCDay()
        const isWeekend = day === 5 || day === 6
        return isWeekend && room.weekendPrice
            ? room.weekendPrice
            : room.pricePerNight
    }

    const total = Array.from({ length: nights }).reduce<number>((acc, _, i) => {
        const d = new Date(checkIn)
        d.setUTCDate(d.getUTCDate() + i)
        return acc + priceForNight(d.toISOString().split('T')[0])
    }, 0)
    function handleReserve(e: React.FormEvent) {
        e.preventDefault()
        const params = new URLSearchParams({
            room: room.slug,
            checkIn,
            checkOut,
            guests: String(guests),
        })
        router.push(`/book?${params.toString()}`)
    }

    const whatsappMsg = encodeURIComponent(
        `Hi, I'm interested in booking the ${room.name} from ${checkIn} to ${checkOut} for ${guests} guest${guests > 1 ? 's' : ''}. Could you confirm availability?`
    )

    return (
        <div className="rounded-2xl bg-[--surface] shadow-md overflow-hidden">

            {/* Card header */}
            <div className="bg-teal px-6 py-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-1">
                    Starting from
                </p>
                <div className="flex items-end gap-2">
                    <span className="font-display text-[42px] font-light text-white leading-none">
                        ${room.pricePerNight}
                    </span>
                    <span className="text-white/50 text-sm mb-1">/night</span>
                </div>
                {room.weekendPrice && room.weekendPrice !== room.pricePerNight && (
                    <p className="text-[11px] text-white/50 mt-1">
                        Weekend rate: ${room.weekendPrice}/night
                    </p>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleReserve} className="p-5 space-y-4">

                {/* Check-in */}
                <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase
                            font-medium text-[--muted] mb-2">
                        Check In
                    </label>
                    <div className="flex items-center gap-3 rounded-lg
                          bg-[--bg] border border-[--border-color]
                          px-4 py-3 focus-within:ring-2 focus-within:ring-teal/20">
                        <Calendar size={15} className="text-[--muted] shrink-0" />
                        <input
                            type="date"
                            value={checkIn}
                            min={today}
                            onChange={e => {
                                setCheckIn(e.target.value)
                                if (e.target.value >= checkOut) {
                                    const next = new Date(e.target.value)
                                    next.setDate(next.getDate() + 1)
                                    setCheckOut(next.toISOString().split('T')[0])
                                }
                            }}
                            required
                            className="w-full text-sm text-[--text-color] bg-transparent
                         focus:outline-none font-medium"
                        />
                    </div>
                </div>

                {/* Check-out */}
                <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase
                            font-medium text-[--muted] mb-2">
                        Check Out
                    </label>
                    <div className="flex items-center gap-3 rounded-lg
                          bg-[--bg] border border-[--border-color]
                          px-4 py-3 focus-within:ring-2 focus-within:ring-teal/20">
                        <Calendar size={15} className="text-[--muted] shrink-0" />
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn}
                            onChange={e => setCheckOut(e.target.value)}
                            required
                            className="w-full text-sm text-[--text-color] bg-transparent
                         focus:outline-none font-medium"
                        />
                    </div>
                </div>

                {/* Guests */}
                <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase
                            font-medium text-[--muted] mb-2">
                        Guests
                    </label>
                    <div className="flex items-center gap-3 rounded-lg
                          bg-[--bg] border border-[--border-color]
                          px-4 py-3 focus-within:ring-2 focus-within:ring-teal/20">
                        <Users size={15} className="text-[--muted] shrink-0" />
                        <select
                            value={guests}
                            onChange={e => setGuests(Number(e.target.value))}
                            className="w-full text-sm text-[--text-color] bg-transparent
                         focus:outline-none font-medium cursor-pointer"
                        >
                            {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>
                                    {n} {n === 1 ? 'guest' : 'guests'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="mt-1 text-[11px] text-[--muted]">
                        Max {room.maxGuests} guests
                    </p>
                </div>

                {/* Price summary */}
                {nights > 0 && (
                    <div className="rounded-lg bg-[--bg] p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[--muted]">
                                ${room.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}
                            </span>
                            <span className="font-medium text-[--text-color]">
                                ${total.toFixed(0)}
                            </span>
                        </div>
                        <div className="h-px bg-[--border-color]" />
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold text-[--text-color]">
                                Total
                            </span>
                            <span className="text-gold font-semibold text-base">
                                ${total.toFixed(0)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Reserve button */}
                <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2
                     rounded-lg bg-teal py-4
                     text-[11px] tracking-[0.2em] uppercase
                     font-semibold text-white
                     hover:bg-teal-light transition-colors"
                >
                    Reserve Now
                    <ArrowRight size={14} />
                </button>

                {/* WhatsApp */}

                <a href={`https://wa.me/${hotelConfig.contact.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2
                     rounded-lg border border-[--border-color]
                     bg-[--bg] py-3.5
                     text-[11px] tracking-[0.15em] uppercase
                     font-medium text-[--muted]
                     hover:text-[--text-color] hover:border-[--border-2]
                     transition-colors"
                >
                    <MessageCircle size={14} className="text-[#25D366]" />
                    Ask on WhatsApp
                </a>

            </form>

            {/* Inclusions */}
            <div className="border-t border-[--border-color] px-5 py-4 space-y-2">
                {[
                    'Free cancellation up to 48h before check-in',
                    `Check-in from ${hotelConfig.policies.checkIn}`,
                    `Check-out by ${hotelConfig.policies.checkOut}`,
                ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                        <Check size={13} className="text-gold shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[--muted] font-light">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}