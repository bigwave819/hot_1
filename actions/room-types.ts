// src/actions/room-types.ts
'use server'

import { db }           from '@/lib/db'
import { roomTypes }    from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import { roomTypeSchema, type RoomTypeInput } from '@/lib/validations/room'
import { eq }           from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function createRoomType(
  input: RoomTypeInput
): Promise<ActionResult<typeof roomTypes.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = roomTypeSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [created] = await db
      .insert(roomTypes)
      .values(parsed.data)
      .returning()

    revalidatePath('/admin/rooms')
    revalidatePath('/')

    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateRoomType(
  id: string,
  input: Partial<RoomTypeInput>
): Promise<ActionResult<typeof roomTypes.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = roomTypeSchema.partial().safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [updated] = await db
      .update(roomTypes)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(roomTypes.id, id))
      .returning()

    if (!updated) return { success: false, error: 'Room type not found' }

    revalidatePath('/admin/rooms')
    revalidatePath('/')

    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteRoomType(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    await db.delete(roomTypes).where(eq(roomTypes.id, id))

    revalidatePath('/admin/rooms')
    revalidatePath('/')

    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getRoomTypes(): Promise<ActionResult<(typeof roomTypes.$inferSelect)[]>> {
  try {
    await requireAdmin()

    const all = await db.query.roomTypes.findMany({
      with: { photos: true, rooms: true },
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    })

    return { success: true, data: all }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getRoomTypeById(
  id: string
): Promise<ActionResult<typeof roomTypes.$inferSelect>> {
  try {
    await requireAdmin()

    const found = await db.query.roomTypes.findFirst({
      where: eq(roomTypes.id, id),
      with: { photos: true, rooms: true, bookings: true },
    })

    if (!found) return { success: false, error: 'Not found' }

    return { success: true, data: found }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}