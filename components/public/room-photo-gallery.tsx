'use client'

import { useState } from 'react'
import { BedDouble, Expand, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { RoomPhoto } from '@/lib/db/schema'

interface Props {
    photos: RoomPhoto[]
    roomName: string
}

export function RoomPhotoGallery({ photos, roomName }: Props) {
    const ordered = [...photos].sort(
        (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.order - b.order
    )
    const [active, setActive] = useState(0)
    const [lightbox, setLightbox] = useState(false)

    if (ordered.length === 0) {
        return (
            <div className="flex h-72 items-center justify-center rounded-xl
                      border border-[--border-color] bg-[--surface-2] sm:h-96">
                <BedDouble size={32} className="text-[--border-2]" />
            </div>
        )
    }

    const photo = ordered[active]

    function goPrev() {
        setActive(i => (i - 1 + ordered.length) % ordered.length)
    }
    function goNext() {
        setActive(i => (i + 1) % ordered.length)
    }

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative block h-72 w-full overflow-hidden
                  rounded-xl border border-[--border-color] sm:h-96"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`${photo.url}?tr=w-960,q-85,fo-auto`}
                    alt={photo.alt ?? roomName}
                    className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5
                         rounded-full bg-[--bg]/90 px-3 py-1.5 text-[11px]
                         text-[--text-color] opacity-0 backdrop-blur-sm
                         transition-opacity group-hover:opacity-100">
                    <Expand size={12} /> View full size
                </span>
            </button>

            {ordered.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1
                        scrollbar-none [-ms-overflow-style:none]
                        [&::-webkit-scrollbar]:hidden">
                    {ordered.map((p, i) => (
                        <button
                            key={p.url}
                            type="button"
                            onClick={() => setActive(i)}
                            className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2
                         transition-colors
                         ${i === active ? 'border-teal' : 'border-transparent hover:border-[--border-2]'}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`${p.url}?tr=w-160,h-120,q-70,fo-auto`}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {lightbox && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center
                    bg-[--bg]/95 backdrop-blur-sm p-4"
                    onClick={() => setLightbox(false)}
                >
                    <button
                        onClick={() => setLightbox(false)}
                        aria-label="Close"
                        className="absolute top-4 right-4 flex h-10 w-10 items-center
                      justify-center rounded-full border border-[--border-color]
                      bg-[--surface] text-[--text-muted] hover:text-[--text-color]
                      transition-colors"
                    >
                        <X size={18} />
                    </button>

                    {ordered.length > 1 && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); goPrev() }}
                                aria-label="Previous photo"
                                className="absolute left-2 sm:left-6 flex h-10 w-10 items-center
                          justify-center rounded-full border border-[--border-color]
                          bg-[--surface] text-[--text-muted] hover:text-[--text-color]
                          transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); goNext() }}
                                aria-label="Next photo"
                                className="absolute right-2 sm:right-6 flex h-10 w-10 items-center
                          justify-center rounded-full border border-[--border-color]
                          bg-[--surface] text-[--text-muted] hover:text-[--text-color]
                          transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`${photo.url}?tr=w-1400,q-85,fo-auto`}
                        alt={photo.alt ?? roomName}
                        className="max-h-[85vh] w-auto rounded-lg border border-[--border-color] object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}