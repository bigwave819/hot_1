// src/lib/validations/room.ts
import { z } from 'zod'

export const roomTypeSchema = z.object({
  name:          z.string().min(2),
  slug:          z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description:   z.string().min(10),
  pricePerNight: z.number().positive(),
  weekendPrice:  z.number().positive().optional(),
  sizeM2:        z.number().int().positive().optional(),
  bedrooms:      z.number().int().min(1),
  beds:          z.string().optional(),       // "1 King", "2 Singles"
  maxGuests:     z.number().int().min(1),
  hasWifi:       z.boolean().default(true),
  hasBreakfast:  z.boolean().default(false),
  hasAC:         z.boolean().default(true),
  hasTv:         z.boolean().default(true),
  hasBalcony:    z.boolean().default(false),
  hasPoolAccess: z.boolean().default(false),
  hasMinibar:    z.boolean().default(false),
  hasHotWater:   z.boolean().default(true),
})

export const roomSchema = z.object({
  roomTypeId: z.string().uuid(),
  number:     z.string().min(1),
  floor:      z.number().int().min(0),
})

export const roomStatusSchema = z.enum([
  'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'
])

export const roomPhotoSchema = z.object({
  roomTypeId: z.string().uuid(),
  url:        z.string().url(),
  alt:        z.string().optional(),
  order:      z.number().int().default(0),
  isPrimary:  z.boolean().default(false),
})

export type RoomTypeInput  = z.infer<typeof roomTypeSchema>
export type RoomInput      = z.infer<typeof roomSchema>
export type RoomPhotoInput = z.infer<typeof roomPhotoSchema>