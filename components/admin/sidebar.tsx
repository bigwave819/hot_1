'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Users,
  Images,
  Settings,
  X,
  Gem,
} from 'lucide-react'
import { useSidebar } from './sidebar-context'

// ── Nav config ────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
      { label: 'Rooms', href: '/admin/rooms', icon: BedDouble },
      { label: 'Guests', href: '/admin/guests', icon: Users },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: Images },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
  const { open, close } = useSidebar()

  function isActive(href: string) {
    if (href === '/admin/dashbpard') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col
          border-r border-[--border-color]
          bg-charcoal
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Brand ── */}
        <div className="relative flex flex-col px-6 pb-6 pt-7">

          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="absolute right-4 top-4 p-1.5 rounded-md
                       text-[--text-muted] hover:text-cream
                       hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>

          {/* Gem icon + hotel name */}
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center
                            rounded-md bg-gold/15">
              <Gem size={15} className="text-gold" />
            </div>
            <div>
              <p className="font-display text-[20px] font-light leading-none text-cream">
                Peponi
              </p>
            </div>
          </div>

          <p className="ml-10.5 text-[9px] tracking-[0.3em] uppercase text-gold/70">
            Living Spaces
          </p>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <div className="h-0.75 w-0.75 rotate-45 bg-gold/50" />
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* "Management Portal" tag */}
          <p className="mt-3 text-center text-[9px] tracking-[0.25em] uppercase
                        text-[--text-muted]">
            Management Portal
          </p>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">

              {/* Section label */}
              <p className="mb-1.5 px-3 text-[9px] tracking-[0.25em] uppercase
                             text-gold/50 font-medium">
                {group.label}
              </p>

              {/* Items */}
              <ul className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        className={`
                          group flex items-center gap-3 rounded-md px-3 py-2.5
                          text-sm font-light transition-all duration-150
                          border-l-2
                          ${active
                            ? 'border-gold bg-gold/10 text-cream'
                            : 'border-transparent text-[#9A9080] hover:bg-white/5 hover:text-cream'
                          }
                        `}
                      >
                        <Icon
                          size={16}
                          className={`shrink-0 transition-colors ${active
                            ? 'text-gold'
                            : 'text-[#6A6460] group-hover:text-cream/70'
                            }`}
                        />
                        <span>{label}</span>

                        {/* Active dot */}
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── User card ── */}
        <UserCard />
      </aside>
    </>
  )
}

// ── User card at bottom of sidebar ───────────────────────────
function UserCard() {
  return (
    <div className="border-t border-white/8 px-4 py-4">
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full bg-teal text-cream text-xs font-medium">
          A
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-cream">
            Admin User
          </p>
          <p className="text-[10px] tracking-wide text-gold/60 uppercase">
            Owner Access
          </p>
        </div>

      </div>
    </div>
  )
}