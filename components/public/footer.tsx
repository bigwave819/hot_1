import Link            from 'next/link'
import { hotelConfig } from '@/config/hotel.config'
import { MapPin, Phone, Mail } from 'lucide-react'

const FOOTER_LINKS = {
  'Explore': [
    { label: 'Our Rooms',  href: '/rooms'   },
    { label: 'Gallery',    href: '/gallery' },
    { label: 'About',      href: '/#story'  },
  ],
  'Guest Services': [
    { label: 'Reserve a Stay', href: '/book'               },
    { label: 'Sign In',        href: '/login'              },
    { label: 'My Bookings',    href: '/dashboard/bookings' },
  ],
}

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1A3C40] text-white">

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <p className="font-display text-[32px] font-light text-white">
                Peponi
              </p>
              <p className="text-[9px] tracking-[0.35em] uppercase text-[#C58940]">
                Living Spaces
              </p>
            </div>

            <p className="text-white/50 text-sm font-light leading-relaxed mb-6">
              {hotelConfig.tagline}
            </p>

            {/* Contact */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${hotelConfig.contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[12px]
                           text-white/50 hover:text-white transition-colors"
              >
                <Phone size={13} className="text-[#C58940] shrink-0" />
                {hotelConfig.contact.phone}
              </a>

              <a
                href={`mailto:${hotelConfig.contact.email}`}
                className="flex items-center gap-2.5 text-[12px]
                           text-white/50 hover:text-white transition-colors"
              >
                <Mail size={13} className="text-[#C58940] shrink-0" />
                {hotelConfig.contact.email}
              </a>

              <div className="flex items-start gap-2.5 text-[12px] text-white/50">
                <MapPin size={13} className="text-[#C58940] shrink-0 mt-0.5" />
                {hotelConfig.contact.address}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-[10px] tracking-[0.3em] uppercase
                            text-[#C58940] font-medium mb-5">
                {heading}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white
                                 transition-colors font-light"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Tagline only - social removed */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase
                          text-[#C58940] font-medium mb-5">
              Our Promise
            </p>

            <p className="font-display text-[18px] font-light
                          text-[#C58940] italic leading-snug">
              "Wake up above<br />the hills of Kigali."
            </p>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5
                        flex flex-col sm:flex-row items-center
                        justify-between gap-3">
          <p className="text-[11px] text-white/30">
            © {year} {hotelConfig.name} · All rights reserved.
          </p>
          <Link
            href="/admin"
            className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </div>

    </footer>
  )
}