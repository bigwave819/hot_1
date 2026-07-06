'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { deleteGalleryPhoto, reorderGalleryPhotos } from '@/actions/gallery'
import type { GalleryPhoto } from '@/actions/gallery'

const CATEGORY_LABELS: Record<string, string> = {
  ROOMS: 'Rooms', POOL: 'Pool', RESTAURANT: 'Restaurant',
  GROUNDS: 'Grounds', EXTERIOR: 'Exterior', EVENTS: 'Events',
}
const CATEGORY_OPTIONS = ['ALL', 'ROOMS', 'POOL', 'RESTAURANT', 'GROUNDS', 'EXTERIOR', 'EVENTS'] as const

export function GalleryAdminGrid({ photos }: { photos: GalleryPhoto[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [active, setActive] = useState<typeof CATEGORY_OPTIONS[number]>('ALL')

  const filtered = useMemo(() => {
    const list = active === 'ALL' ? photos : photos.filter(p => p.category === active)
    return [...list].sort((a, b) => a.order - b.order)
  }, [photos, active])

  function handleDelete(id: string) {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    start(async () => {
      const result = await deleteGalleryPhoto(id)
      if (!result.success) alert(result.error)
      router.refresh()
    })
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= filtered.length) return

    const reordered = [...filtered]
    const tmp = reordered[index]
    reordered[index] = reordered[target]
    reordered[target] = tmp

    const payload = reordered.map((p, i) => ({ id: p.id, order: i }))
    start(async () => {
      const result = await reorderGalleryPhotos(payload)
      if (!result.success) alert(result.error)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1
                      scrollbar-none [-ms-overflow-style:none]
                      [&::-webkit-scrollbar]:hidden">
        {CATEGORY_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => setActive(opt)}
            className={`shrink-0 rounded-full border px-4 py-2
                       text-[11px] tracking-[0.12em] uppercase font-medium
                       transition-colors duration-200
                       ${active === opt
                ? 'border-teal bg-teal text-cream'
                : 'border-[--border-color] bg-[--surface] text-[--text-muted] hover:text-[--text-color]'
              }`}          >
            {opt === 'ALL' ? 'All' : CATEGORY_LABELS[opt]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl
                        border border-dashed border-[--border-color]
                        bg-[var(--surface)]">
          <p className="text-sm text-[var(--text-muted)]">No photos in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo, i) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg
                        border border-[--border-color] bg-[var(--surface-2)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${photo.url}?tr=w-320,h-240,q-80,fo-auto`}
                  alt={photo.alt ?? ''}
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="absolute top-1.5 left-1.5 rounded-full bg-teal/90
                               px-2 py-0.5 text-[9px] font-medium uppercase text-cream">
                {CATEGORY_LABELS[photo.category]}
              </span>

              {/* Soft themed tint on hover, not a hard black overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2
                              bg-[var(--text-color)]/15 opacity-0 transition-opacity
                              duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={pending || i === 0}
                  title="Move earlier"
                  className="flex h-8 w-8 items-center justify-center rounded-full
                             bg-white/90 text-[var(--text-color)] hover:bg-white
                             disabled:opacity-40 transition-colors"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={pending || i === filtered.length - 1}
                  title="Move later"
                  className="flex h-8 w-8 items-center justify-center rounded-full
                             bg-white/90 text-[var(--text-color)] hover:bg-white
                             disabled:opacity-40 transition-colors"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={pending}
                  title="Delete photo"
                  className="flex h-8 w-8 items-center justify-center rounded-full
                             bg-white/90 text-red-500 hover:bg-white
                             disabled:opacity-40 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}