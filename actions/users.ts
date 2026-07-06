'use server'

import { db }                    from '@/lib/db'
import { user, bookings, rooms } from '@/lib/db/schema'
import { requireAdmin }          from '@/lib/guard'
import { eq }                    from 'drizzle-orm'
import type { ActionResult }     from '@/lib/types'

export type UserWithBookings = typeof user.$inferSelect & {
  bookings: (typeof bookings.$inferSelect & {
    room: typeof rooms.$inferSelect | null
  })[]
}

export async function getUsers(): Promise<ActionResult<UserWithBookings[]>> {
  try {
    await requireAdmin()
    const all = await db.query.user.findMany({
      where: eq(user.role, 'user'),
      with: {
        bookings: { with: { room: true } },
      },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    })
    return { success: true, data: all as UserWithBookings[] }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getUserById(
  id: string
): Promise<ActionResult<UserWithBookings>> {
  try {
    await requireAdmin()
    const found = await db.query.user.findFirst({
      where: eq(user.id, id),
      with: {
        bookings: { with: { room: true } },
      },
    })
    if (!found) return { success: false, error: 'User not found' }
    return { success: true, data: found as UserWithBookings }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}