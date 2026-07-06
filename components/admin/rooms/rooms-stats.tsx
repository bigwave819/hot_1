import { BedDouble, CheckCircle2, XCircle, Wrench } from 'lucide-react'

interface Props {
  stats: {
    total:       number
    available:   number
    occupied:    number
    maintenance: number
  }
}

const CARDS = [
  {
    key:   'total',
    label: 'Total Rooms',
    icon:  BedDouble,
    color: 'text-teal',
    bg:    'bg-teal/10',
  },
  {
    key:   'available',
    label: 'Available',
    icon:  CheckCircle2,
    color: 'text-emerald-500',
    bg:    'bg-emerald-500/10',
  },
  {
    key:   'occupied',
    label: 'Occupied',
    icon:  XCircle,
    color: 'text-red-400',
    bg:    'bg-red-400/10',
  },
  {
    key:   'maintenance',
    label: 'Maintenance',
    icon:  Wrench,
    color: 'text-gold',
    bg:    'bg-gold/10',
  },
] as const

export function RoomsStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-xl border border-[--border-color]
                     bg-[--surface] p-5"
        >
          <div className={`mb-4 inline-flex h-9 w-9 items-center
                           justify-center rounded-lg ${bg}`}>
            <Icon size={17} className={color} />
          </div>
          <p className="font-display text-[34px] font-light leading-none
                        text-[--text-color]">
            {String(stats[key]).padStart(2, '0')}
          </p>
          <p className="mt-1.5 text-[11px] tracking-widest uppercase
                        text-[--text-muted] font-medium">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}