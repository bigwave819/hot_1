'use client'

import type { GalleryPhoto } from '@/actions/gallery'

type CategoryOrAll = 'ALL' | GalleryPhoto['category']

interface Props {
  categories: GalleryPhoto['category'][]
  active:     CategoryOrAll
  onChange:   (value: CategoryOrAll) => void
  labels:     Record<string, string>
}

export function GalleryFilter({ categories, active, onChange, labels }: Props) {
  const options: CategoryOrAll[] = ['ALL', ...categories]

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0
                 [scrollbar-width:none] [-ms-overflow-style:none]
                 [&::-webkit-scrollbar]:hidden"
    >      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`shrink-0 rounded-full border px-4 py-2
                     text-[11px] tracking-[0.12em] uppercase font-medium
                     transition-colors duration-200
                     ${active === opt
                       ? 'border-teal bg-teal text-cream'
                       : 'border-[--border-color] bg-[--surface] text-[--text-muted] hover:text-[--text-color] hover:border-[--border-2]'
                     }`}
        >
          {opt === 'ALL' ? 'All' : labels[opt]}
        </button>
      ))}
    </div>
  )
}