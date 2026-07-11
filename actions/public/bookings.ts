'use server'

import { db }                  from '@/lib/db'
import { bookings, rooms }     from '@/lib/db/schema'
import { requireAuth }         from '@/lib/guard'
import { z }                   from 'zod'
import { eq, and, lt, gt, not, inArray } from 'drizzle-orm'
import { revalidatePath }      from 'next/cache'
import type { ActionResult }   from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────
export type UserBooking = typeof bookings.$inferSelect & {
  room: typeof rooms.$inferSelect
}

// ── Validation schema ─────────────────────────────────────────
const createBookingSchema = z.object({
  roomId:          z.string().uuid('Please select a room'),
  checkIn:         z.string().min(1, 'Check-in date is required'),
  checkOut:        z.string().min(1, 'Check-out date is required'),
  adults:          z.number().int().min(1, 'At least 1 adult required'),
  children:        z.number().int().min(0).default(0),
  specialRequests: z.string().max(500).optional(),
}).refine(
  d => new Date(d.checkOut) > new Date(d.checkIn),
  { message: 'Check-out must be after check-in', path: ['checkOut'] }
).refine(
  d => new Date(d.checkIn) >= new Date(new Date().toDateString()),
  { message: 'Check-in cannot be in the past', path: ['checkIn'] }
)

export type CreateBookingInput = z.infer<typeof createBookingSchema>

// ── Price helper ──────────────────────────────────────────────
function calculateStay(
  checkIn:       Date,
  checkOut:      Date,
  pricePerNight: number,
  weekendPrice:  number | null,
): { nights: number; total: number } {
  const nights = Math.floor(
    (checkOut.getTime() - checkIn.getTime()) / 86_400_000
  )
  let total = 0
  for (let i = 0; i < nights; i++) {
    const d   = new Date(checkIn)
    d.setDate(d.getDate() + i)
    const day = d.getDay()
    total += (day === 5 || day === 6) && weekendPrice
      ? weekendPrice
      : pricePerNight
  }
  return { nights, total }
}

// ── Create booking ────────────────────────────────────────────
export async function createBooking(
  input: CreateBookingInput
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    const sessionUser = await requireAuth()

    const parsed = createBookingSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { roomId, checkIn, checkOut, adults, children, specialRequests } = parsed.data

    const checkInDate  = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Get room
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    })
    if (!room)                      return { success: false, error: 'Room not found' }
    if (room.status !== 'AVAILABLE') return { success: false, error: 'This room is currently unavailable' }
    if (adults > room.maxGuests)     return { success: false, error: `This room fits max ${room.maxGuests} guests` }

    // Availability check — no overlapping active bookings
    const conflict = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.roomId, roomId),
        not(inArray(bookings.status, ['CANCELLED', 'NO_SHOW'])),
        lt(bookings.checkIn,  checkOutDate),
        gt(bookings.checkOut, checkInDate),
      ),
    })
    if (conflict) {
      return { success: false, error: 'Room is not available for the selected dates' }
    }

    const { nights, total } = calculateStay(
      checkInDate, checkOutDate, room.pricePerNight, room.weekendPrice
    )

    const [booking] = await db.insert(bookings).values({
      userId:          sessionUser.id,
      roomId,
      checkIn:         checkInDate,
      checkOut:        checkOutDate,
      adults,
      children:        children ?? 0,
      totalNights:     nights,
      totalAmount:     total,
      status:          'PENDING',
      specialRequests: specialRequests || null,
      source:          'WEBSITE',
    }).returning()

    revalidatePath('/dashboard/bookings')
    return { success: true, data: booking }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Get user bookings ─────────────────────────────────────────
export async function getUserBookings(): Promise<ActionResult<UserBooking[]>> {
  try {
    const sessionUser = await requireAuth()

    const data = await db.query.bookings.findMany({
      where:     eq(bookings.userId, sessionUser.id),
      with:      { room: true },
      orderBy:   (b, { desc }) => [desc(b.createdAt)],
    })

    return { success: true, data: data as UserBooking[] }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Get single user booking ───────────────────────────────────
export async function getUserBookingById(
  id: string
): Promise<ActionResult<UserBooking>> {
  try {
    const sessionUser = await requireAuth()

    const found = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id,     id),
        eq(bookings.userId, sessionUser.id),
      ),
      with: { room: true },
    })

    if (!found) return { success: false, error: 'Booking not found' }

    return { success: true, data: found as UserBooking }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}