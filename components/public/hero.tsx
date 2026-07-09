import Link from 'next/link'
import { hotelConfig } from '@/config/hotel.config'
import { MapPin } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/*
        ── REPLACE THIS WITH next/image WHEN YOU HAVE THE HERO PHOTO ──
        <Image
          src="/images/hero.jpg"
          alt={hotelConfig.name}
          fill
          className="object-cover object-center"
          priority
        />
      */}
      <div className="absolute inset-0 bg-[#1A3C40]">
        {/* Placeholder gradient until real photo is added */}
        <div className="absolute inset-0 bg-gradient-to-br
                        from-[#1A3C40] via-[#2D4A4E] to-[#122B2E]" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center
                      text-center px-6 max-w-5xl mx-auto">

        {/* Location tag */}
        <div className="flex items-center gap-2 mb-8">
          <MapPin size={12} className="text-[#C58940]" />
          <span className="text-[10px] tracking-[0.45em] uppercase
                           text-[#C58940] font-medium">
            {hotelConfig.location}
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display font-light text-white leading-[0.9]
                       text-[72px] sm:text-[96px] lg:text-[120px]
                       tracking-tight mb-4">
          Peponi
        </h1>
        <p className="font-display font-light text-white/80
                      text-[28px] sm:text-[36px] lg:text-[44px]
                      tracking-[0.15em] mb-8">
          Living Spaces
        </p>

        {/* Gold rule */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-16 bg-[#C58940]/60" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[#C58940]" />
          <div className="h-px w-16 bg-[#C58940]/60" />
        </div>

        {/* Tagline */}
        <p className="text-white/70 text-base sm:text-lg font-light
                      leading-relaxed max-w-lg mb-12 tracking-wide">
          {hotelConfig.heroLine}
          <br />
          {hotelConfig.heroSub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/book"
            className="bg-[#C58940] px-8 py-4
                       text-[11px] tracking-[0.25em] uppercase
                       font-semibold text-white shadow-lg
                       hover:bg-[#D4A060] transition-colors duration-200"
          >
            Reserve Your Stay
          </Link>
          <Link
            href="/rooms"
            className="px-8 py-4 text-[11px]
                       tracking-[0.25em] uppercase font-medium
                       text-white border border-white/30
                       hover:bg-white/10 transition-colors duration-200"
          >
            Explore Rooms
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                      flex flex-col items-center gap-2">
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">
          Scroll
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  )
}