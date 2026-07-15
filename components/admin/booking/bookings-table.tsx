'use client'

import { useMemo, useState }   from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type CellContext,
  type SortingState,
}                              from '@tanstack/react-table'
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Eye,
  CalendarDays,
}                              from 'lucide-react'
import type { BookingWithRelations } from '@/actions/bookings'

// ── Status styles ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  PENDING:     'bg-gold/10 text-gold',
  CONFIRMED:   'bg-teal/10 text-teal',
  CANCELLED:   'bg-red-400/10 text-red-400',
  CHECKED_IN:  'bg-emerald-500/10 text-emerald-500',
  CHECKED_OUT: 'bg-[--surface-2] text-[--muted]',
  NO_SHOW:     'bg-red-400/10 text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:     'Pending',
  CONFIRMED:   'Confirmed',
  CANCELLED:   'Cancelled',
  CHECKED_IN:  'Checked In',
  CHECKED_OUT: 'Checked Out',
  NO_SHOW:     'No Show',
}

// ── Initials ──────────────────────────────────────────────────
function initials(name: string) {
  const p = name.trim().split(' ')
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

// ── Sort icon ─────────────────────────────────────────────────
function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted)           return <ChevronsUpDown size={13} className="text-[--muted]" />
  if (sorted === 'asc')  return <ChevronUp      size={13} className="text-gold"      />
  return                        <ChevronDown     size={13} className="text-gold"      />
}

// ── Columns ───────────────────────────────────────────────────
function useColumns(): ColumnDef<BookingWithRelations>[] {
  return useMemo(() => [
    {
      id:     'guest',
      header: 'Guest',
      accessorFn: (row) => row.user.name,
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-full bg-teal/10 text-teal
                          text-[11px] font-medium">
            {initials(row.original.user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[--text-color]">
              {row.original.user.name}
            </p>
            <p className="truncate text-[11px] text-[--muted]">
              {row.original.user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id:     'room',
      header: 'Room',
      accessorFn: (row) => row.room.name,
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <p className="text-sm text-[--text-color] max-w-35 truncate">
          {row.original.room.name}
        </p>
      ),
    },
    {
      id:     'dates',
      header: 'Stay Dates',
      accessorFn: (row) => new Date(row.checkIn).getTime(),
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <div className="flex items-center gap-1.5 text-[12px] text-[--muted] whitespace-nowrap">
          <CalendarDays size={12} className="shrink-0" />
          {new Date(row.original.checkIn).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
          })}
          {' – '}
          {new Date(row.original.checkOut).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </div>
      ),
    },
    {
      id:     'nights',
      header: 'Nights',
      accessorKey: 'totalNights',
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <span className="text-sm text-[--text-color]">
          {row.original.totalNights}n
        </span>
      ),
    },
    {
      id:     'amount',
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <span className="text-sm font-medium text-gold whitespace-nowrap">
          ${row.original.totalAmount.toFixed(0)}
        </span>
      ),
    },
    {
      id:     'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <span className={`inline-flex rounded-full px-2.5 py-1
                          text-[10px] tracking-wide uppercase font-medium whitespace-nowrap
                          ${STATUS_STYLES[row.original.status] ?? ''}`}>
          {STATUS_LABELS[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      id:     'source',
      header: 'Source',
      accessorKey: 'source',
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <span className="text-[11px] text-[--muted] capitalize">
          {row.original.source.toLowerCase()}
        </span>
      ),
    },
    {
      id:     'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }: CellContext<BookingWithRelations, unknown>) => (
        <Link
          href={`/admin/bookings/${row.original.id}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5
                     bg-[--surface] shadow-sm text-[11px]
                     text-[--muted] hover:text-[--text-color]
                     transition-colors whitespace-nowrap"
        >
          <Eye size={12} />
          View
        </Link>
      ),
    },
  ], [])
}

// ── Component ─────────────────────────────────────────────────
interface Props {
  bookings: BookingWithRelations[]
  total:    number
  page:     number
  pages:    number
}

export function BookingsTable({ bookings, total, page, pages }: Props) {
  const router              = useRouter()
  const columns             = useColumns()
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data:    bookings,
    columns,
    state:   { sorting },
    onSortingChange: setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination:  true,
    pageCount:         pages,
  })

  function goToPage(p: number) {
    const current = new URLSearchParams(window.location.search)
    current.set('page', String(p))
    router.push(`?${current.toString()}`)
  }

  if (bookings.length === 0) {
    return (
      <div className="flex h-52 flex-col items-center justify-center
                      rounded-xl bg-[--surface] shadow-sm gap-2">
        <CalendarDays size={28} className="text-[--muted] opacity-30" />
        <p className="text-sm text-[--muted]">No bookings found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[--surface] shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between
                      px-5 py-3.5">
        <p className="text-[12px] text-[--muted]">
          <span className="font-medium text-[--text-color]">{total}</span>
          {' '}booking{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="bg-[--surface-2]">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-5 py-3 text-left text-[10px]
                                tracking-[0.15em] uppercase font-medium
                                text-[--muted] whitespace-nowrap
                                ${header.column.getCanSort()
                                  ? 'cursor-pointer select-none hover:text-[--text-color]'
                                  : ''
                                }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <SortIcon sorted={header.column.getIsSorted()} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => router.push(`/admin/bookings/${row.original.id}`)}
                className="border-t border-[--border-color]
                           hover:bg-[--bg] transition-colors
                           cursor-pointer"
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-5 py-4 whitespace-nowrap"
                    onClick={
                      cell.column.id === 'actions'
                        ? e => e.stopPropagation()
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between
                        border-t border-[--border-color] px-5 py-3.5">
          <p className="text-[12px] text-[--muted]">
            Page {page} of {pages}
          </p>
          <div className="flex items-center gap-1.5">
            <PageBtn
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft size={15} />
            </PageBtn>
            {/* Page numbers */}
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <PageBtn
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={p === page}
                  active={p === page}
                >
                  {p}
                </PageBtn>
              )
            })}
            <PageBtn
              onClick={() => goToPage(page + 1)}
              disabled={page >= pages}
            >
              <ChevronRight size={15} />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({
  onClick, disabled, active, children,
}: {
  onClick:   () => void
  disabled:  boolean
  active?:   boolean
  children:  React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md
                  text-[12px] font-medium transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${active
                    ? 'bg-teal text-white'
                    : 'bg-[--bg] text-[--muted] hover:text-[--text-color] shadow-sm'
                  }`}
    >
      {children}
    </button>
  )
}