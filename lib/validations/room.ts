import { z } from 'zod'

export const roomPhotoSchema = z.object({
  url:       z.string().url(),
  alt:       z.string().nullable(),
  isPrimary: z.boolean(),
  order:     z.number().int(),
})

export const roomStatusSchema = z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])

const nanToUndefined = (v: unknown) =>
  (typeof v === 'number' && Number.isNaN(v)) || v === '' ? undefined : v

// Helper to create preprocessed number fields with proper typing
function preprocessNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess(nanToUndefined, schema) as unknown as T
}

function preprocessOptionalNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess(nanToUndefined, schema).optional() as unknown as z.ZodOptional<T>
}

export const roomSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  slug:        z.string().min(2, 'Slug must be at least 2 characters')
                 .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),

  number: z.string().optional(),
  floor:  preprocessOptionalNumber(z.number().int()),

  pricePerNight: preprocessNumber(
    z.number({ error: 'Price per night is required' }).positive('Price must be greater than 0')
  ),
  weekendPrice: preprocessOptionalNumber(z.number().positive('Must be greater than 0')),

  sizeM2: preprocessOptionalNumber(z.number().int().positive()),
  bedrooms: preprocessNumber(
    z.number({ error: 'Bedrooms is required' }).int().min(1, 'At least 1 bedroom is required')
  ),
  beds: z.string().optional(),
  maxGuests: preprocessNumber(
    z.number({ error: 'Max guests is required' }).int().min(1, 'At least 1 guest is required')
  ),
  view: z.string().optional(),

  status: roomStatusSchema,

  photos: z.array(roomPhotoSchema),

  hasWifi:       z.boolean(),
  hasBreakfast:  z.boolean(),
  hasAC:         z.boolean(),
  hasTv:         z.boolean(),
  hasBalcony:    z.boolean(),
  hasPoolAccess: z.boolean(),
  hasMinibar:    z.boolean(),
  hasHotWater:   z.boolean(),
})

export type RoomInput = z.infer<typeof roomSchema>
export type RoomPhotoInput = z.infer<typeof roomPhotoSchema>