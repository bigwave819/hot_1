import type { Metadata } from 'next'
import { getGalleryByCategory } from '@/actions/gallery'
import { GalleryPhotoForm } from '@/components/admin/gallery/gallery-photo-form'
import { GalleryAdminGrid } from '@/components/admin/gallery/gallery-admin-grid'

export const metadata: Metadata = { title: 'Gallery' }

export default async function AdminGalleryPage() {
  const result = await getGalleryByCategory()

  if (!result.success) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl
                      border border-[--border-color] bg-[--surface]">
        <p className="text-sm text-[--text-muted]">{result.error}</p>
      </div>
    )
  }

  const photos = result.data
  const categoryCounts = photos.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] tracking-[0.25em] uppercase text-gold">
          Management Portal
        </p>
        <h1 className="font-display text-[32px] font-light leading-none
                       text-[--text-color]">
          Gallery
        </h1>
        <p className="mt-1.5 text-sm font-light text-[--text-muted]">
          Manage the photos shown on the public gallery page.
        </p>
      </div>

      <GalleryPhotoForm categoryCounts={categoryCounts} />
      <GalleryAdminGrid photos={photos} />
    </div>
  )
}