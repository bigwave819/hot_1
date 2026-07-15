import type { Metadata }    from 'next'
import { getPublicGallery } from '@/actions/gallery'
import { GalleryGrid }      from '@/components/public/gallery-grid'
import { hotelConfig }      from '@/config/hotel.config'

export const metadata: Metadata = {
  title:       `Gallery | ${hotelConfig.name}`,
  description: `A visual journey through ${hotelConfig.name} — rooms, pool, dining and the Kigali hillside.`,
  openGraph: {
    title:       `Gallery | ${hotelConfig.name}`,
    description: 'Photography from Peponi Living Spaces, Kigali.',
    images:      [hotelConfig.seo.ogImage],
  },
}

export default async function GalleryPage() {
  const photos = await getPublicGallery() // all photos

  return (
    <div className="bg-[--bg]">

      {/* ── Page hero ── */}
      <section data-navbar-hero className="relative bg-teal overflow-hidden pt-32 pb-16 px-6">
        <div className="absolute inset-0 opacity-5"
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, #E5D9B6 1px, transparent 0)`,
               backgroundSize: '32px 32px',
             }} />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-[10px] tracking-[0.45em] uppercase
                        text-gold font-medium mb-4">
            The Property
          </p>
          <h1 className="font-display text-[56px] sm:text-[72px]
                         font-light text-white leading-none mb-4">
            Gallery
          </h1>
          <p className="text-white/60 text-base font-light max-w-md leading-relaxed">
            Curated imagery from across Peponi — rooms, pool, dining
            and the Kigali hillside at every hour of the day.
          </p>

          <div className="mt-8 inline-flex items-center gap-3
                          rounded-full bg-white/10 px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[12px] text-white/70">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Gallery grid with tabs ── */}
      <GalleryGrid photos={photos} />

    </div>
  )
}