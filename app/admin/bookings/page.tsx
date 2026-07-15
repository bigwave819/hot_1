import type { Metadata }       from 'next'
import { getBookings }         from '@/actions/bookings'
import { BookingsStats }       from '@/components/admin/booking/bookings-stats'
import { BookingsFilter }      from '@/components/admin/booking/bookings-filter'
import { BookingsTable }       from '@/components/admin/booking/bookings-table'

export const metadata: Metadata = { title: 'Bookings' }

interface PageProps {
  searchParams: Promise<{
    status?:   string
    search?:   string
    checkIn?:  string
    checkOut?: string
    page?:     string
  }>
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const result = await getBookings({
    status:   params.status   as any ?? undefined,
    search:   params.search   ?? undefined,
    checkIn:  params.checkIn  ?? undefined,
    checkOut: params.checkOut ?? undefined,
    page:     Number(params.page ?? 1),
    limit:    15,
  })

  // Fetch all for stats — unfiltered, just status breakdown
  const allResult = await getBookings({ page: 1, limit: 1000 })
  const all = allResult.success ? allResult.data.data : []

  const stats = {
    total:     all.length,
    pending:   all.filter(b => b.status === 'PENDING').length,
    confirmed: all.filter(b => b.status === 'CONFIRMED').length,
    checkedIn: all.filter(b => b.status === 'CHECKED_IN').length,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
          Management Portal
        </p>
        <h1 className="font-display text-[32px] font-light
                       text-[--text-color] leading-none">
          Bookings
        </h1>
        <p className="mt-1.5 text-sm text-[--muted] font-light">
          Manage all guest reservations and inquiries.
        </p>
      </div>

      {/* Stats */}
      <BookingsStats stats={stats} />

      {/* Filter bar */}
      <BookingsFilter
        activeStatus={params.status}
        activeSearch={params.search}
      />

      {/* Table */}
      {result.success ? (
        <BookingsTable
          bookings={result.data.data}
          total={result.data.total}
          page={result.data.page}
          pages={result.data.pages}
        />
      ) : (
        <div className="flex h-40 items-center justify-center
                        rounded-xl bg-[--surface] shadow-sm">
          <p className="text-sm text-[--muted]">{result.error}</p>
        </div>
      )}

    </div>
  )
}