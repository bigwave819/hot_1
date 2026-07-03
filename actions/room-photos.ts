// src/actions/room-photos.ts
'use server'

import { db }             from '@/lib/db'
import { roomPhotos }     from '@/lib/db/schema'
import { requireAdmin }   from '@/lib/guard'
import { roomPhotoSchema, type RoomPhotoInput } from '@/lib/validations/room'
import { eq, and, ne }        from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function addRoomPhoto(
  input: RoomPhotoInput
): Promise<ActionResult<typeof roomPhotos.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = roomPhotoSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [created] = await db.transaction(async (tx) => {
      if (parsed.data.isPrimary) {
        await tx
          .update(roomPhotos)
          .set({ isPrimary: false })
          .where(eq(roomPhotos.roomTypeId, parsed.data.roomTypeId))
      }

      return tx.insert(roomPhotos).values(parsed.data).returning()
    })
    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function setPrimaryPhoto(
  id: string,
  roomTypeId: string
): Promise<ActionResult> {
  try {
    await requireAdmin()

    await db.transaction(async (tx) => {
      const [target] = await tx
        .update(roomPhotos)
        .set({ isPrimary: true })
        .where(and(eq(roomPhotos.id, id), eq(roomPhotos.roomTypeId, roomTypeId)))
        .returning()
      if (!target) throw new Error('Photo not found for this room type')
      await tx
        .update(roomPhotos)
        .set({ isPrimary: false })
        .where(and(eq(roomPhotos.roomTypeId, roomTypeId), ne(roomPhotos.id, id)))
    })

    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
export async function reorderRoomPhotos(
  photos: { id: string; order: number }[]
): Promise<ActionResult> {
  try {
    await requireAdmin()

    await Promise.all(
      photos.map(({ id, order }) =>
        db.update(roomPhotos).set({ order }).where(eq(roomPhotos.id, id))
      )
    )

    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteRoomPhoto(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    await db.delete(roomPhotos).where(eq(roomPhotos.id, id))

    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}