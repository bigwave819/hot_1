'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, Users } from 'lucide-react'
import { PublicRoomCard } from './public-room-card'
import type { PublicRoom } from '@/actions/rooms'

type SortKey = 'price-asc' | 'price-desc'

export function RoomsBrowser({ rooms }: { rooms: PublicRoom[] }) {
  const [sort, setSort] = useState<SortKey>('price-asc')
  const [minGuests, setMinGuests] = useState(0)

  const maxGuestsAvailable = useMemo(
    () => Math.max(...rooms.map(r => r.maxGuests), 1),
    [rooms]
  )

  const filtered = useMemo(() => {
    const list = minGuests === 0
      ? rooms
      : rooms.filter(r => r.maxGuests >= minGuests)

    return [...list].sort((a, b) =>
      sort === 'price-asc'
        ? a.pricePerNight - b.pricePerNight
        : b.pricePerNight - a.pricePerNight
    )
  }, [rooms, minGuests, sort])

  return (
    <div className="space-y-6">

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[--text-muted]" />
          <label className="text-[11px] tracking-wide text-[--text-muted]" htmlFor="min-guests">
            Guests
          </label>
          <select
            id="min-guests"
            value={minGuests}
            onChange={e => setMinGuests(Number(e.target.value))}
            className="rounded-md border border-[--border-color] bg-[--surface]
                      px-3 py-2 text-sm text-[--text-color]
                      focus:outline-none focus:border-teal transition-colors"
          >
            <option value={0}>Any</option>
            {Array.from({ length: maxGuestsAvailable }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-[--text-muted]" />
          <label className="text-[11px] tracking-wide text-[--text-muted]" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="rounded-md border border-[--border-color] bg-[--surface]
                      px-3 py-2 text-sm text-[--text-color]
                      focus:outline-none focus:border-teal transition-colors"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <p className="text-[12px] text-[--text-muted] sm:ml-auto">
          {filtered.length} {filtered.length === 1 ? 'room' : 'rooms'}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2
                        rounded-xl border border-dashed border-[--border-color]
                        bg-[--surface]">
          <p className="text-sm text-[--text-muted]">
            No rooms fit that many guests right now.
          </p>
          <button
            type="button"
            onClick={() => setMinGuests(0)}
            className="text-[12px] text-gold hover:text-gold-light
                      transition-colors underline-offset-2 hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(room => (
            <PublicRoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}