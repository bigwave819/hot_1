// src/actions/gallery.ts
'use server'

import { db }             from '@/lib/db'
import { gallery }        from '@/lib/db/schema'
import { requireAdmin }   from '@/lib/guard'
import { galleryPhotoSchema, galleryCategorySchema, type GalleryPhotoInput } from '@/lib/validations/gallery'
import { eq }             from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'

export async function addGalleryPhoto(
  input: GalleryPhotoInput
): Promise<ActionResult<typeof gallery.$inferSelect>> {
  try {
    await requireAdmin()

    const parsed = galleryPhotoSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [created] = await db.insert(gallery).values(parsed.data).returning()

    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteGalleryPhoto(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    await db.delete(gallery).where(eq(gallery.id, id))

    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function reorderGalleryPhotos(
  photos: { id: string; order: number }[]
): Promise<ActionResult> {
  try {
    await requireAdmin()

    await Promise.all(
      photos.map(({ id, order }) =>
        db.update(gallery).set({ order }).where(eq(gallery.id, id))
      )
    )

    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getGalleryByCategory(
  category?: string
): Promise<ActionResult<(typeof gallery.$inferSelect)[]>> {
  try {
    const parsed = galleryCategorySchema.optional().safeParse(category)
    if (!parsed.success) {
      return { success: false, error: 'Invalid category' }
    }

    const photos = await db.query.gallery.findMany({
      where: parsed.data ? eq(gallery.category, parsed.data) : undefined,
      orderBy: (g, { asc }) => [asc(g.order)],
    })

    return { success: true, data: photos }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}