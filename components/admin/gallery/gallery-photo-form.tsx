'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    upload,
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
} from '@imagekit/next'
import { UploadCloud, Loader2 } from 'lucide-react'
import { addGalleryPhoto } from '@/actions/gallery'

const CATEGORY_OPTIONS = ['ROOMS', 'POOL', 'RESTAURANT', 'GROUNDS', 'EXTERIOR', 'EVENTS'] as const
type Category = typeof CATEGORY_OPTIONS[number]

const CATEGORY_LABELS: Record<Category, string> = {
    ROOMS: 'Rooms', POOL: 'Pool', RESTAURANT: 'Restaurant',
    GROUNDS: 'Grounds', EXTERIOR: 'Exterior', EVENTS: 'Events',
}

// Same auth route used by the room photo uploader — one shared,
// generic ImageKit auth endpoint for the whole admin.
async function authenticator() {
    const res = await fetch('/api/imagekit-auth')
    if (!res.ok) throw new Error('Could not authenticate upload')
    return res.json() as Promise<{
        token: string; expire: number; signature: string; publicKey: string
    }>
}

interface Props {
    // Current photo count per category — used to set `order` on the
    // new photo so it lands at the end of its category, not overwriting.
    categoryCounts: Partial<Record<Category, number>>
}

export function GalleryPhotoForm({ categoryCounts }: Props) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [category, setCategory] = useState<Category>('ROOMS')
    const [alt, setAlt] = useState('')
    const [progress, setProgress] = useState<number | null>(null)
    const [error, setError] = useState('')

    async function handleFile(files: FileList | null) {
        const file = files?.[0]
        if (!file) return
        setError('')
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
                folder: '/gallery',
                onProgress: (evt) => {
                    if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
                },
            })

            if (!result.url) throw new Error('Upload succeeded but no URL was returned')

            const saved = await addGalleryPhoto({
                url: result.url,
                alt: alt || undefined,
                category,
                order: categoryCounts[category] ?? 0,
            })
            if (!saved.success) throw new Error(saved.error)

            setAlt('')
            router.refresh()
        } catch (e) {
            if (e instanceof ImageKitAbortError) setError('Upload was cancelled')
            else if (e instanceof ImageKitInvalidRequestError) setError('That file was rejected — check format/size')
            else if (e instanceof ImageKitServerError) setError('ImageKit had a server error — try again')
            else if (e instanceof ImageKitUploadNetworkError) setError('Network error during upload')
            else setError((e as Error).message ?? 'Upload failed')
        } finally {
            setProgress(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-4 rounded-xl border border-[var(--border-color)]
                    bg-[var(--surface)] p-5">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase
                    text-[var(--text-muted)]">
                Add Photo
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-[10px] tracking-[0.15em] uppercase
                            font-medium text-[var(--text-muted)]">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value as Category)}
                        className="w-full rounded-md border border-[var(--border-color)]
                      bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-color)]
                      focus:outline-none focus:border-teal transition-colors"
                    >
                        {CATEGORY_OPTIONS.map(c => (
                            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] tracking-[0.15em] uppercase
                            font-medium text-[var(--text-muted)]">
                        Alt Text <span className="normal-case text-[var(--border-2)]">(optional)</span>
                    </label>
                    <input
                        value={alt}
                        onChange={e => setAlt(e.target.value)}
                        placeholder="Pool at dusk"
                        className="w-full rounded-md border border-[var(--border-color)]
                      bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-color)]
                      placeholder:text-[var(--border-2)]
                      focus:outline-none focus:border-teal transition-colors"
                    />
                </div>
            </div>

            <label
                className={`flex h-32 cursor-pointer flex-col items-center justify-center
                   gap-2 rounded-lg border border-dashed border-[var(--border-color)]
                   bg-[var(--surface-2)] text-[var(--text-muted)] transition-colors
                   ${progress === null ? 'hover:border-teal hover:text-teal' : ''}`}
            >
                {progress !== null ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-[11px]">{progress}%</span>
                    </>
                ) : (
                    <>
                        <UploadCloud size={20} />
                        <span className="text-[11px]">Click to upload a photo</span>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={progress !== null}
                    onChange={e => handleFile(e.target.files)}
                />
            </label>

            {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>
    )
}