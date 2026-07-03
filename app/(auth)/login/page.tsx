import type { Metadata } from 'next'
import { HotelImagePanel } from '@/components/auth/hotel-image-panel'
import { LoginForm } from '@/components/auth/login-form'
import { hotelConfig } from '@/config/hotel.config'

export const metadata: Metadata = {
  title: 'Sign In',
  description: `Sign in to manage your ${hotelConfig.name} reservation or access the staff portal.`,
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">

      {/* Left — hotel photo, desktop only */}
      <HotelImagePanel />

      {/* Right — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-14
                      lg:w-110 lg:shrink-0 lg:border-l lg:border-[--border-color]
                      bg-[--bg]">
        <div className="w-full max-w-95">

          {/* Mobile branding — hidden on desktop where image panel shows */}
          <div className="mb-12 text-center lg:hidden">
            <span className="block text-[9px] tracking-[0.45em] uppercase text-gold mb-3">
              {hotelConfig.location}
            </span>
            <span className="block font-display text-[36px] font-light text-[--text-color]">
              {hotelConfig.name.split(' ')[0]}
            </span>
            <span className="block text-[9px] tracking-[0.3em] uppercase
                             text-[vartext-muted] mt-1.5">
              {hotelConfig.name.split(' ').slice(1).join(' ')}
            </span>
            <div className="mx-auto mt-5 h-px w-10 bg-gold" />
          </div>

          <LoginForm />

        </div>
      </div>

    </div>
  )
}