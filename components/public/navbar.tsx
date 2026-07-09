'use client'

import { useEffect, useState } from 'react'
import Link                    from 'next/link'
import { Menu, X }             from 'lucide-react'
import { hotelConfig }         from '@/config/hotel.config'

const NAV_LINKS = [
  { label: 'Rooms',   href: '/rooms'   },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]
export function PublicNavbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
                    ${scrolled
                      ? 'bg-white shadow-sm py-3'
                      : 'bg-transparent py-5'
                    }`}
      >
        <div className="mx-auto flex max-w-7xl items-center
                        justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span
              className={`font-display text-[28px] font-light tracking-wide
                          transition-colors duration-300
                          ${scrolled ? 'text-[#1A3C40]' : 'text-white'}`}
            >
              Peponi
            </span>
            <span
              className={`text-[9px] tracking-[0.35em] uppercase
                          transition-colors duration-300
                          ${scrolled ? 'text-[#C58940]' : 'text-[#C58940]'}`}
            >
              Living Spaces
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-[12px] tracking-[0.2em] uppercase font-medium
                            transition-colors duration-200
                            ${scrolled
                              ? 'text-[#1A3C40] hover:text-[#C58940]'
                              : 'text-white/90 hover:text-white'
                            }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Reserve CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/book"
              className="hidden bg-[#1A3C40] px-5 py-2.5
                         text-[11px] tracking-[0.2em] uppercase font-medium
                         text-white hover:bg-[#245257]
                         transition-colors duration-150 md:flex"
            >
              Reserve
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              className={`flex h-9 w-9 items-center justify-center
                          transition-colors md:hidden
                          ${scrolled
                            ? 'text-[#1A3C40]'
                            : 'text-white'
                          }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white
                    shadow-2xl transition-transform duration-300 md:hidden
                    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="font-display text-[20px] text-[#1A3C40]">Peponi</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-[#1A3C40]"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col px-6 py-6 gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] tracking-[0.2em] uppercase
                         font-medium text-[#1A3C40] hover:text-[#C58940]
                         transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-[#1A3C40] px-5 py-3
                       text-center text-[11px] tracking-[0.2em]
                       uppercase font-medium text-white"
          >
            Reserve Your Stay
          </Link>
        </nav>
      </div>
    </>
  )
}