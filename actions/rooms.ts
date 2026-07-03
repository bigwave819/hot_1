// src/actions/rooms.ts
'use server'

import { db }              from '@/lib/db'
import { rooms }           from '@/lib/db/schema'
import { requireAdmin }    from '@/lib/guard'
import { roomSchema, roomStatusSchema, type RoomInput } from '@/lib/validations/room'
import { eq }              from 'drizzle-orm'
import { revalidatePath }  from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function createRoom(
  input: RoomInput
): Promise<ActionResult<typeof rooms.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = roomSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [created] = await db.insert(rooms).values(parsed.data).returning()

    revalidatePath('/admin/rooms')
    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateRoomStatus(
  id: string,
  status: string
): Promise<ActionResult<typeof rooms.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = roomStatusSchema.safeParse(status)
    if (!parsed.success) {
      return { success: false, error: 'Invalid status' }
    }

    const [updated] = await db
      .update(rooms)
      .set({ status: parsed.data })
      .where(eq(rooms.id, id))
      .returning()

    if (!updated) return { success: false, error: 'Room not found' }

    revalidatePath('/admin/rooms')
    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
export async function deleteRoom(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    await db.delete(rooms).where(eq(rooms.id, id))

    revalidatePath('/admin/rooms')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}