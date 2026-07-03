import { db }           from '@/lib/db'
import { guests }       from '@/lib/db/schema'
import { bookings, roomTypes } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import { eq }           from 'drizzle-orm'
import type { ActionResult } from '@/lib/types'

// ── Typed with relations ──────────────────────────────────────
export type GuestWithBookings = typeof guests.$inferSelect & {
  bookings: (typeof bookings.$inferSelect & {
    roomType: typeof roomTypes.$inferSelect | null
  })[]
}

export async function getGuests(): Promise<ActionResult<GuestWithBookings[]>> {
  try {
    await requireAdmin()

    const all = await db.query.guests.findMany({
      with: {
        bookings: {
          with: { roomType: true },
        },
      },
      orderBy: (g, { desc }) => [desc(g.createdAt)],
    })

    return { success: true, data: all }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getGuestById(
  id: string
): Promise<ActionResult<GuestWithBookings>> {
  try {
    await requireAdmin()

    const found = await db.query.guests.findFirst({
      where: eq(guests.id, id),
      with: {
        bookings: {
          with: { roomType: true },
        },
      },
    })

    if (!found) return { success: false, error: 'Guest not found' }

    return { success: true, data: found }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}