import Link from 'next/link'
import type { RoomCell } from '@/actions/dashboard'

interface Props {
  rooms: RoomCell[]
}

const CELL_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-teal/15 text-teal border-teal/20 hover:bg-teal/25',
  OCCUPIED: 'bg-charcoal/80 text-cream/70 border-charcoal/40 hover:bg-charcoal/90',
  MAINTENANCE: 'bg-gold/15 text-gold border-gold/20 hover:bg-gold/25',
}

const LEGEND = [
  { label: 'Available', cls: 'bg-teal/20' },
  { label: 'Occupied', cls: 'bg-charcoal/60' },
  { label: 'Maintenance', cls: 'bg-gold/20' },
]

export function RoomStatusGrid({ rooms }: Props) {
  return (
    <div className="rounded-xl border border-[--border-color]/60
                    bg-[--surface] overflow-hidden h-full">

      {/* Header */}
      <div className="border-b border-[--border-color]/60 px-5 py-4">
        <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--text-muted] font-medium">
          Room Status Grid
        </p>
      </div>

      {/* Grid */}
      <div className="p-5">
        {rooms.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-[--text-muted]">No rooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {rooms.map(room => (
              <Link
                key={room.id}
                href={`/admin/rooms/${room.id}`}
                title={`${room.name} · ${room.status}`}
                className={`flex flex-col items-center justify-center
                            rounded-lg border px-2 py-3
                            text-center transition-colors duration-150
                            ${CELL_STYLES[room.status]}`}
              >
                <span className="text-[13px] font-medium leading-none">
                  {room.number ?? room.name.split(' ')[0]}
                </span>
                <span className="mt-1 text-[9px] tracking-wide uppercase opacity-70">
                  {room.status === 'AVAILABLE'
                    ? 'Free'
                    : room.status === 'OCCUPIED'
                      ? 'Occ'
                      : 'Maint'}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          {LEGEND.map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
              <span className="text-[10px] text-[--text-muted]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}