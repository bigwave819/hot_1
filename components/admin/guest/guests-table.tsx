'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type CellContext,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Mail,
  Phone,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type Booking = {
  id: string
  status: string
  checkIn: Date
  checkOut: Date
}

type Guest = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  nationality: string | null
  createdAt: Date
  bookings?: Booking[]
}

const router = useRouter()

// ── Booking status badge ───────────────────────────────────────
function BookingsBadge({ count }: { count: number }) {
  if (count === 0) return (
    <span className="text-[11px] text-[--text-muted]">—</span>
  )
  return (
    <span className="inline-flex items-center rounded-full
                     bg-teal/10 px-2.5 py-0.5
                     text-[11px] font-medium text-teal">
      {count} {count === 1 ? 'stay' : 'stays'}
    </span>
  )
}

// ── Sort icon helper ──────────────────────────────────────────
function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ChevronsUpDown size={13} className="text-[--text-muted]" />
  if (sorted === 'asc') return <ChevronUp size={13} className="text-gold" />
  return <ChevronDown size={13} className="text-gold" />
}

// ── Column definitions ────────────────────────────────────────
function useColumns(): ColumnDef<Guest>[] {
  return useMemo(() => [
    {
      id: 'name',
      header: 'Guest',
      accessorFn: (row: Guest) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }: CellContext<Guest, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-full bg-teal/15 text-teal text-[11px] font-medium">
            {row.original.firstName[0]}{row.original.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-[--text-color]">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-[11px] text-[--text-muted] flex items-center gap-1 mt-0.5">
              <Mail size={10} />
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      cell: ({ row }: CellContext<Guest, unknown>) => {
        const v = row.original.phone
        return v
          ? <span className="flex items-center gap-1.5 text-sm text-[--text-color]">
            <Phone size={12} className="text-[--text-muted]" />{v}
          </span>
          : <span className="text-[11px] text-[--text-muted]">—</span>
      },
    },
    {
      id: 'nationality',
      header: 'Nationality',
      accessorKey: 'nationality',
      cell: ({ row }: CellContext<Guest, unknown>) => {
        const v = row.original.nationality
        return v
          ? <span className="flex items-center gap-1.5 text-sm text-[--text-color]">
            <Globe size={12} className="text-[--text-muted]" />{v}
          </span>
          : <span className="text-[11px] text-[--text-muted]">—</span>
      },
    },
    {
      id: 'bookings',
      header: 'Stays',
      accessorFn: (row: Guest) => row.bookings?.length ?? 0,
      cell: ({ row }: CellContext<Guest, unknown>) => (
        <BookingsBadge count={row.original.bookings?.length ?? 0} />
      ),
    },
    {
      id: 'lastStay',
      header: 'Last Stay',
      accessorFn: (row: Guest) => {
        const sorted = [...(row.bookings ?? [])].sort(
          (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
        )
        return sorted[0]?.checkIn ?? null
      },
      cell: ({ row }: CellContext<Guest, unknown>) => {
        const sorted = [...(row.original.bookings ?? [])].sort(
          (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
        )
        const date = sorted[0]?.checkIn ?? null
        return date
          ? <span className="text-sm text-[--text-color]">
            {new Date(date).toLocaleDateString('en-US', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </span>
          : <span className="text-[11px] text-[--text-muted]">No stays yet</span>
      },
    },
    {
      id: 'joined',
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ row }: CellContext<Guest, unknown>) => (
        <span className="text-sm text-[--text-muted]">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }: CellContext<Guest, unknown>) => (
        <button
          onClick={e => {
            e.stopPropagation()
            router.push(`/admin/guests/${row.original.id}`)
          }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5
                     border border-[--border-color]
                     bg-[--surface] hover:bg-[--surface-2]
                     text-[11px] text-[--text-muted] hover:text-[--text-color]
                     transition-colors duration-150"
        >
          <Eye size={12} />
          View
        </button>
      ),
    },  ], [])
}

// ── Main component ────────────────────────────────────────────
export function GuestsTable({ guests }: { guests: Guest[] }) {
  
  const columns = useColumns()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: guests,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="rounded-xl border border-[--border-color]
                    bg-[--surface] overflow-hidden">

      {/* ── Table toolbar ── */}
      <div className="flex flex-col gap-3 border-b border-[--border-color]
                      px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2
                       text-[--text-muted] pointer-events-none"
          />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search guests..."
            className="w-full rounded-md border border-[--border-color]
                       bg-[--bg] pl-9 pr-4 py-2.5
                       text-sm font-light text-[--text-color]
                       placeholder:text-[--text-muted]
                       focus:outline-none focus:border-teal
                       transition-colors duration-200"
          />
        </div>

        {/* Row count */}
        <p className="shrink-0 text-[12px] text-[--text-muted]">
          {table.getFilteredRowModel().rows.length} guests
        </p>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}
                className="border-b border-[--border-color]">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`
                      px-5 py-3 text-left
                      text-[10px] tracking-[0.15em] uppercase
                      font-medium text-[--text-muted]
                      whitespace-nowrap
                      ${header.column.getCanSort()
                        ? 'cursor-pointer select-none hover:text-[--text-color]'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-16 text-center text-sm
                             text-[--text-muted]"
                >
                  No guests found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/admin/guests/${row.original.id}`)}
                  className="border-b border-[--border-color] last:border-0
                             hover:bg-[--bg] transition-colors duration-100
                             cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-5 py-4 whitespace-nowrap"
                      onClick={
                        // Prevent row click on the action button cell
                        cell.column.id === 'actions'
                          ? e => e.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between border-t
                      border-[--border-color] px-5 py-3">
        <p className="text-[12px] text-[--text-muted]">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </p>

        <div className="flex items-center gap-1.5">
          <PaginationBtn
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={15} />
          </PaginationBtn>
          <PaginationBtn
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={15} />
          </PaginationBtn>
        </div>
      </div>
    </div>
  )
}

// ── Pagination button ─────────────────────────────────────────
function PaginationBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md
                 border border-[--border-color]
                 bg-[--bg] text-[--text-muted]
                 hover:bg-[--surface] hover:text-[--text-color]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-colors duration-150"
    >
      {children}
    </button>
  )
}