'use client'

import { useState, useMemo } from 'react'
import { X, ZoomIn } from 'lucide-react'
import type { PublicPhoto } from '@/actions/gallery'

// ── Category config ───────────────────────────────────────────
const CATEGORIES = [
    { key: 'ALL', label: 'All Photos' },
    { key: 'ROOMS', label: 'Rooms' },
    { key: 'POOL', label: 'Pool' },
    { key: 'RESTAURANT', label: 'Dining' },
    { key: 'GROUNDS', label: 'Grounds' },
    { key: 'EXTERIOR', label: 'Exterior' },
    { key: 'EVENTS', label: 'Events' },
] as const

type Category = typeof CATEGORIES[number]['key']

// ── Component ─────────────────────────────────────────────────
interface Props { photos: PublicPhoto[] }

export function GalleryGrid({ photos }: Props) {
    const [activeCategory, setActiveCategory] = useState<Category>('ALL')
    const [lightbox, setLightbox] = useState<{
        open: boolean
        url: string
        alt: string | null
    }>({ open: false, url: '', alt: null })

    const filtered = useMemo(() => {
        if (activeCategory === 'ALL') return photos
        return photos.filter(p => p.category === activeCategory)
    }, [photos, activeCategory])

    // Only show tabs that have photos
    const availableCategories = useMemo(() => {
        const categoriesWithPhotos = new Set(photos.map(p => p.category))
        return CATEGORIES.filter(
            c => c.key === 'ALL' || categoriesWithPhotos.has(c.key)
        )
    }, [photos])

    function openLightbox(photo: PublicPhoto) {
        setLightbox({ open: true, url: photo.url, alt: photo.alt })
        document.body.style.overflow = 'hidden'
    }

    function closeLightbox() {
        setLightbox({ open: false, url: '', alt: null })
        document.body.style.overflow = ''
    }

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-7xl">

                {/* ── Category tabs ── */}
                <div className="mb-10 flex flex-wrap gap-2">
                    {availableCategories.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`rounded-full px-4 py-2 text-[12px] font-medium
                          tracking-wide transition-all duration-200
                          ${activeCategory === key
                                    ? 'bg-teal text-white shadow-sm'
                                    : 'bg-[--surface] text-[--muted] hover:text-[--text-color] hover:bg-[--surface-2]'
                                }`}
                        >
                            {label}
                            {key !== 'ALL' && (
                                <span className={`ml-1.5 text-[10px]
                                  ${activeCategory === key
                                        ? 'text-white/60'
                                        : 'text-[--muted]'
                                    }`}>
                                    {photos.filter(p => p.category === key).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Photo count ── */}
                <p className="mb-6 text-[13px] text-[--muted]">
                    Showing{' '}
                    <span className="font-medium text-[--text-color]">{filtered.length}</span>
                    {' '}photo{filtered.length !== 1 ? 's' : ''}
                </p>

                {/* ── Masonry grid ── */}
                {filtered.length === 0 ? (
                    <div className="flex h-64 items-center justify-center
                          rounded-2xl bg-[--surface]">
                        <p className="text-[--muted]">No photos in this category yet.</p>
                    </div>
                ) : (
                    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                        {filtered.map(photo => (
                            <div
                                key={photo.id}
                                onClick={() => openLightbox(photo)}
                                className="group relative mb-4 break-inside-avoid cursor-pointer
                           overflow-hidden rounded-xl bg-[--surface-2]
                           shadow-sm hover:shadow-md
                           transition-shadow duration-300"                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`${photo.url}?tr=w-480,q-80,fo-auto`}
                                    alt={photo.alt ?? 'Peponi Living Spaces'}
                                    loading="lazy"
                                    className="w-full object-cover
                             transition-transform duration-700
                             group-hover:scale-105"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 flex items-center justify-center
                                bg-teal/40 opacity-0 group-hover:opacity-100
                                transition-opacity duration-300 rounded-xl">
                                    <ZoomIn size={24} className="text-white" />
                                </div>

                                {/* Category label */}
                                <div className="absolute bottom-0 inset-x-0 p-3
                                bg-linear-to-t from-black/50 to-transparent
                                opacity-0 group-hover:opacity-100
                                transition-opacity duration-300">
                                    <span className="text-[10px] tracking-[0.2em] uppercase
                                   text-white/80 font-medium">
                                        {photo.category.charAt(0) + photo.category.slice(1).toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ── Lightbox ── */}
            {lightbox.open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/90 p-4 sm:p-8"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 flex h-10 w-10 items-center
                       justify-center rounded-full bg-white/10
                       text-white hover:bg-white/20 transition-colors z-10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`${lightbox.url}?tr=w-1200,q-90,fo-auto`}
                        alt={lightbox.alt ?? 'Peponi Living Spaces'}
                        onClick={e => e.stopPropagation()}
                        className="max-h-[85vh] max-w-full rounded-xl
                       object-contain shadow-2xl"
                    />
                </div>
            )}
        </section>
    )
}