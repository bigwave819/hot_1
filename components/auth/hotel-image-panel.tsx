// src/components/auth/hotel-image-panel.tsx
import { hotelConfig } from '@/config/hotel.config'
import { MapPin } from 'lucide-react'
import Image from "next/image";

export function HotelImagePanel() {
    return (
        <div className="relative hidden flex-1 overflow-hidden bg-charcoal lg:block">

            {/* Image placeholder — replace div with next/image when you have the photo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-border">
                <div className="h-12 w-12 rounded-full border border-dashed border-border flex items-center justify-center">
                    <span className="text-border text-xl">✦</span>
                </div>
                <Image 
                    src="/back.jpg"
                    alt="Login Image"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-charcoal/95 via-charcoal/20 to-transparent" />

            {/* Branding */}
            <div className="absolute bottom-11 left-11 right-11">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={12} className="text-gold" />
                    <span className="text-[10px] tracking-[0.35em] uppercase text-gold font-sans">
                        {hotelConfig.location}
                    </span>
                </div>

                <h1 className="font-display text-[52px] font-light leading-[1.05] text-cream">
                    {hotelConfig.name.split(' ').slice(0, 1).join('')}<br />
                    <span className="text-[36px] font-light tracking-wide">
                        {hotelConfig.name.split(' ').slice(1).join(' ')}
                    </span>
                </h1>

                <div className="my-5 h-px w-11 bg-gold" />

                <p className="text-sm leading-relaxed text-cream/60 font-light">
                    {hotelConfig.tagline}
                </p>
            </div>
        </div>
    )
}