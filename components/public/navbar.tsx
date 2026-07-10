'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Menu, X, Sun, Moon,
  BookOpen, LayoutDashboard,
  LogOut, ChevronDown,
} from 'lucide-react'
import { hotelConfig } from '@/config/hotel.config'
import { authClient } from '@/lib/auth-client'

const NAV_LINKS = [
  { label: 'Rooms', href: '/rooms' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '#contact' },
]

// ── Helper: initials from full name ──────────────────────────
function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const p = trimmed.split(' ')
  return p.length === 1
    ? p[0][0]?.toUpperCase() ?? '?'
    : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}
// ── Main component ────────────────────────────────────────────
export function PublicNavbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    setMounted(true)
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenu])

  const isDark = mounted && theme === 'dark'
  const userRole = (session?.user as any)?.role ?? 'guest'
  const isStaff = session?.user && ['admin', 'staff'].includes(userRole)
  const isGuest = session?.user && !isStaff
  const userName = session?.user?.name ?? ''

  async function handleSignOut() {
    await authClient.signOut()
    setMenuOpen(false)
    setUserMenu(false)
    router.push('/')
    router.refresh()
  }

  // When scrolled: bg adapts to theme. Not scrolled: transparent.
  const headerCls = scrolled
    ? 'backdrop-blur-md shadow-sm py-3'
    : 'bg-transparent py-5'

  // Text color when scrolled adapts to theme, not scrolled = always white
  const navTextCls = scrolled
    ? 'text-white/90 hover:text-gold'
    : 'text-white/90 hover:text-white'

  const logoTextCls = scrolled ? 'text-[--text-color]' : 'text-white'

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerCls}`}>
        <div className="mx-auto flex max-w-7xl items-center
                        justify-between px-6 lg:px-10">

          {/* ── Logo ── */}
          <Link href="/" className="flex flex-col leading-none">
            <span className={`font-display text-[28px] font-light
                              tracking-wide transition-colors duration-300
                              ${logoTextCls}`}>
              Peponi
            </span>
            <span className="text-[9px] tracking-[0.35em] uppercase text-gold">
              Living Spaces
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-[12px] tracking-[0.2em] uppercase
                            font-medium transition-colors duration-200
                            ${navTextCls}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className={`flex h-9 w-9 items-center justify-center
                            rounded-full transition-colors duration-200
                            ${scrolled
                    ? 'text-[--text-color] hover:bg-[--surface]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {isDark
                  ? <Sun size={17} />
                  : <Moon size={17} />
                }
              </button>
            )}

            {/* Auth — desktop only */}
            {!isPending && (
              <div className="hidden md:flex items-center gap-2">
                {!session?.user ? (
                  // Not logged in
                  <Link
                    href="/login"
                    className={`text-[11px] tracking-[0.15em] uppercase
                                font-medium transition-colors duration-200
                                ${scrolled
                        ? 'text-[--text-color] hover:text-gold'
                        : 'text-white/80 hover:text-white'
                      }`}
                  >
                    Sign In
                  </Link>
                ) : (
                  // Logged in — user menu
                  <div className="relative" data-user-menu>
                    <button
                      onClick={() => setUserMenu(p => !p)}
                      className={`flex items-center gap-2 rounded-full
                                  transition-colors duration-200
                                  ${scrolled
                          ? 'hover:bg-[--surface]'
                          : 'hover:bg-white/10'
                        }`}
                    >
                      {/* Avatar */}
                      <div className="flex h-8 w-8 items-center justify-center
                                      rounded-full bg-teal text-white text-[11px]
                                      font-medium">
                        {initials(userName)}
                      </div>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200
                                    ${userMenu ? 'rotate-180' : ''}
                                    ${scrolled ? 'text-[--muted]' : 'text-white/60'}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {userMenu && (
                      <div className="absolute right-0 top-full mt-3 w-52
                                      rounded-xl bg-[--bg] shadow-xl overflow-hidden
                                      border border-[--border-color]">
                        {/* User info */}
                        <div className="px-4 py-3 bg-[--surface]">
                          <p className="text-[13px] font-medium text-[--text-color]
                                        truncate">
                            {userName}
                          </p>
                          <p className="text-[11px] text-[--muted] truncate">
                            {session.user.email}
                          </p>
                        </div>

                        {/* Links */}
                        <div className="py-1">
                          {isStaff ? (
                            <MenuLink
                              href="/admin"
                              icon={LayoutDashboard}
                              label="Admin Dashboard"
                              onClick={() => setUserMenu(false)}
                            />
                          ) : (
                            <MenuLink
                              href="/dashboard/bookings"
                              icon={BookOpen}
                              label="My Bookings"
                              onClick={() => setUserMenu(false)}
                            />
                          )}
                        </div>

                        {/* Sign out */}
                        <div className="border-t border-[--border-color] py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3
                                       px-4 py-2.5 text-sm text-red-400
                                       hover:bg-red-500/5 transition-colors"
                          >
                            <LogOut size={14} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reserve CTA — desktop */}
            <Link
              href="/book"
              className="hidden md:flex items-center rounded-md
                         bg-teal px-5 py-2.5 ml-1
                         text-[11px] tracking-[0.2em] uppercase
                         font-medium text-white hover:bg-teal-light
                         transition-colors duration-150"
            >
              Reserve
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
              className={`flex h-9 w-9 items-center justify-center
                          rounded-full transition-colors md:hidden
                          ${scrolled
                  ? 'text-[--text-color] hover:bg-[--surface]'
                  : 'text-white hover:bg-white/10'
                }`}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile backdrop ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 md:hidden
                    bg-[--bg] shadow-2xl
                    transition-transform duration-300
                    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between px-6
                        border-b border-[--border-color]">
          <div>
            <p className="font-display text-[20px] text-[--text-color]">
              Peponi
            </p>
            <p className="text-[8px] tracking-[0.3em] uppercase text-gold">
              Living Spaces
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle in drawer */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex h-8 w-8 items-center justify-center
                           rounded-full text-[--muted] hover:text-[--text-color]
                           hover:bg-[--surface] transition-colors"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[--muted] hover:text-[--text-color] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-col px-6 py-8 gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-[13px] tracking-[0.2em] uppercase
                         font-medium text-[--text-color] hover:text-gold
                         transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="my-4 h-px bg-[--border-color]" />

          {/* Auth in drawer */}
          {!isPending && (
            session?.user ? (
              <>
                <div className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center
                                  rounded-full bg-teal text-white text-[12px]
                                  font-medium">
                    {initials(userName)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[--text-color]">
                      {userName}
                    </p>
                    <p className="text-[11px] text-[--muted]">
                      {isStaff ? 'Staff' : 'Guest'}
                    </p>
                  </div>
                </div>
                <Link
                  href={isStaff ? '/admin' : '/dashboard/bookings'}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-[12px] tracking-[0.15em] uppercase
                             font-medium text-[--muted] hover:text-[--text-color]
                             transition-colors"
                >
                  {isStaff ? 'Admin Dashboard' : 'My Bookings'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 text-left text-[12px] tracking-[0.15em]
                             uppercase font-medium text-red-400
                             hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-[12px] tracking-[0.15em] uppercase
                           font-medium text-[--muted] hover:text-[--text-color]
                           transition-colors"
              >
                Sign In
              </Link>
            )
          )}

          {/* Reserve CTA */}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-md bg-teal px-5 py-3.5
                       text-center text-[11px] tracking-[0.2em]
                       uppercase font-semibold text-white
                       hover:bg-teal-light transition-colors"
          >
            Reserve Your Stay
          </Link>
        </nav>
      </div>
    </>
  )
}

// ── Dropdown menu link ────────────────────────────────────────
function MenuLink({
  href, icon: Icon, label, onClick,
}: {
  href: string
  icon: typeof BookOpen
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm
                 text-[--text-color] hover:bg-[--surface] transition-colors"
    >
      <Icon size={14} className="text-[--muted]" />
      {label}
    </Link>
  )
}