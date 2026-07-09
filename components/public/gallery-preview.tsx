import Link                    from 'next/link'
import { ArrowRight }          from 'lucide-react'
import type { PublicPhoto }    from '@/actions/gallery'

interface Props {
  photos: PublicPhoto[]
}

export function GalleryPreview({ photos }: Props) {
  const [main, ...rest] = photos

  return (
    <section className="bg-white py-24 px-6">
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-12 flex flex-col sm:flex-row
                        sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase
                          text-[#C58940] font-medium mb-4">
              The Property
            </p>
            <h2 className="font-display text-[44px] sm:text-[54px]
                           font-light leading-none text-[#1A3C40]">
              Gallery
            </h2>
          </div>
          <Link
            href="/gallery"
            className="flex items-center gap-2 text-[11px]
                       tracking-[0.2em] uppercase font-medium
                       text-[#1A3C40] hover:text-[#C58940] transition-colors"
          >
            View all photos
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Asymmetric grid — only shows if we have photos */}
        {photos.length === 0 ? (
          <GalleryPlaceholder />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">

            {/* Main large photo — spans 2 cols and 2 rows */}
            {main && (
              <div className="col-span-2 row-span-2 overflow-hidden 
                              bg-[#1A3C40]/8 shadow-sm
                              aspect-square lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${main.url}?tr=w-800,h-800,q-80,fo-auto`}
                  alt={main.alt ?? 'Peponi Living Spaces'}
                  className="h-full w-full object-cover
                             hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            {/* Smaller photos */}
            {rest.slice(0, 4).map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden bg-[#1A3C40]/8
                           shadow-sm aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${photo.url}?tr=w-400,h-400,q-80,fo-auto`}
                  alt={photo.alt ?? 'Peponi Living Spaces'}
                  className="h-full w-full object-cover
                             hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}

          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2
                       bg-[#1A3C40] px-8 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-medium text-white shadow-sm
                       hover:bg-[#245257] transition-colors"
          >
            View Full Gallery
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  )
}

// ── Placeholder when no photos ────────────────────────────────
function GalleryPlaceholder() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={` bg-[#1A3C40]/5 aspect-square
                      ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
        />
      ))}
    </div>
  )
}