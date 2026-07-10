import type { Metadata } from 'next'
import { getPublicRooms } from '@/actions/rooms'
import { RoomsGrid } from '@/components/public/rooms-grid'
import { hotelConfig } from '@/config/hotel.config'

export const metadata: Metadata = {
  title: `Rooms & Suites | ${hotelConfig.name}`,
  description: `Explore our collection of luxury suites and villas at ${hotelConfig.name}, ${hotelConfig.location}. Each room is a world unto itself.`,
  openGraph: {
    title: `Rooms & Suites | ${hotelConfig.name}`,
    description: 'Handcrafted rooms perched above the hills of Kigali.',
    images: [hotelConfig.seo.ogImage],
  },
}

export default async function RoomsPage() {
  const rooms = await getPublicRooms()

  return (
    <div className="bg-[--bg]">

      {/* ── Page hero ── */}
      <section className="relative bg-teal overflow-hidden pt-32 pb-16 px-6">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #E5D9B6 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-[10px] tracking-[0.45em] uppercase
                        text-gold font-medium mb-4">
            Accommodation
          </p>
          <h1 className="font-display text-[56px] sm:text-[72px]
                         font-light text-white leading-none mb-4">
            Our Rooms
          </h1>
          <p className="text-white/60 text-base font-light
                        max-w-md leading-relaxed">
            Each space at Peponi is a world unto itself — crafted
            to dissolve the boundary between inside and out.
          </p>

          {/* Room count */}
          <div className="mt-8 inline-flex items-center gap-3
                          rounded-full bg-white/10 px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[12px] text-white/70">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
            </span>
          </div>
        </div>
      </section>

      {/* ── Rooms grid with filter ── */}
      <RoomsGrid rooms={rooms} />

    </div>
  )
}