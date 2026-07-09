import type { Metadata } from 'next'
import { getPublicRooms } from '@/actions/rooms'
import { RoomsBrowser } from '@/components/public/rooms-browser'
import { hotelConfig } from '@/config/hotel.config'

export const metadata: Metadata = {
  title: 'Rooms',
  description: `Browse rooms at ${hotelConfig.name} and find your stay.`,
}

export default async function RoomsPage() {
  let rooms: Awaited<ReturnType<typeof getPublicRooms>> = []
  let error: string | null = null

  try {
    rooms = await getPublicRooms()
  } catch (e) {
    console.error('Failed to load public rooms:', e)
    error = 'Could not load rooms right now — please try again later.'
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

      {/* Header */}
      <div className="mb-10 text-center sm:mb-14">
        <p className="mb-2 text-[10px] tracking-[0.3em] uppercase text-gold">
          {hotelConfig.location}
        </p>
        <h1 className="font-display text-[36px] font-light leading-none
                       text-[--text-color] sm:text-[48px]">
          Rooms
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed
                      text-[--text-muted]">
          Each room at {hotelConfig.name} is different — pick the one that fits your stay.
        </p>
        <div className="mx-auto mt-5 h-px w-10 bg-gold" />
      </div>

      {/* Content */}
      {error ? (
        <div className="flex h-64 items-center justify-center rounded-xl
                        border border-[--border-color] bg-[--surface]">
          <p className="text-sm text-[--text-muted]">{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl
                        border border-dashed border-[--border-color] bg-[--surface]">
          <p className="text-sm text-[--text-muted]">
            No rooms are available right now — check back soon.
          </p>
        </div>
      ) : (
        <RoomsBrowser rooms={rooms} />
      )}
    </div>
  )
}