import type { Metadata }       from 'next'
import { hotelConfig }         from '@/config/hotel.config'
import { getPublicRooms }      from '@/actions/rooms'
import { getPublicGallery }    from '@/actions/gallery'
import { PublicNavbar }        from '@/components/public/navbar'
import { HeroSection }         from '@/components/public/hero'
import { HotelStory }          from '@/components/public/hotel-story'
import { RoomsPreview }        from '@/components/public/rooms-preview'
import { GalleryPreview }      from '@/components/public/gallery-preview'
import { BookingCTA }          from '@/components/public/booking-cta'
import { PublicFooter }        from '@/components/public/footer'

export const metadata: Metadata = {
  title:       hotelConfig.seo.title,
  description: hotelConfig.seo.description,
  keywords:    [...hotelConfig.seo.keywords],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title:       hotelConfig.name,
    description: hotelConfig.description,
    images:      [hotelConfig.seo.ogImage],
    type:        'website',
  },
}

export default async function LandingPage() {
  const [publicRooms, photos] = await Promise.all([
    getPublicRooms(),
    getPublicGallery(8),
  ])

  return (
    <>
      <PublicNavbar />
      <main className="bg-white">
        <HeroSection />
        <HotelStory />
        <RoomsPreview rooms={publicRooms} />
        <GalleryPreview photos={photos} />
        <BookingCTA />
      </main>
      <PublicFooter />
    </>
  )
}