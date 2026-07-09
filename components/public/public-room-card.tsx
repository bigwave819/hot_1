import Link from 'next/link'
import {
  Wifi, Coffee, Wind, Tv2, Sunset,
  Waves, Wine, Droplets,
  BedDouble, Users, Maximize2, ArrowRight,
} from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'

const AMENITY_MAP = [
  { key: 'hasWifi', icon: Wifi, label: 'WiFi' },
  { key: 'hasBreakfast', icon: Coffee, label: 'Breakfast' },
  { key: 'hasAC', icon: Wind, label: 'Air Con' },
  { key: 'hasTv', icon: Tv2, label: 'TV' },
  { key: 'hasBalcony', icon: Sunset, label: 'Balcony' },
  { key: 'hasPoolAccess', icon: Waves, label: 'Pool' },
  { key: 'hasMinibar', icon: Wine, label: 'Minibar' },
  { key: 'hasHotWater', icon: Droplets, label: 'Hot Water' },
] as const

export function PublicRoomCard({ room }: { room: PublicRoom }) {
  const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]
  const activeAmenities = AMENITY_MAP.filter(
    ({ key }) => room[key as keyof PublicRoom] === true
  ).slice(0, 4)

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl
                border border-[--border-color] bg-[--surface]
                transition-shadow duration-200 hover:shadow-md"
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden bg-[--surface-2]">
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${primaryPhoto.url}?tr=w-520,h-320,q-80,fo-auto`}
            alt={primaryPhoto.alt ?? room.name}
            className="h-full w-full object-cover transition-transform
                      duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BedDouble size={28} className="text-[--border-2]" />
          </div>
        )}

        {room.view && (
          <span className="absolute top-3 left-3 rounded-full bg-[--bg]/90
                           px-2.5 py-1 text-[10px] font-medium uppercase
                           tracking-wide text-[--text-color] backdrop-blur-sm">
            {room.view}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-display text-[20px] font-light leading-tight
                        text-[--text-color]">
            {room.name}
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-[18px] font-medium leading-none text-gold">
              ${room.pricePerNight}
            </p>
            <p className="mt-0.5 text-[10px] text-[--text-muted]">/ night</p>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-[13px] font-light leading-relaxed
                      text-[--text-muted]">
          {room.description}
        </p>

        <div className="mb-4 flex items-center gap-3">
          <Spec icon={Users} value={`${room.maxGuests} guests`} />
          <Spec icon={BedDouble} value={`${room.bedrooms} bed`} />
          {room.sizeM2 && <Spec icon={Maximize2} value={`${room.sizeM2}m²`} />}
        </div>

        {activeAmenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {activeAmenities.map(({ key, icon: Icon, label }) => (
              <div
                key={key}
                title={label}
                className="flex items-center gap-1 rounded-md
                          bg-[--surface-2] px-2 py-1"
              >
                <Icon size={11} className="text-teal" />
                <span className="text-[10px] text-[--text-muted]">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2
                        border-t border-[--border-color] text-[11px]
                        font-medium uppercase tracking-widest text-teal">
          View Room
          <ArrowRight size={13} className="transition-transform duration-200
                                            group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function Spec({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[--text-muted]" />
      <span className="text-[12px] text-[--text-muted]">{value}</span>
    </div>
  )
}