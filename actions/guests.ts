// src/actions/guests.ts
'use server'

import { db }           from '@/lib/db'
import { guests }       from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import { eq }           from 'drizzle-orm'
import type { ActionResult } from '@/lib/types'

export async function getGuests(): Promise<ActionResult<(typeof guests.$inferSelect)[]>> {
  try {
    await requireAdmin()

    const all = await db.query.guests.findMany({
      with: { bookings: true },
      orderBy: (g, { desc }) => [desc(g.createdAt)],
    })

    return { success: true, data: all }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getGuestById(
  id: string
): Promise<ActionResult<typeof guests.$inferSelect>> {
  try {
    await requireAdmin()

    const found = await db.query.guests.findFirst({
      where: eq(guests.id, id),
      with: { bookings: { with: { roomType: true } } },
    })

    if (!found) return { success: false, error: 'Guest not found' }

    return { success: true, data: found }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}