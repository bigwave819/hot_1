import type { Metadata } from 'next'
import Link              from 'next/link'
import { ArrowLeft }     from 'lucide-react'
import { RoomForm }      from '@/components/admin/rooms/room-form'

export const metadata: Metadata = { title: 'Add Room' }

export default function NewRoomPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/rooms"
              className="mb-4 inline-flex items-center gap-2 text-sm
                         text-[--text-muted] hover:text-[--text-color] transition-colors">
          <ArrowLeft size={14} />
          Back to Rooms
        </Link>
        <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
          Management Portal
        </p>
        <h1 className="font-display text-[32px] font-light text-[--text-color] leading-none">
          Add Room
        </h1>
        <p className="mt-1.5 text-sm text-[--text-muted] font-light">
          Add a new room available at Peponi.
        </p>
      </div>
      <RoomForm />
    </div>
  )
}