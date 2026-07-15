'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

const STATUSES = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
] as const

interface Props {
    activeStatus?: string
    activeSearch?: string
}

export function BookingsFilter({ activeStatus, activeSearch }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [pending, startTransition] = useTransition()
    const [search, setSearch] = useState(activeSearch ?? '')

    function updateParams(updates: Record<string, string | undefined>) {
        const current = new URLSearchParams()
        if (activeStatus) current.set('status', activeStatus)
        if (activeSearch) current.set('search', activeSearch)

        Object.entries(updates).forEach(([k, v]) => {
            if (v) current.set(k, v)
            else current.delete(k)
        })
        current.delete('page')

        startTransition(() => {
            router.push(`${pathname}?${current.toString()}`)
        })
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        updateParams({ search: search || undefined })
    }

    function clearAll() {
        setSearch('')
        startTransition(() => router.push(pathname))
    }

    const hasFilters = !!activeStatus || !!activeSearch

    return (
        <div className="flex flex-col gap-3">

            {/* Search + clear */}
            <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    {pending
                        ? <Loader2 size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2
                           text-[--muted] animate-spin pointer-events-none" />
                        : <Search size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2
                           text-[--muted] pointer-events-none" />
                    }
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search guest name or email…"
                        className="w-full rounded-lg bg-[--surface] pl-9 pr-4 py-2.5
                       text-sm text-[--text-color] font-light shadow-sm
                       placeholder:text-[--muted]
                       border border-[--border-color]
                       focus:outline-none focus:ring-2 focus:ring-teal/20
                       transition-colors"
                    />
                </form>

                {hasFilters && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-1.5 text-[11px]
                       text-[--muted] hover:text-[--text-color]
                       transition-colors"
                    >
                        <X size={13} />
                        Clear
                    </button>
                )}
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
                {STATUSES.map(({ value, label }) => {
                    const active = (activeStatus ?? '') === value
                    return (
                        <button
                            key={label}
                            onClick={() => updateParams({ status: value || undefined })}
                            className={`rounded-full px-4 py-1.5 text-[11px] font-medium
                          tracking-wide transition-all duration-150
                          ${active
                                    ? 'bg-teal text-white shadow-sm'
                                    : 'bg-[--surface] text-[--muted] shadow-sm hover:text-[--text-color]'
                                }`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}