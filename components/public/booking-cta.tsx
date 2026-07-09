'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { Calendar, Users, MessageCircle } from 'lucide-react'
import { hotelConfig }     from '@/config/hotel.config'

export function BookingCTA() {
  const router = useRouter()

  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests,   setGuests]   = useState('2')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
    })
    router.push(`/book?${params.toString()}`)
  }

  return (
    <section
      id="contact"
      className="bg-[#1A3C40] py-24 px-6"
    >
      <div className="mx-auto max-w-4xl text-center">

        {/* Label */}
        <p className="text-[10px] tracking-[0.45em] uppercase
                      text-[#C58940] font-medium mb-6">
          Book Your Stay
        </p>

        {/* Headline */}
        <h2 className="font-display text-[44px] sm:text-[56px]
                       font-light text-white leading-none mb-4">
          Reserve Your Place
        </h2>
        <p className="text-white/60 text-base font-light mb-12 max-w-md mx-auto">
          Check-in from {hotelConfig.policies.checkIn} ·
          Check-out by {hotelConfig.policies.checkOut}
        </p>

        {/* Booking form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/8 p-2 sm:p-3
                     flex flex-col sm:flex-row gap-2 shadow-2xl
                     backdrop-blur-sm"
        >
          {/* Check in */}
          <div className="flex flex-1 items-center gap-3
                          bg-white px-4 py-3.5">
            <Calendar size={16} className="text-[#1A3C40]/40 shrink-0" />
            <div className="flex-1 text-left">
              <label className="block text-[9px] tracking-[0.2em]
                                uppercase text-[#1A3C40]/40 font-medium mb-0.5">
                Check in
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setCheckIn(e.target.value)}
                required
                className="w-full text-sm text-[#1A3C40] font-medium
                           focus:outline-none bg-transparent
                           [color-scheme:light]"
              />
            </div>
          </div>

          {/* Check out */}
          <div className="flex flex-1 items-center gap-3
                          bg-white px-4 py-3.5">
            <Calendar size={16} className="text-[#1A3C40]/40 shrink-0" />
            <div className="flex-1 text-left">
              <label className="block text-[9px] tracking-[0.2em]
                                uppercase text-[#1A3C40]/40 font-medium mb-0.5">
                Check out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={e => setCheckOut(e.target.value)}
                required
                className="w-full text-sm text-[#1A3C40] font-medium
                           focus:outline-none bg-transparent
                           [color-scheme:light]"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-3
                          bg-white px-4 py-3.5 sm:w-36">
            <Users size={16} className="text-[#1A3C40]/40 shrink-0" />
            <div className="flex-1 text-left">
              <label className="block text-[9px] tracking-[0.2em]
                                uppercase text-[#1A3C40]/40 font-medium mb-0.5">
                Guests
              </label>
              <select
                value={guests}
                onChange={e => setGuests(e.target.value)}
                className="w-full text-sm text-[#1A3C40] font-medium
                           focus:outline-none bg-transparent cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-[#C58940] px-7 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-semibold text-white shadow-md
                       hover:bg-[#D4A060] transition-colors
                       whitespace-nowrap"
          >
            Check Availability
          </button>
        </form>

        {/* WhatsApp alternative */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-white/10" />
          <span className="text-white/40 text-[12px]">or</span>
          <div className="h-px w-16 bg-white/10" />
        </div>

        <a
          href={`https://wa.me/${hotelConfig.contact.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2.5
                     bg-white/10 px-6 py-3
                     text-[12px] text-white/70 hover:text-white
                     hover:bg-white/15 transition-colors"
        >
          <MessageCircle size={15} className="text-[#C58940]" />
          Message us on WhatsApp
        </a>

      </div>
    </section>
  )
}