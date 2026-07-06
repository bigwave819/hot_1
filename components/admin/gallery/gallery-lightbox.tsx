'use client'

import { useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryPhoto } from '@/actions/gallery'

interface Props {
  photos:     GalleryPhoto[]
  index:      number
  onClose:    () => void
  onNavigate: (index: number) => void
  labels:     Record<string, string>
}

export function GalleryLightbox({ photos, index, onClose, onNavigate, labels }: Props) {
  const photo = photos[index]

  const goPrev = useCallback(
    () => onNavigate((index - 1 + photos.length) % photos.length),
    [index, photos.length, onNavigate]
  )
  const goNext = useCallback(
    () => onNavigate((index + 1) % photos.length),
    [index, photos.length, onNavigate]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      // Dimmed theme background rather than pure black — quieter,
      // stays in the site's own palette instead of a stock dark modal.
      className="fixed inset-0 z-50 flex items-center justify-center
                bg-[--bg]/95 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex h-10 w-10
                  items-center justify-center rounded-full border border-[--border-color]
                  bg-[--surface] text-[--text-muted] hover:text-[--text-color]
                  transition-colors"
      >
        <X size={18} />
      </button>

      <button
        onClick={e => { e.stopPropagation(); goPrev() }}
        aria-label="Previous photo"
        className="absolute left-2 sm:left-6 flex h-10 w-10 items-center justify-center
                  rounded-full border border-[--border-color] bg-[--surface]
                  text-[--text-muted] hover:text-[--text-color] transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        className="flex max-h-full max-w-4xl flex-col items-center gap-3"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${photo.url}?tr=w-1200,q-85,fo-auto`}
          alt={photo.alt ?? ''}
          className="max-h-[70vh] sm:max-h-[75vh] w-auto rounded-lg
                    border border-[--border-color] object-contain"
        />
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold">
            {labels[photo.category]}
          </span>
          {photo.alt && (
            <span className="text-[12px] text-[--text-muted]">{photo.alt}</span>
          )}
          <span className="text-[11px] text-[--text-muted]">
            {index + 1} / {photos.length}
          </span>
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); goNext() }}
        aria-label="Next photo"
        className="absolute right-2 sm:right-6 flex h-10 w-10 items-center justify-center
                  rounded-full border border-[--border-color] bg-[--surface]
                  text-[--text-muted] hover:text-[--text-color] transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}