import Link from 'next/link'
import {
  Wifi, Coffee, Wind, Tv2, Sunset,
  Waves, Wine, Droplets,
  BedDouble, Users, Maximize2, MapPin,
  Pencil, Eye,
} from 'lucide-react'
import type { Room } from '@/actions/rooms'

// ── Amenity icon map ──────────────────────────────────────────
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

// ── Status badge colors ───────────────────────────────────────
const ROOM_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-500',
  OCCUPIED: 'bg-red-400/15 text-red-400',
  MAINTENANCE: 'bg-gold/15 text-gold',
}

interface Props {
  room: Room
}

export function RoomCard({ room }: Props) {
  const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]

  const activeAmenities = AMENITY_MAP.filter(
    ({ key }) => room[key as keyof Room] === true
  )

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden
                    border border-[--border-color]
                    bg-[--surface]
                    transition-shadow duration-200 hover:shadow-md">

      {/* ── Photo ── */}
      <div className="relative h-44 bg-[--surface-2] overflow-hidden">
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${primaryPhoto.url}?tr=w-480,h-176,q-80,fo-auto`}
            alt={primaryPhoto.alt ?? room.name}
            className="h-full w-full object-cover transition-transform
                       duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BedDouble size={28} className="text-[--border-2]" />
          </div>
        )}

        {/* Overlay: status badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1
                            text-[10px] font-medium tracking-wide uppercase
                            backdrop-blur-sm ${ROOM_STATUS_COLOR[room.status]}`}>
            {room.status.replace('_', ' ')}
          </span>
        </div>

        {/* Overlay: room number, if set */}
        {room.number && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full px-2.5 py-1
                             text-[10px] font-medium tracking-wide
                             bg-black/40 text-white/80 backdrop-blur-sm">
              № {room.number}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col p-5">

        {/* Name + price */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display text-[20px] font-light
                         text-[--text-color] leading-tight">
            {room.name}
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-[18px] font-medium text-gold leading-none">
              ${room.pricePerNight}
            </p>
            <p className="text-[10px] text-[--text-muted] mt-0.5">
              / night
            </p>
          </div>
        </div>

        {/* Key specs */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Spec icon={Users} value={`${room.maxGuests} guests`} />
          <Spec icon={BedDouble} value={`${room.bedrooms} bed`} />
          {room.sizeM2 && (
            <Spec icon={Maximize2} value={`${room.sizeM2}m²`} />
          )}
          {room.view && (
            <Spec icon={MapPin} value={room.view} />
          )}
        </div>

        {/* Amenity icons */}
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
                <span className="text-[10px] text-[--text-muted]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2 border-t
                        border-[--border-color]">
          <Link
            href={`/admin/rooms/${room.id}`}
            className="flex flex-1 items-center justify-center gap-2
                       rounded-md border border-[--border-color]
                       bg-[--bg] px-3 py-2
                       text-[11px] text-[--text-muted]
                       hover:text-[--text-color] hover:bg-[--surface-2]
                       transition-colors"
          >
            <Pencil size={12} />
            Edit
          </Link>
          <Link
            href={`/rooms/${room.slug}`}
            target="_blank"
            className="flex flex-1 items-center justify-center gap-2
                       rounded-md bg-teal/10 border border-teal/20
                       px-3 py-2 text-[11px] text-teal
                       hover:bg-teal/20 transition-colors"
          >
            <Eye size={12} />
            Preview
          </Link>
        </div>
      </div>
    </div>
  )
}

function Spec({
  icon: Icon,
  value,
}: {
  icon: typeof Users
  value: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-[--text-muted]" />
      <span className="text-[12px] text-[--text-muted]">{value}</span>
    </div>
  )
}