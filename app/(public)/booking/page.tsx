import type { Metadata } from 'next'
import { Suspense } from 'react'
import { hotelConfig } from '@/config/hotel.config'
import { getPublicRooms } from '@/actions/rooms'
import { getPublicRoomBySlug } from '@/actions/rooms'
import { BookingForm } from '@/components/public/booking/booking-form'

export const metadata: Metadata = {
    title: `Reserve a Room | ${hotelConfig.name}`,
    description: `Book your stay at ${hotelConfig.name}, Kigali Rwanda.`,
    robots: { index: false, follow: false },
}

export default async function BookPage({
    searchParams,
}: {
    searchParams: Promise<{
        room?: string
        checkIn?: string
        checkOut?: string
        guests?: string
    }>
}) {
    const params = await searchParams

    const [allRooms, preselectedRoom] = await Promise.all([
        getPublicRooms(),
        params.room ? getPublicRoomBySlug(params.room) : Promise.resolve(null),
    ])

    return (
        <div className="min-h-screen bg-[--bg]">

            {/* Hero */}
            <section className="relative bg-teal overflow-hidden pt-32 pb-14 px-6">
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #E5D9B6 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }} />
                <div className="relative mx-auto max-w-7xl">
                    <p className="text-[10px] tracking-[0.45em] uppercase
                        text-gold font-medium mb-4">
                        Reservation
                    </p>
                    <h1 className="font-display text-[56px] sm:text-[72px]
                         font-light text-white leading-none mb-3">
                        Reserve Your Stay
                    </h1>
                    <p className="text-white/60 text-base font-light max-w-md leading-relaxed">
                        Complete your booking at {hotelConfig.name}.
                        We'll confirm within 2 hours.
                    </p>
                </div>
            </section>

            {/* Form */}
            <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12">
                <Suspense fallback={<BookingSkeleton />}>
                    <BookingForm
                        rooms={allRooms}
                        preselectedRoom={preselectedRoom}
                        initialCheckIn={params.checkIn ?? ''}
                        initialCheckOut={params.checkOut ?? ''}
                        initialGuests={Number(params.guests ?? 2)}
                    />
                </Suspense>
            </div>

        </div>
    )
}

function BookingSkeleton() {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-[--surface]" />
                ))}
            </div>
            <div className="h-80 animate-pulse rounded-xl bg-[--surface]" />
        </div>
    )
}