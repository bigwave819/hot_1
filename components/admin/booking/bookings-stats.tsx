import {
  CalendarDays, Clock,
  CheckCircle, TrendingUp,
} from 'lucide-react'

interface Props {
  stats: {
    total:     number
    pending:   number
    confirmed: number
    checkedIn: number
  }
}

const CARDS = [
  {
    key:     'total'     as const,
    label:   'Total Bookings',
    icon:    CalendarDays,
    color:   'text-teal',
    bg:      'bg-teal/8',
  },
  {
    key:     'pending'   as const,
    label:   'Pending',
    icon:    Clock,
    color:   'text-gold',
    bg:      'bg-gold/8',
  },
  {
    key:     'confirmed' as const,
    label:   'Confirmed',
    icon:    CheckCircle,
    color:   'text-emerald-500',
    bg:      'bg-emerald-500/8',
  },
  {
    key:     'checkedIn' as const,
    label:   'Checked In',
    icon:    TrendingUp,
    color:   'text-sky-400',
    bg:      'bg-sky-400/8',
  },
] as const

export function BookingsStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-xl bg-[--surface] p-5 shadow-sm"
        >
          <div className={`mb-4 inline-flex h-9 w-9 items-center
                           justify-center rounded-lg ${bg}`}>
            <Icon size={17} className={color} />
          </div>
          <p className="font-display text-[34px] font-light
                        leading-none text-[--text-color]">
            {String(stats[key]).padStart(2, '0')}
          </p>
          <p className="mt-1.5 text-[11px] tracking-widest uppercase
                        text-[--muted] font-medium">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}