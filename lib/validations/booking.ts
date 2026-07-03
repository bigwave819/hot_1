// src/lib/validations/booking.ts
import { z } from 'zod'

export const bookingStatusSchema = z.enum([
  'PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'
])

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  roomId: z.string().uuid().optional(),
  notes:  z.string().optional(),
})

export const bookingFiltersSchema = z.object({
  status:    bookingStatusSchema.optional(),
  checkIn:   z.string().optional(),   // ISO date string
  checkOut:  z.string().optional(),
  search:    z.string().optional(),   // guest name or email
  page:      z.number().int().min(1).default(1),
  limit:     z.number().int().min(1).max(100).default(20),
})

export type BookingFilters   = z.infer<typeof bookingFiltersSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>