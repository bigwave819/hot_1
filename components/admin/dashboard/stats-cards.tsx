import {
  BedDouble, CheckCircle,
  Clock, DollarSign,
} from 'lucide-react'
import type { DashboardStats } from '@/actions/dashboard'

interface Props {
  stats: DashboardStats
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Rooms',
      value: stats.rooms.total,
      sub: `${stats.rooms.available} available`,
      icon: BedDouble,
      iconCls: 'text-teal',
      bgCls: 'bg-teal/8',
      isText: false,
    },
    {
      label: 'Available',
      value: stats.rooms.available,
      sub: `${stats.rooms.occupied} occupied`,
      icon: CheckCircle,
      iconCls: 'text-emerald-500',
      bgCls: 'bg-emerald-500/8',
      isText: false,
    },
    {
      label: 'Pending',
      value: stats.bookings.pending,
      sub: `${stats.bookings.thisMonth} bookings this month`,
      icon: Clock,
      iconCls: 'text-gold',
      bgCls: 'bg-gold/8',
      isText: false,
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.thisMonth.toLocaleString()}`,
      sub: 'This month · confirmed',
      icon: DollarSign,
      iconCls: 'text-teal',
      bgCls: 'bg-teal/8',
      isText: true,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, sub, icon: Icon, iconCls, bgCls, isText }) => (
        <div
          key={label}
          className="rounded-xl border border-[--border-color]/60
                     bg-[--surface] p-5 space-y-3"
        >
          <div className={`inline-flex h-9 w-9 items-center
                           justify-center rounded-lg ${bgCls}`}>
            <Icon size={17} className={iconCls} />
          </div>

          <div>
            <p className={`leading-none text-[--text-color] font-light
                           ${isText
                ? 'text-[22px] font-medium'
                : 'font-display text-[34px]'
              }`}>
              {isText
                ? value
                : String(value as number).padStart(2, '0')
              }
            </p>
            <p className="mt-1 text-[10px] tracking-widest uppercase
                          text-[--text-muted] font-medium">
              {label}
            </p>
          </div>

          <p className="text-[11px] text-[--text-muted]/70 font-light">
            {sub}
          </p>
        </div>
      ))}
    </div>
  )
}