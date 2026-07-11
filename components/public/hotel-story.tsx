import { hotelConfig } from '@/config/hotel.config'
import Image from "next/image"


export function HotelStory() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">

          {/* Left: large display text */}
          <div className="order-2 lg:order-1">

            {/* Section label */}
            <p className="text-[10px] tracking-[0.4em] uppercase
                          text-[#C58940] font-medium mb-6">
              Our Story
            </p>

            {/* Headline */}
            <h2 className="font-display text-[48px] sm:text-[60px]
                           font-light leading-[1.05] text-[#1A3C40] mb-8">
              Where stillness<br />
              <em>finds you.</em>
            </h2>

            {/* Gold rule */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-[#C58940]" />
              <div className="h-1 w-1 rotate-45 bg-[#C58940]" />
            </div>

            {/* Body copy */}
            <p className="text-[#1A3C40]/70 text-base leading-relaxed
                          font-light mb-6 max-w-md">
              {hotelConfig.description}
            </p>
            <p className="text-[#1A3C40]/60 text-sm leading-relaxed font-light max-w-md">
              Perched above the rolling hills of Kigali, Peponi was conceived
              as a place apart — somewhere the boundaries between interior and
              landscape dissolve completely. Every detail, from the hand-woven
              textiles to the sunrise-facing terraces, is an act of intention.
            </p>

            {/* Stats row */}
            <div className="mt-12 flex gap-10">
              {[
                { number: '12', label: 'Suites & Villas' },
                { number: '4.8★', label: 'Guest Rating' },
                { number: '2013', label: 'Est. Kigali' },
              ].map(({ number, label }) => (
                <div key={label}>
                  <p className="font-display text-[32px] font-light
                                text-[#C58940] leading-none">
                    {number}
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase
                                text-[#1A3C40]/50 mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image placeholder */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main image */}
              <div className="aspect-[3/4] overflow-hidden
                              bg-[#1A3C40]/8 shadow-xl">

                <Image src="/pepe4.jpg" alt="Peponi pool view" fill
                  className="object-cover" />

                <div className="h-full w-full bg-gradient-to-br */}
                                from-[#1A3C40]/10 to-[#1A3C40]/20
                                flex items-center justify-center">
                  <p className="text-[10px] tracking-[0.3em] uppercase
                                text-[#1A3C40]/30">
                    Your photo here
                  </p>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 bg-[#1A3C40]
                              px-6 py-5 shadow-xl">
                <p className="font-display text-[36px] font-light
                              text-[#C58940] leading-none">
                  3★
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase
                              text-white/60 mt-1">
                  Luxury
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}