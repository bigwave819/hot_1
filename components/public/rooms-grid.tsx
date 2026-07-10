'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Users, BedDouble, Maximize2,
    Wifi, Coffee, Waves, Wind,
    Sunset, Wine, Droplets, Tv2,
    ArrowRight, SlidersHorizontal, X,
    MapPin,
} from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'

// ── Amenity config ────────────────────────────────────────────
const AMENITIES = [
    { key: 'hasWifi', label: 'WiFi', icon: Wifi },
    { key: 'hasBreakfast', label: 'Breakfast', icon: Coffee },
    { key: 'hasPoolAccess', label: 'Pool', icon: Waves },
    { key: 'hasAC', label: 'Air Con', icon: Wind },
    { key: 'hasBalcony', label: 'Balcony', icon: Sunset },
    { key: 'hasMinibar', label: 'Minibar', icon: Wine },
    { key: 'hasHotWater', label: 'Hot Water', icon: Droplets },
    { key: 'hasTv', label: 'TV', icon: Tv2 },
] as const

type AmenityKey = typeof AMENITIES[number]['key']
type SortOption = 'price_asc' | 'price_desc' | 'name'

// ── Main component ────────────────────────────────────────────
interface Props { rooms: PublicRoom[] }

export function RoomsGrid({ rooms }: Props) {
    const [minGuests, setMinGuests] = useState(1)
    const [activeAmenities, setActiveAmenities] = useState<AmenityKey[]>([])
    const [sortBy, setSortBy] = useState<SortOption>('price_asc')
    const [filterOpen, setFilterOpen] = useState(false)

    function toggleAmenity(key: AmenityKey) {
        setActiveAmenities(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    const filtered = useMemo(() => {
        let result = rooms.filter(r => r.maxGuests >= minGuests)

        if (activeAmenities.length > 0) {
            result = result.filter(r =>
                activeAmenities.every(key => r[key as keyof PublicRoom] === true)
            )
        }

        return [...result].sort((a, b) => {
            if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight
            if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight
            return a.name.localeCompare(b.name)
        })
    }, [rooms, minGuests, activeAmenities, sortBy])

    const hasFilters = minGuests > 1 || activeAmenities.length > 0

    function clearFilters() {
        setMinGuests(1)
        setActiveAmenities([])
        setSortBy('price_asc')
    }

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">

                {/* ── Toolbar ── */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center
                        sm:justify-between">

                    {/* Left: result count + clear */}
                    <div className="flex items-center gap-3">
                        <p className="text-[13px] text-[--muted]">
                            <span className="font-medium text-[--text-color]">
                                {filtered.length}
                            </span>
                            {' '}of {rooms.length} rooms
                        </p>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-[11px] text-gold
                           hover:text-gold-light transition-colors"
                            >
                                <X size={12} />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Right: sort + filter toggle */}
                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as SortOption)}
                            className="rounded-lg px-3 py-2 text-[12px] font-medium
                         bg-[--surface] text-[--text-color]
                         border border-[--border-color]
                         focus:outline-none focus:ring-2 focus:ring-teal/20
                         cursor-pointer"
                        >
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name">Name A–Z</option>
                        </select>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setFilterOpen(p => !p)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2
                          text-[12px] font-medium transition-colors
                          ${filterOpen
                                    ? 'bg-teal text-white'
                                    : 'bg-[--surface] text-[--text-color] hover:bg-[--surface-2]'
                                }`}
                        >
                            <SlidersHorizontal size={13} />
                            Filter
                            {hasFilters && (
                                <span className="flex h-4 w-4 items-center justify-center
                                 rounded-full bg-gold text-[9px] text-white font-bold">
                                    {(minGuests > 1 ? 1 : 0) + activeAmenities.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Filter panel ── */}
                {filterOpen && (
                    <div className="mb-8 rounded-2xl bg-[--surface] p-6 shadow-sm">
                        <div className="grid gap-8 sm:grid-cols-2">

                            {/* Guests */}
                            <div>
                                <p className="text-[10px] tracking-[0.2em] uppercase
                              text-[--muted] font-medium mb-4">
                                    Minimum Guests
                                </p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setMinGuests(n)}
                                            className={`flex h-10 w-10 items-center justify-center
                                  rounded-lg text-sm font-medium transition-colors
                                  ${minGuests === n
                                                    ? 'bg-teal text-white'
                                                    : 'bg-[--surface-2] text-[--text-color] hover:bg-[--surface-2]'
                                                }`}
                                        >
                                            {n === 4 ? '4+' : n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <p className="text-[10px] tracking-[0.2em] uppercase
                              text-[--muted] font-medium mb-4">
                                    Amenities
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {AMENITIES.map(({ key, label, icon: Icon }) => {
                                        const active = activeAmenities.includes(key)
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => toggleAmenity(key)}
                                                className={`flex items-center gap-1.5 rounded-full
                                    px-3 py-1.5 text-[11px] font-medium
                                    transition-all duration-150
                                    ${active
                                                        ? 'bg-teal text-white'
                                                        : 'bg-[--surface-2] text-[--muted] hover:text-[--text-color]'
                                                    }`}
                                            >
                                                <Icon size={11} />
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Grid ── */}
                {filtered.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center
                          gap-3 rounded-2xl bg-[--surface]">
                        <BedDouble size={32} className="text-[--muted] opacity-40" />
                        <p className="text-[--muted]">No rooms match your filters.</p>
                        <button
                            onClick={clearFilters}
                            className="text-[12px] text-gold hover:text-gold-light
                         transition-colors underline-offset-2 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(room => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                )}

            </div>
        </section>
    )
}

// ── Room card ─────────────────────────────────────────────────
const CARD_AMENITIES = [
    { key: 'hasWifi', icon: Wifi, label: 'WiFi' },
    { key: 'hasBreakfast', icon: Coffee, label: 'Breakfast' },
    { key: 'hasPoolAccess', icon: Waves, label: 'Pool' },
    { key: 'hasBalcony', icon: Sunset, label: 'Balcony' },
] as const

function RoomCard({ room }: { room: PublicRoom }) {
    const primaryPhoto = room.photos.find(p => p.isPrimary) ?? room.photos[0]
    const activeAmenities = CARD_AMENITIES.filter(
        ({ key }) => room[key as keyof PublicRoom] === true
    )

    return (
        <Link
            href={`/rooms/${room.slug}`}
            className="group flex flex-col bg-[--surface] rounded-2xl
                 overflow-hidden shadow-sm
                 hover:shadow-md transition-all duration-300"
        >
            {/* Photo */}
            <div className="relative h-56 overflow-hidden bg-[--surface-2]">
                {primaryPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={`${primaryPhoto.url}?tr=w-600,h-448,q-80,fo-auto`}
                        alt={primaryPhoto.alt ?? room.name}
                        className="h-full w-full object-cover
                       transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <BedDouble size={28} className="text-[--muted] opacity-30" />
                    </div>
                )}

                {/* Price badge */}
                <div className="absolute bottom-3 right-3 rounded-lg
                        bg-white/95 dark:bg-[#1E1B18]/95 px-3 py-1.5 shadow-sm">
                    <span className="text-gold font-semibold text-[15px]">
                        ${room.pricePerNight}
                    </span>
                    <span className="text-[--muted] text-[10px]"> /night</span>
                </div>

                {/* View badge on hover */}
                {room.view && (
                    <div className="absolute top-3 left-3 flex items-center gap-1
                          rounded-full bg-black/30 backdrop-blur-sm
                          px-2.5 py-1">
                        <MapPin size={10} className="text-white/70" />
                        <span className="text-[10px] text-white/70">{room.view}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-5">

                <h2 className="font-display text-[22px] font-light
                       text-[--text-color] leading-tight mb-2">
                    {room.name}
                </h2>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-3">
                    <Spec icon={Users} value={`${room.maxGuests} guests`} />
                    <Spec icon={BedDouble} value={room.beds ?? `${room.bedrooms} bed`} />
                    {room.sizeM2 && (
                        <Spec icon={Maximize2} value={`${room.sizeM2}m²`} />
                    )}
                </div>

                {/* Description */}
                <p className="text-[--muted] text-sm leading-relaxed
                      font-light line-clamp-2 flex-1 mb-4">
                    {room.description}
                </p>

                {/* Amenity pills */}
                {activeAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {activeAmenities.map(({ key, icon: Icon, label }) => (
                            <div key={key}
                                className="flex items-center gap-1 rounded-full
                              bg-teal/8 px-2.5 py-1">
                                <Icon size={10} className="text-teal" />
                                <span className="text-[10px] text-teal font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3
                        border-t border-[--border-color]">
                    <span className="text-[11px] tracking-[0.15em] uppercase
                           font-medium text-[--text-color]
                           group-hover:text-gold transition-colors duration-200">
                        View Room
                    </span>
                    <ArrowRight
                        size={14}
                        className="text-[--text-color] group-hover:text-gold
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
            <Icon size={12} className="text-[--muted]" />
            <span className="text-[12px] text-[--muted]">{value}</span>
        </div>
    )
}