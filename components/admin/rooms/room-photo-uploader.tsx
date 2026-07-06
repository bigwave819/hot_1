'use client'

import { useRef, useState } from 'react'
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from '@imagekit/next'
import { Star, Trash2, UploadCloud, Loader2 } from 'lucide-react'
import type { RoomPhoto } from '@/lib/db/schema'

interface Props {
  value: RoomPhoto[]
  onChange: (photos: RoomPhoto[]) => void
}

async function authenticator() {
  const res = await fetch('/api/imagekit-auth')
  if (!res.ok) throw new Error('Could not authenticate upload')
  return res.json() as Promise<{
    token: string; expire: number; signature: string; publicKey: string
  }>
}

export function RoomPhotoUploader({ value: photos, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')

    let next = photos

    for (const file of Array.from(files)) {
      setProgress(0)
      try {
        const auth = await authenticator()

        const result = await upload({
          file,
          fileName: file.name,
          token: auth.token,
          expire: auth.expire,
          signature: auth.signature,
          publicKey: auth.publicKey,
          folder: '/rooms',
          onProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
          },
        })

        if (!result.url) throw new Error('Upload succeeded but no URL was returned')

        const newPhoto: RoomPhoto = {
          url: result.url,
          alt: null,
          isPrimary: next.length === 0,
          order: next.length,
        }

        next = [...next, newPhoto]
        onChange(next)
      } catch (e) {
        if (e instanceof ImageKitAbortError) setError('Upload was cancelled')
        else if (e instanceof ImageKitInvalidRequestError) setError('That file was rejected — check format/size')
        else if (e instanceof ImageKitServerError) setError('ImageKit had a server error — try again')
        else if (e instanceof ImageKitUploadNetworkError) setError('Network error during upload')
        else setError((e as Error).message ?? 'Upload failed')
      } finally {
        setProgress(null)
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSetPrimary(url: string) {
    onChange(photos.map(p => ({ ...p, isPrimary: p.url === url })))
  }

  function handleDelete(url: string) {
    let next = photos.filter(p => p.url !== url)
    const hasPrimary = next.some(p => p.isPrimary)
    if (!hasPrimary && next.length > 0) {
      next = next.map((p, i) => ({ ...p, isPrimary: i === 0 }))
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map(photo => (
          <div
            key={photo.url}
            className="group relative aspect-4/3 overflow-hidden rounded-lg
                       border border-[--border-color] bg-[--surface-2]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${photo.url}?tr=w-320,h-240,q-80,fo-auto`}
              alt={photo.alt ?? ''}
              className="h-full w-full object-cover"
            />

            {photo.isPrimary && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-gold/90
                               px-2 py-0.5 text-[9px] font-medium uppercase text-cream">
                Primary
              </span>
            )}

            <div className="absolute inset-0 flex items-center justify-center gap-2
                            bg-black/50 opacity-0 transition-opacity
                            group-hover:opacity-100">
              {!photo.isPrimary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(photo.url)}
                  title="Set as primary"
                  className="flex h-8 w-8 items-center justify-center rounded-full
                             bg-white/90 text-[--text-color] hover:bg-white
                             transition-colors"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo.url)}
                title="Delete photo"
                className="flex h-8 w-8 items-center justify-center rounded-full
                           bg-white/90 text-red-500 hover:bg-white
                           transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <label
          className={`flex aspect-4/3 cursor-pointer flex-col items-center
                     justify-center gap-2 rounded-lg border border-dashed
                     border-[--border-color] bg-[--surface-2]
                     text-[--text-muted] transition-colors
                     ${progress === null ? 'hover:border-teal hover:text-teal' : ''}`}
        >
          {progress !== null ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[11px]">{progress}%</span>
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              <span className="text-[11px]">Add photo</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={progress !== null}
            onChange={e => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  )
}