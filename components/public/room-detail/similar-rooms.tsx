import Link                from 'next/link'
import { ArrowRight, BedDouble, Users } from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'

interface Props { rooms: PublicRoom[] }

export function SimilarRooms({ rooms }: Props) {
  return (
    <section className="bg-[--surface] py-16 px-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase
                          text-gold font-medium mb-3">
              Also Available
            </p>
            <h2 className="font-display text-[36px] font-light
                           text-[--text-color] leading-none">
              Similar Rooms
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-1.5 text-[11px]
                       tracking-[0.2em] uppercase font-medium
                       text-[--muted] hover:text-gold transition-colors"
          >
            All rooms
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map(room => {
            const photo = room.photos.find(p => p.isPrimary) ?? room.photos[0]
            return (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="group flex flex-col bg-[--bg] rounded-xl
                           overflow-hidden shadow-sm hover:shadow-md
                           transition-shadow duration-300"
              >
                <div className="relative h-44 overflow-hidden bg-[--surface-2]">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${photo.url}?tr=w-480,h-352,q-80,fo-auto`}
                      alt={photo.alt ?? room.name}
                      className="h-full w-full object-cover
                                 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BedDouble size={24} className="text-[--muted] opacity-30" />
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 rounded-lg
                                  bg-white/95 dark:bg-[#1E1B18]/95
                                  px-3 py-1.5 shadow-sm">
                    <span className="text-gold font-semibold text-[14px]">
                      ${room.pricePerNight}
                    </span>
                    <span className="text-[--muted] text-[10px]"> /night</span>
                  </div>
                </div>

                <div className="flex flex-col p-5">
                  <h3 className="font-display text-[20px] font-light
                                 text-[--text-color] mb-2">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-[--muted]" />
                      <span className="text-[12px] text-[--muted]">
                        {room.maxGuests} guests
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble size={12} className="text-[--muted]" />
                      <span className="text-[12px] text-[--muted]">
                        {room.bedrooms} bed
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3
                                  border-t border-[--border-color]">
                    <span className="text-[11px] tracking-[0.15em] uppercase
                                     font-medium text-[--text-color]
                                     group-hover:text-gold transition-colors">
                      View Room
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-[--text-color] group-hover:text-gold
                                 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}