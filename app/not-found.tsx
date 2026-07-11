import Link from 'next/link'
import { ArrowLeft, BedDouble } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center
                    bg-[--bg] px-6 text-center">

            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-150 w-150
                        -translate-x-1/2 -translate-y-1/2
                        rounded-full bg-teal/3 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center">

                {/* Icon */}
                <div className="mb-8 flex h-20 w-20 items-center justify-center
                        rounded-full bg-teal/8">
                    <BedDouble size={32} className="text-teal" />
                </div>

                {/* 404 number */}
                <p className="font-display text-[120px] sm:text-[160px]
                      font-light leading-none text-teal/10 select-none
                      -mb-5">
                    404
                </p>

                {/* Heading */}
                <h1 className="font-display text-[40px] sm:text-[52px]
                       font-light text-[--text-color] leading-none mb-4">
                    Room not found.
                </h1>

                {/* Gold rule */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-12 bg-gold/40" />
                    <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
                    <div className="h-px w-12 bg-gold/40" />
                </div>

                {/* Message */}
                <p className="text-[--muted] text-base font-light
                      max-w-sm leading-relaxed mb-10">
                    The page you're looking for doesn't exist or has been moved.
                    Let us help you find your way back.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-md
                       bg-teal px-6 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-medium text-white hover:bg-teal-light
                       transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Home
                    </Link>
                    <Link
                        href="/rooms"
                        className="flex items-center gap-2 rounded-md
                       bg-[--surface] px-6 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-medium text-[--muted]
                       hover:text-[--text-color] hover:bg-[--surface-2]
                       transition-colors"
                    >
                        Explore Rooms
                    </Link>
                </div>

                {/* Hotel name */}
                <p className="mt-16 font-display text-[22px] font-light text-teal/30">
                    Peponi Living Spaces
                </p>
                <p className="text-[9px] tracking-[0.4em] uppercase text-gold/40 mt-1">
                    Kigali · Rwanda
                </p>
            </div>
        </div>
    )
}