import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { getPublicRooms, getPublicRoomBySlug } from '@/actions/rooms'
import { hotelConfig } from '@/config/hotel.config'
import { RoomGallery } from '@/components/public/room-detail/room-gallery'
import { RoomBookingCard } from '@/components/public/room-detail/room-booking-card'
import { RoomAmenities } from '@/components/public/room-detail/room-amenities'
import { SimilarRooms } from '@/components/public/room-detail/similar-rooms'

// ── Static params for SSG ─────────────────────────────────────
export async function generateStaticParams() {
  const rooms = await getPublicRooms()
  return rooms.map(r => ({ slug: r.slug }))
}

// ── Dynamic metadata ──────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const room = await getPublicRoomBySlug(slug)
  if (!room) return { title: 'Room Not Found' }

  const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]
  const ogImage = primaryPhoto?.url ?? hotelConfig.seo.ogImage

  return {
    title: `${room.name} | ${hotelConfig.name}`,
    description: room.description,
    openGraph: {
      title: `${room.name} | ${hotelConfig.name}`,
      description: room.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: room.name }],
    },
  }
}

// ── Page ──────────────────────────────────────────────────────
export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [room, allRooms] = await Promise.all([
    getPublicRoomBySlug(slug),
    getPublicRooms(),
  ])

  if (!room) notFound()

  const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]
  const similarRooms = allRooms.filter(r => r.slug !== slug).slice(0, 3)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.description,
    image: room.photos.map(p => p.url),
    numberOfRooms: room.bedrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: room.maxGuests,
    },
    floorSize: room.sizeM2
      ? { '@type': 'QuantitativeValue', value: room.sizeM2, unitCode: 'MTK' }
      : undefined,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: room.hasWifi },
      { '@type': 'LocationFeatureSpecification', name: 'Breakfast', value: room.hasBreakfast },
      { '@type': 'LocationFeatureSpecification', name: 'Air Con', value: room.hasAC },
      { '@type': 'LocationFeatureSpecification', name: 'TV', value: room.hasTv },
      { '@type': 'LocationFeatureSpecification', name: 'Balcony', value: room.hasBalcony },
      { '@type': 'LocationFeatureSpecification', name: 'Pool Access', value: room.hasPoolAccess },
      { '@type': 'LocationFeatureSpecification', name: 'Minibar', value: room.hasMinibar },
      { '@type': 'LocationFeatureSpecification', name: 'Hot Water', value: room.hasHotWater },
    ].filter(a => a.value),
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="bg-[--bg]">

        {/* ── Hero ── */}
        <section className="relative h-[60vh] min-h-105 overflow-hidden">
          {primaryPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${primaryPhoto.url}?tr=w-1600,h-900,q-85,fo-auto`}
              alt={primaryPhoto.alt ?? room.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-teal" />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-t
                          from-black/70 via-black/20 to-black/30" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10">
            <div className="mx-auto w-full max-w-7xl">

              {/* Breadcrumb */}
              <nav className="mb-4 flex items-center gap-1.5 text-[11px]
                              text-white/60">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight size={12} className="text-white/40" />
                <Link href="/rooms" className="hover:text-white transition-colors">
                  Rooms
                </Link>
                <ChevronRight size={12} className="text-white/40" />
                <span className="text-white/80">{room.name}</span>
              </nav>

              <h1 className="font-display text-[48px] sm:text-[64px]
                             font-light text-white leading-none mb-3">
                {room.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                {room.view && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gold" />
                    <span className="text-[13px] text-white/70">{room.view}</span>
                  </div>
                )}
                {room.number && (
                  <span className="rounded-full bg-white/15 px-3 py-1
                                   text-[11px] text-white/70 backdrop-blur-sm">
                    Room {room.number}
                  </span>
                )}
                <span className="rounded-full bg-white/15 px-3 py-1
                                 text-[11px] text-white/70 backdrop-blur-sm">
                  From ${room.pricePerNight}
                  <span className="text-white/50"> /night</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main content ── */}
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="grid gap-10 lg:grid-cols-3">

            {/* ── Left: details ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Key specs row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Max Guests', value: `${room.maxGuests} guests` },
                  { label: 'Bedrooms', value: `${room.bedrooms} bedroom` },
                  { label: 'Bed Config', value: room.beds ?? '—' },
                  { label: 'Room Size', value: room.sizeM2 ? `${room.sizeM2}m²` : '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-[--surface] p-4 text-center shadow-sm"
                  >
                    <p className="font-display text-[22px] font-light
                                  text-gold leading-none mb-1">
                      {value}
                    </p>
                    <p className="text-[10px] tracking-[0.15em] uppercase
                                  text-[--muted] font-medium">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display text-[28px] font-light
                               text-[--text-color] mb-4">
                  About this room
                </h2>
                <p className="text-[--muted] leading-relaxed font-light text-base">
                  {room.description}
                </p>
              </div>

              {/* Amenities */}
              <RoomAmenities room={room} />

              {/* Photo gallery */}
              {room.photos.length > 1 && (
                <div>
                  <h2 className="font-display text-[28px] font-light
                                 text-[--text-color] mb-6">
                    Photos
                  </h2>
                  <RoomGallery photos={room.photos} roomName={room.name} />
                </div>
              )}

            </div>

            {/* ── Right: booking card ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <RoomBookingCard room={room} />
              </div>
            </div>

          </div>
        </div>

        {/* ── Similar rooms ── */}
        {similarRooms.length > 0 && (
          <SimilarRooms rooms={similarRooms} />
        )}

      </div>
    </>
  )
}