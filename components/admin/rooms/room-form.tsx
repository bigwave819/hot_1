'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Wifi, Coffee, Wind, Tv2, Sunset,
  Waves, Wine, Droplets, Loader2, Save,
} from 'lucide-react'
import { roomSchema, type RoomInput } from '@/lib/validations/room'
import { createRoom, updateRoom } from '@/actions/rooms'
import type { Room } from '@/actions/rooms'
import { RoomPhotoUploader } from './room-photo-uploader'

// ── Amenities config ──────────────────────────────────────────
const AMENITIES = [
  { key: 'hasWifi', label: 'WiFi', icon: Wifi },
  { key: 'hasBreakfast', label: 'Breakfast', icon: Coffee },
  { key: 'hasAC', label: 'Air Con', icon: Wind },
  { key: 'hasTv', label: 'TV', icon: Tv2 },
  { key: 'hasBalcony', label: 'Balcony', icon: Sunset },
  { key: 'hasPoolAccess', label: 'Pool Access', icon: Waves },
  { key: 'hasMinibar', label: 'Minibar', icon: Wine },
  { key: 'hasHotWater', label: 'Hot Water', icon: Droplets },
] as const

type AmenityKey = typeof AMENITIES[number]['key']

const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const

// ── Helpers ───────────────────────────────────────────────────
function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Component ─────────────────────────────────────────────────
interface Props {
  initialData?: Room
}

