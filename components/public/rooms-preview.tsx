import Link                  from 'next/link'
import {
  Users, BedDouble, Maximize2,
  Wifi, Coffee, Waves, ArrowRight,
}                            from 'lucide-react'
import type { PublicRoom }   from '@/actions/rooms'

const AMENITY_ICONS = [
  { key: 'hasWifi',       icon: Wifi,    label: 'WiFi'      },
  { key: 'hasBreakfast',  icon: Coffee,  label: 'Breakfast' },
  { key: 'hasPoolAccess', icon: Waves,   label: 'Pool'      },
] as const

interface Props {
  rooms: PublicRoom[]
}

export function RoomsPreview({ rooms }: Props) {
  const preview = rooms.slice(0, 3)

  return (
    <section className="bg-[#FAFAFA] py-24 px-6">
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-14 flex flex-col sm:flex-row
                        sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase
                          text-[#C58940] font-medium mb-4">
              Accommodation
            </p>
            <h2 className="font-display text-[44px] sm:text-[54px]
                           font-light leading-none text-[#1A3C40]">
              Our Rooms
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-[11px] tracking-[0.2em]
                       uppercase font-medium text-[#1A3C40]
                       hover:text-[#C58940] transition-colors"
          >
            View all rooms
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Rooms grid */}
        {preview.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preview.map((room, idx) => (
              <RoomCard key={room.id} room={room} featured={idx === 0} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

// ── Room card ─────────────────────────────────────────────────
function RoomCard({ room, featured }: { room: PublicRoom; featured: boolean }) {
  const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]

  const activeAmenities = AMENITY_ICONS.filter(
    ({ key }) => room[key as keyof PublicRoom] === true
  )

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className={`group flex flex-col bg-white  overflow-hidden
                  shadow-sm hover:shadow-md transition-shadow duration-300
                  ${featured ? 'md:col-span-1' : ''}`}
    >
      {/* Photo */}
      <div className="relative overflow-hidden bg-[#1A3C40]/8
                      h-56 sm:h-64">
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${primaryPhoto.url}?tr=w-600,h-400,q-80,fo-auto`}
            alt={primaryPhoto.alt ?? room.name}
            className="h-full w-full object-cover
                       transition-transform duration-700
                       group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BedDouble size={32} className="text-[#1A3C40]/20" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 px-3 py-2 shadow-sm">
            <span className="text-[#C58940] font-medium text-base">
              ${room.pricePerNight}
            </span>
            <span className="text-[#1A3C40]/50 text-[11px]"> /night</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">

        {/* Name */}
        <h3 className="font-display text-[22px] font-light
                       text-[#1A3C40] leading-tight mb-3">
          {room.name}
        </h3>

        {/* Specs row */}
        <div className="flex items-center gap-4 mb-4">
          <Spec icon={Users}     value={`${room.maxGuests} guests`} />
          <Spec icon={BedDouble} value={`${room.bedrooms} bed`}     />
          {room.sizeM2 && (
            <Spec icon={Maximize2} value={`${room.sizeM2}m²`} />
          )}
        </div>

        {/* Description */}
        <p className="text-[#1A3C40]/60 text-sm leading-relaxed
                      font-light line-clamp-2 flex-1 mb-5">
          {room.description}
        </p>

        {/* Amenities */}
        {activeAmenities.length > 0 && (
          <div className="flex gap-2 mb-5">
            {activeAmenities.map(({ key, icon: Icon, label }) => (
              <div
                key={key}
                className="flex items-center gap-1.5 
                           bg-[#1A3C40]/5 px-2.5 py-1.5"
              >
                <Icon size={11} className="text-[#1A3C40]/60" />
                <span className="text-[10px] text-[#1A3C40]/60">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between mt-auto pt-4
                        border-t border-[#1A3C40]/8">
          <span className="text-[11px] tracking-[0.15em] uppercase
                           font-medium text-[#1A3C40]
                           group-hover:text-[#C58940] transition-colors">
            View Room
          </span>
          <ArrowRight
            size={14}
            className="text-[#1A3C40] group-hover:text-[#C58940]
                       group-hover:translate-x-1 transition-all duration-200"
          />
        </div>
      </div>
    </Link>
  )
}

function Spec({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[#1A3C40]/40" />
      <span className="text-[12px] text-[#1A3C40]/50">{value}</span>
    </div>
  )
}

function RoomCardSkeleton() {
  return (
    <div className="flex flex-col bg-white overflow-hidden shadow-sm">
      <div className="h-56 bg-[#1A3C40]/5 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-3/4 bg-[#1A3C40]/5 animate-pulse" />
        <div className="h-4 w-1/2 bg-[#1A3C40]/5 animate-pulse" />
        <div className="h-16 bg-[#1A3C40]/5 animate-pulse" />
      </div>
    </div>
  )
}