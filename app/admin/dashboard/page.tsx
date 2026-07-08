import type { Metadata } from 'next'
import { getDashboardStats, getRecentBookings, getRoomCells } from '@/actions/dashboard'
import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { RecentBookingsTable } from '@/components/admin/dashboard/recent-bookings'
import { RoomStatusGrid } from '@/components/admin/dashboard/room-grid'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const [statsResult, bookingsResult, roomsResult] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(),
    getRoomCells(),
  ])

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
          Management Portal
        </p>
        <h1 className="font-display text-[32px] font-light
                       text-[--text-color] leading-none">
          Occupancy Snapshot
        </h1>
        <p className="mt-1.5 text-sm text-[--text-muted] font-light">
          Live overview of rooms, bookings and revenue.
        </p>
      </div>

      {/* ── Stat cards ── */}
      {statsResult.success && (
        <StatsCards stats={statsResult.data} />
      )}

      {/* ── Bottom grid ── */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Recent bookings — 3/5 */}
        <div className="lg:col-span-3">
          {bookingsResult.success && (
            <RecentBookingsTable bookings={bookingsResult.data} />
          )}
        </div>

        {/* Room status grid — 2/5 */}
        <div className="lg:col-span-2">
          {roomsResult.success && (
            <RoomStatusGrid rooms={roomsResult.data} />
          )}
        </div>

      </div>
    </div>
  )
}