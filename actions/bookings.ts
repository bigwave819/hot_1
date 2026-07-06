'use server'

import { db } from '@/lib/db'
import { bookings, user, rooms } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import {
  updateBookingSchema,
  bookingFiltersSchema,
  type BookingFilters,
  type UpdateBookingInput,
} from '@/lib/validations/booking'
import { eq, and, gte, lte, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export type BookingWithRelations = typeof bookings.$inferSelect & {
  user: typeof user.$inferSelect
  room: typeof rooms.$inferSelect
}

export async function getBookings(
  filters: BookingFilters
): Promise<ActionResult<{
  data: BookingWithRelations[]
  total: number
  page: number
  pages: number
}>> {
  try {
    await requireAdmin()

    const parsed = bookingFiltersSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { status, checkIn, checkOut, page, limit, search } = parsed.data
    const offset = (page - 1) * limit

    const conditions = []
    if (status) conditions.push(eq(bookings.status, status))
    if (checkIn) conditions.push(gte(bookings.checkIn, new Date(checkIn)))
    if (checkOut) conditions.push(lte(bookings.checkOut, new Date(checkOut)))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [data, [{ total }]] = await Promise.all([
      db.query.bookings.findMany({
        where,
        with: { user: true, room: true },
        orderBy: (b, { desc }) => [desc(b.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(bookings).where(where),
    ])

    const filtered = search
      ? data.filter(b => {
        const q = search.toLowerCase()
        return (
          b.user.name.toLowerCase().includes(q) ||
          b.user.email.toLowerCase().includes(q)
        )
      })
      : data

    return {
      success: true,
      data: {
        data: filtered as BookingWithRelations[],
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
): Promise<ActionResult<BookingWithRelations>> {
  try {
    await requireAdmin()

    const found = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: { user: true, room: true },
    })

    if (!found) return { success: false, error: 'Booking not found' }

    return { success: true, data: found as BookingWithRelations }
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