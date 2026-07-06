import type { Metadata } from 'next'
import { getUsers } from '@/actions/users'
import { GuestStats } from '@/components/admin/guest/guest-stats'
import { GuestsTable } from '@/components/admin/guest/guests-table'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Guests' }

export default async function GuestsPage() {
  const result = await getUsers()

  if (!result.success) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl
                      border border-[--border-color] bg-[--surface]">
        <p className="text-sm text-[--text-muted]">{result.error}</p>
      </div>
    )
  }

  const guests = result.data
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    total: guests.length,
    newThisMonth: guests.filter(g => new Date(g.createdAt) >= thisMonth).length,
    returning: guests.filter(g => (g.bookings ?? []).length > 1).length,
    withActiveBooking: guests.filter(g =>
      (g.bookings ?? []).some(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
    ).length,
  }
  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
            Management Portal
          </p>
          <h1 className="font-display text-[32px] font-light text-[--text-color] leading-none">
            Guests
          </h1>
          <p className="mt-1.5 text-sm text-[--text-muted] font-light">
            Every guest who has stayed at or inquired about Peponi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto
                        rounded-lg border border-[--border-color]
                        bg-[--surface] px-4 py-2.5">
          <Users size={15} className="text-teal" />
          <span className="text-sm font-medium text-[--text-color]">
            {stats.total} total guests
          </span>
        </div>
      </div>

      <GuestStats stats={stats} />
      <GuestsTable guests={guests} />

    </div>
  )
}