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

function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess(nanToUndefined, schema.optional())
}

function requiredNumber(schema: z.ZodNumber) {
  return z.preprocess(nanToUndefined, schema)
}


export const roomSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  slug:        z.string().min(2, 'Slug must be at least 2 characters')
                 .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),

  number: z.string().optional(),
  floor:  optionalNumber(z.number().int()),

  pricePerNight: requiredNumber(
    z.number({ error: 'Price per night is required' }).positive('Price must be greater than 0')
  ),
  weekendPrice: optionalNumber(z.number().positive('Must be greater than 0')),

  sizeM2:    optionalNumber(z.number().int().positive()),
  bedrooms:  requiredNumber(
    z.number({ error: 'Bedrooms is required' }).int().min(1, 'At least 1 bedroom is required')
  ),
  beds:      z.string().optional(),
  maxGuests: requiredNumber(
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

export type RoomInput      = z.infer<typeof roomSchema>
export type RoomPhotoInput = z.infer<typeof roomPhotoSchema>