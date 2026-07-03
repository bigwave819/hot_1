// src/actions/bookings.ts
'use server'

import { db }             from '@/lib/db'
import { bookings, guests } from '@/lib/db/schema'
import { requireAdmin }   from '@/lib/guard'
import {
  updateBookingSchema,
  bookingFiltersSchema,
  type BookingFilters,
  type UpdateBookingInput,
} from '@/lib/validations/booking'
import { eq, and, ilike, gte, lte, or, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function getBookings(filters: BookingFilters): Promise<ActionResult<{
  data:  (typeof bookings.$inferSelect & { guest: typeof guests.$inferSelect })[]
  total: number
  page:  number
  pages: number
}>> {
  try {
    await requireAdmin()

    const parsed = bookingFiltersSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { status, checkIn, checkOut, search, page, limit } = parsed.data
    const offset = (page - 1) * limit

    const conditions = []
    if (status)   conditions.push(eq(bookings.status, status))
    if (checkIn)  conditions.push(gte(bookings.checkIn, new Date(checkIn)))
    if (checkOut) conditions.push(lte(bookings.checkOut, new Date(checkOut)))

    // search by guest name or email via join
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [data, [{ total }]] = await Promise.all([
      db.query.bookings.findMany({
        where,
        with: { guest: true, roomType: true, room: true },
        orderBy: (b, { desc }) => [desc(b.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(bookings).where(where),
    ])

    // filter by guest name/email in memory if search provided
    // (for a simple hotel scale this is fine — not millions of rows)
    const filtered = search
      ? data.filter(b => {
          const q = search.toLowerCase()
          return (
            b.guest.firstName.toLowerCase().includes(q) ||
            b.guest.lastName.toLowerCase().includes(q)  ||
            b.guest.email.toLowerCase().includes(q)
          )
        })
      : data

    return {
      success: true,
      data: {
        data:  filtered,
        total: Number(total),
        page,
        pages: Math.ceil(Number(total) / limit),
      },
    }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getBookingById(
  id: string
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    await requireAdmin()

    const found = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: { guest: true, roomType: { with: { photos: true } }, room: true },
    })

    if (!found) return { success: false, error: 'Booking not found' }

    return { success: true, data: found }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateBooking(
  id: string,
  input: UpdateBookingInput
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = updateBookingSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [updated] = await db
      .update(bookings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning()

    if (!updated) return { success: false, error: 'Booking not found' }

    revalidatePath('/admin/bookings')
    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function assignRoomToBooking(
  bookingId: string,
  roomId: string
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    await requireAdmin()

    const [updated] = await db
      .update(bookings)
      .set({ roomId, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning()

    if (!updated) return { success: false, error: 'Booking not found' }

    revalidatePath('/admin/bookings')
    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
export async function addBookingNote(
  id: string,
  note: string
): Promise<ActionResult<typeof bookings.$inferSelect>> {
  try {
    await requireAdmin()

    const [updated] = await db
      .update(bookings)
      .set({ notes: note, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning()

    revalidatePath('/admin/bookings')
    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}