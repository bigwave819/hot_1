import { Users, UserPlus, Repeat2, CalendarCheck } from 'lucide-react'

interface Props {
  stats: {
    total: number
    newThisMonth: number
    returning: number
    withActiveBooking: number
  }
}

const CARDS = [
  {
    key: 'total',
    label: 'Total Guests',
    icon: Users,
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
  {
    key: 'newThisMonth',
    label: 'New This Month',
    icon: UserPlus,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    key: 'returning',
    label: 'Returning Guests',
    icon: Repeat2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'withActiveBooking',
    label: 'Active Stays',
    icon: CalendarCheck,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
] as const

export function GuestStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="rounded-xl border border-[--border-color]
                     bg-[--surface] p-5
                     transition-shadow hover:shadow-sm"
        >
          {/* Icon */}
          <div className={`mb-4 inline-flex h-9 w-9 items-center
                           justify-center rounded-lg ${bg}`}>
            <Icon size={17} className={color} />
          </div>

          {/* Number */}
          <p className="font-display text-[34px] font-light leading-none
                        text-[--text-color]">
            {String(stats[key]).padStart(2, '0')}
          </p>

          {/* Label */}
          <p className="mt-1.5 text-[11px] tracking-widest uppercase
                        text-[--text-muted] font-medium">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}