'use client'

import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { PublicRoom } from '@/actions/rooms'

type Photo = PublicRoom['photos'][number]

interface Props {
  photos: Photo[]
  roomName: string
}

import { useState, useEffect } from 'react'

export function RoomGallery({ photos, roomName }: Props) {
  const sorted = [...photos].sort((a, b) => a.order - b.order)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  function openLightbox(idx: number) {
    setLightboxIdx(idx)
  }

  function closeLightbox() {
    setLightboxIdx(null)
  }

  function prev() {
    setLightboxIdx(i => (i === null ? 0 : (i - 1 + sorted.length) % sorted.length))
  }

  function next() {
    setLightboxIdx(i => (i === null ? 0 : (i + 1) % sorted.length))
  }

  useEffect(() => {
    if (lightboxIdx === null) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIdx])
  return (
    <>
      {/* ── Grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((photo, idx) => (
          <div
            key={photo.url}
            onClick={() => openLightbox(idx)}
            className="group relative cursor-pointer overflow-hidden
                       rounded-xl bg-[--surface-2] aspect-4/3 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${photo.url}?tr=w-400,h-300,q-80,fo-auto`}
              alt={photo.alt ?? roomName}
              loading="lazy"
              className="h-full w-full object-cover
                         transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center
                            bg-teal/30 opacity-0 group-hover:opacity-100
                            transition-opacity duration-300">
              <ZoomIn size={22} className="text-white" />
            </div>

            {/* Primary badge */}
            {photo.isPrimary && (
              <span className="absolute top-2 left-2 rounded-full
                               bg-gold/90 px-2.5 py-1
                               text-[9px] uppercase font-medium text-white">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/95 px-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10
                       items-center justify-center rounded-full
                       bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="rounded-full bg-white/10 px-4 py-1.5
                             text-[12px] text-white/70">
              {lightboxIdx + 1} / {sorted.length}
            </span>
          </div>

          {/* Prev */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 z-10 flex h-10 w-10
                         items-center justify-center rounded-full
                         bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${sorted[lightboxIdx].url}?tr=w-1400,q-90,fo-auto`}
            alt={sorted[lightboxIdx].alt ?? roomName}
            onClick={e => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl
                       object-contain shadow-2xl"
          />

          {/* Next */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 z-10 flex h-10 w-10
                         items-center justify-center rounded-full
                         bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </>
  )
}