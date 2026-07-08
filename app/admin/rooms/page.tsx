import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, BedDouble } from 'lucide-react'
import { getRooms } from '@/actions/rooms'
import { RoomsStats } from '@/components/admin/rooms/rooms-stats'
import { RoomCard } from '@/components/admin/rooms/room-card'

export const metadata: Metadata = { title: 'Rooms' }

export default async function RoomsPage() {
  const result = await getRooms()

  if (!result.success) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl
                      border border-[--border-color] bg-[--surface]">
        <p className="text-sm text-[--text-muted]">{result.error}</p>
      </div>
    )
  }

  const roomsList = result.data

  const stats = {
    total: roomsList.length,
    available: roomsList.filter(r => r.status === 'AVAILABLE').length,
    occupied: roomsList.filter(r => r.status === 'OCCUPIED').length,
    maintenance: roomsList.filter(r => r.status === 'MAINTENANCE').length,
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
            Management Portal
          </p>
          <h1 className="font-display text-[32px] font-light
                         text-[--text-color] leading-none">
            Rooms
          </h1>
          <p className="mt-1.5 text-sm text-[--text-muted] font-light">
            Manage rooms, pricing, amenities and photos.
          </p>
        </div>

        <Link href="/admin/rooms/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-md
                         bg-teal px-4 py-2.5 text-[11px] tracking-[0.15em]
                         uppercase font-medium text-cream
                         hover:bg-teal-light transition-colors">
          <Plus size={14} />
          Add Room
        </Link>
      </div>

      <RoomsStats stats={stats} />

      {roomsList.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center
                        rounded-xl border border-dashed border-[--border-color]
                        bg-[--surface] gap-3">
          <div className="flex h-12 w-12 items-center justify-center
                          rounded-full bg-[--surface-2]">
            <BedDouble size={20} className="text-[--text-muted]" />
          </div>
          <p className="text-sm text-[--text-muted]">No rooms yet.</p>
          <Link href="/admin/rooms/new"
            className="text-[12px] text-gold hover:text-gold-light
                           transition-colors underline-offset-2 hover:underline">
            Add your first room
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roomsList.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}