export function RoomForm({ initialData }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description,
        number: initialData.number ?? undefined,
        floor: initialData.floor ?? undefined,
        pricePerNight: initialData.pricePerNight,
        weekendPrice: initialData.weekendPrice ?? undefined,
        sizeM2: initialData.sizeM2 ?? undefined,
        bedrooms: initialData.bedrooms,
        beds: initialData.beds ?? undefined,
        maxGuests: initialData.maxGuests,
        view: initialData.view ?? undefined,
        status: initialData.status,
        photos: initialData.photos ?? [],
        hasWifi: initialData.hasWifi,
        hasBreakfast: initialData.hasBreakfast,
        hasAC: initialData.hasAC,
        hasTv: initialData.hasTv,
        hasBalcony: initialData.hasBalcony,
        hasPoolAccess: initialData.hasPoolAccess,
        hasMinibar: initialData.hasMinibar,
        hasHotWater: initialData.hasHotWater,
      }
      : {
        status: 'AVAILABLE',
        photos: [],
        bedrooms: 1,
        maxGuests: 2,
        hasWifi: true,
        hasHotWater: true,
        hasAC: true,
        hasTv: true,
        hasBreakfast: false,
        hasBalcony: false,
        hasPoolAccess: false,
        hasMinibar: false,
      },
  })

  const watchedAmenities = watch([
    'hasWifi', 'hasBreakfast', 'hasAC', 'hasTv',
    'hasBalcony', 'hasPoolAccess', 'hasMinibar', 'hasHotWater',
  ])

  const photos = watch('photos')
  function handlePhotosChange(next: typeof photos) {
    setValue('photos', next, { shouldDirty: true })
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    register('name').onChange(e)
    if (!isEdit) {
      setValue('slug', toSlug(e.target.value), { shouldValidate: false })
    }
  }

  function onSubmit(data: RoomInput) {
    start(async () => {
      const result = isEdit
        ? await updateRoom(initialData!.id, data)
        : await createRoom(data)

      if (result.success) {
        router.push('/admin/rooms')
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Section: Basic Info ── */}
      <Section title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Room Name" error={errors.name?.message}>
            <input
              {...register('name')}
              onChange={handleNameChange}
              placeholder="Royal Canopy Villa"
              className={inputCls(!!errors.name)}
            />
          </Field>

          <Field label="Slug" error={errors.slug?.message}
            hint="Auto-generated · used in URLs">
            <input
              {...register('slug')}
              placeholder="royal-canopy-villa"
              className={inputCls(!!errors.slug)}
            />
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="An elevated retreat where Rwandan craftsmanship meets..."
            className={`${inputCls(!!errors.description)} resize-none`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Room Number" error={errors.number?.message}
            hint="Optional — for named-only rooms">
            <input
              {...register('number')}
              placeholder="101"
              className={inputCls(!!errors.number)}
            />
          </Field>

          <Field label="Floor" error={errors.floor?.message} hint="Optional">
            <input
              {...register('floor', { valueAsNumber: true })}
              type="number"
              placeholder="1"
              className={inputCls(!!errors.floor)}
            />
          </Field>

          <Field label="Status" error={errors.status?.message}>
            <select
              {...register('status')}
              className={inputCls(!!errors.status)}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Section: Pricing ── */}
      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price Per Night (USD)" error={errors.pricePerNight?.message}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2
                               text-[--text-muted] text-sm">$</span>
              <input
                {...register('pricePerNight', { valueAsNumber: true })}
                type="number"
                placeholder="250"
                className={`${inputCls(!!errors.pricePerNight)} pl-8`}
              />
            </div>
          </Field>

          <Field label="Weekend Price (USD)" error={errors.weekendPrice?.message}
            hint="Optional — leave blank to use standard price">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2
                               text-[--text-muted] text-sm">$</span>
              <input
                {...register('weekendPrice', { valueAsNumber: true })}
                type="number"
                placeholder="300"
                className={`${inputCls(!!errors.weekendPrice)} pl-8`}
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Section: Room Details ── */}
      <Section title="Room Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Size (m²)" error={errors.sizeM2?.message}>
            <input
              {...register('sizeM2', { valueAsNumber: true })}
              type="number"
              placeholder="45"
              className={inputCls(!!errors.sizeM2)}
            />
          </Field>

          <Field label="Bedrooms" error={errors.bedrooms?.message}>
            <input
              {...register('bedrooms', { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="1"
              className={inputCls(!!errors.bedrooms)}
            />
          </Field>

          <Field label="Bed Config" error={errors.beds?.message}
            hint='e.g. "1 King" or "2 Singles"'>
            <input
              {...register('beds')}
              placeholder="1 King Bed"
              className={inputCls(!!errors.beds)}
            />
          </Field>

          <Field label="Max Guests" error={errors.maxGuests?.message}>
            <input
              {...register('maxGuests', { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="2"
              className={inputCls(!!errors.maxGuests)}
            />
          </Field>
        </div>

        <Field label="View" error={errors.view?.message} hint='e.g. "Hill view", "Pool view"'>
          <input
            {...register('view')}
            placeholder="Pool view"
            className={inputCls(!!errors.view)}
          />
        </Field>
      </Section>

      {/* ── Section: Photos ── */}
      <Section title="Photos">
        <RoomPhotoUploader value={photos} onChange={handlePhotosChange} />
        {errors.photos && (
          <p className="text-[11px] text-red-400">{errors.photos.message as string}</p>
        )}
      </Section>

      {/* ── Section: Amenities ── */}
      <Section title="Amenities">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AMENITIES.map(({ key, label, icon: Icon }, idx) => {
            const checked = watchedAmenities[idx]
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3
                            rounded-lg border p-3.5 transition-all duration-150
                            ${checked
                    ? 'border-teal bg-teal/10'
                    : 'border-[--border-color] bg-[--surface-2] hover:border-[--border-2]'
                  }`}
              >
                <input
                  type="checkbox"
                  {...register(key as AmenityKey)}
                  className="sr-only"
                />
                <Icon
                  size={16}
                  className={checked ? 'text-teal' : 'text-[--text-muted]'}
                />
                <span className={`text-[12px] font-medium
                                  ${checked
                    ? 'text-teal'
                    : 'text-[--text-muted]'
                  }`}>
                  {label}
                </span>
              </label>
            )
          })}
        </div>
      </Section>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-[--border-color]
                     bg-[--surface] px-5 py-2.5
                     text-sm text-[--text-muted]
                     hover:text-[--text-color] hover:bg-[--surface-2]
                     transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md
                     bg-teal px-5 py-2.5 text-[11px] tracking-[0.15em]
                     uppercase font-medium text-cream
                     hover:bg-teal-light transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending
            ? <Loader2 size={14} className="animate-spin" />
            : <Save size={14} />
          }
          {isEdit ? 'Save Changes' : 'Create Room'}
        </button>
      </div>

    </form>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[--border-color]
                    bg-[--surface] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-[10px] tracking-[0.2em] uppercase
                      text-[--text-muted] font-medium">
          {title}
        </p>
        <div className="flex-1 h-px bg-[--border-color]" />
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] tracking-[0.15em] uppercase
                          font-medium text-[--text-muted]">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-[--border-2]">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}
    </div>
  )
}

const inputCls = (hasError: boolean) => `
  w-full rounded-md border px-4 py-3 text-sm font-light
  bg-[var(--bg)] text-[var(--text-color)]
  placeholder:text-[var(--border-2)]
  focus:outline-none transition-colors duration-200
  ${hasError
    ? 'border-red-400 focus:border-red-400'
    : 'border-[var(--border-color)] focus:border-teal'
  }
`.trim()