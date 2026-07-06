import { z } from 'zod'

export const galleryCategorySchema = z.enum([
  'ROOMS', 'POOL', 'RESTAURANT', 'GROUNDS', 'EXTERIOR', 'EVENTS'
])

export const galleryPhotoSchema = z.object({
  url:      z.string().url(),
  alt:      z.string().optional(),
  category: galleryCategorySchema,
  order:    z.number().int(),
})

export type GalleryPhotoInput = z.infer<typeof galleryPhotoSchema>