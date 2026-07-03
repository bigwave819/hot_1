'use client'

import { usePathname } from 'next/navigation'
import { Menu }        from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { UserMenu }    from './user-menu'
import { useSidebar }  from './sidebar-context'

// Map routes → readable titles
const PAGE_TITLES: Record<string, string> = {
  '/admin':           'Dashboard',
  '/admin/bookings':  'Bookings',
  '/admin/rooms':     'Rooms',
  '/admin/guests':    'Guests',
  '/admin/gallery':   'Gallery',
  '/admin/settings':  'Settings',
}

export function Topbar() {
  const pathname     = usePathname()
  const { toggle }   = useSidebar()
  const title        = PAGE_TITLES[pathname] ?? 'Admin'

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between
                 border-b border-[--border-color]
                 bg-[--bg]/90 backdrop-blur-sm
                 px-4 lg:px-6"
    >
      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-md
                     border border-[--border-color]
                     bg-[--surface]
                     text-[--text-muted] hover:text-[--text-color]
                     transition-colors lg:hidden"
        >
          <Menu size={17} />
        </button>

        {/* Page title */}
        <div>
          <h1 className="font-display text-[22px] font-light
                         text-[--text-color] leading-none">
            {title}
          </h1>
          <p className="text-[10px] tracking-[0.2em] uppercase
                        text-[--text-muted] mt-0.5">
            Peponi Living Spaces
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}