'use server'

import { db } from '@/lib/db'
import { rooms, bookings, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import { roomSchema, roomStatusSchema, type RoomInput } from '@/lib/validations/room'
import type { RoomPhoto } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'


export type PublicRoom = {
  id:            string
  name:          string
  slug:          string
  description:   string
  pricePerNight: number
  weekendPrice:  number | null
  sizeM2:        number | null
  bedrooms:      number
  beds:          string | null
  maxGuests:     number
  view:          string | null
  photos:        { url: string; alt: string | null; isPrimary: boolean; order: number }[]
  hasWifi:       boolean
  hasBreakfast:  boolean
  hasAC:         boolean
  hasTv:         boolean
  hasBalcony:    boolean
  hasPoolAccess: boolean
  hasMinibar:    boolean
  hasHotWater:   boolean
}

// ── Types ─────────────────────────────────────────────────────
// One row = one bookable room (no separate "room type" table anymore).
export type Room = typeof rooms.$inferSelect

export type RoomWithBookings = Room & {
  bookings: (typeof bookings.$inferSelect & {
    user: typeof user.$inferSelect
  })[]
}

// ── Queries ───────────────────────────────────────────────────
export async function getRooms(): Promise<ActionResult<Room[]>> {
  try {
    await requireAdmin()
    const all = await db.query.rooms.findMany({
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    })
    return { success: true, data: all }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getRoomById(
  id: string
): Promise<ActionResult<RoomWithBookings>> {
  try {
    await requireAdmin()
    const found = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
      with: { bookings: { with: { user: true } } },
    })
    if (!found) return { success: false, error: 'Room not found' }
    return { success: true, data: found }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Room CRUD ─────────────────────────────────────────────────
export async function createRoom(
  input: RoomInput
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const parsed = roomSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    // photos now comes from the form itself (uploaded to ImageKit
    // client-side before submit) — no longer force-overwritten to [].
    const [created] = await db
      .insert(rooms)
      .values(parsed.data)
      .returning()
    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: created }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateRoom(
  id: string,
  input: Partial<RoomInput>
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const parsed = roomSchema.partial().safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const [updated] = await db
      .update(rooms)
      .set(parsed.data)
      .where(eq(rooms.id, id))
      .returning()
    if (!updated) return { success: false, error: 'Room not found' }
    revalidatePath('/admin/rooms')
    revalidatePath('/')
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
    revalidatePath('/')
    return { success: true, data: null }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updateRoomStatus(
  id: string,
  status: string
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const parsed = roomStatusSchema.safeParse(status)
    if (!parsed.success) return { success: false, error: 'Invalid status' }
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

// ── Photo management (JSONB array on rooms.photos) ────────────
async function getRoomPhotos(id: string): Promise<RoomPhoto[]> {
  const found = await db.query.rooms.findFirst({ where: eq(rooms.id, id) })
  return found?.photos ?? []
}

export async function addRoomPhoto(
  roomId: string,
  photo: RoomPhoto
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const existing = await getRoomPhotos(roomId)

    // If first photo or marked primary — unset others
    const isFirst = existing.length === 0
    const newPhoto = { ...photo, isPrimary: isFirst ? true : photo.isPrimary, order: existing.length }

    let updated: RoomPhoto[]
    if (newPhoto.isPrimary) {
      updated = [...existing.map(p => ({ ...p, isPrimary: false })), newPhoto]
    } else {
      updated = [...existing, newPhoto]
    }

    const [result] = await db
      .update(rooms)
      .set({ photos: updated })
      .where(eq(rooms.id, roomId))
      .returning()

    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function setPrimaryPhoto(
  roomId: string,
  photoUrl: string
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const existing = await getRoomPhotos(roomId)
    if (!existing.some(p => p.url === photoUrl)) {
      return { success: false, error: 'Photo not found' }
    }
    const updated = existing.map(p => ({ ...p, isPrimary: p.url === photoUrl }))
    const [result] = await db
      .update(rooms)
      .set({ photos: updated })
      .where(eq(rooms.id, roomId))
      .returning()
    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteRoomPhoto(
  roomId: string,
  photoUrl: string
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const existing = await getRoomPhotos(roomId)
    let updated = existing.filter(p => p.url !== photoUrl)

    // If we deleted the primary and photos remain, promote first
    const hasPrimary = updated.some(p => p.isPrimary)
    if (!hasPrimary && updated.length > 0) {
      updated = updated.map((p, i) => ({ ...p, isPrimary: i === 0 }))
    }

    const [result] = await db
      .update(rooms)
      .set({ photos: updated })
      .where(eq(rooms.id, roomId))
      .returning()

    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function reorderRoomPhotos(
  roomId: string,
  photos: RoomPhoto[]
): Promise<ActionResult<Room>> {
  try {
    await requireAdmin()
    const reordered = photos.map((p, i) => ({ ...p, order: i }))
    const [result] = await db
      .update(rooms)
      .set({ photos: reordered })
      .where(eq(rooms.id, roomId))
      .returning()
    revalidatePath('/admin/rooms')
    revalidatePath('/')
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function getPublicRooms(): Promise<PublicRoom[]> {
  const all = await db.query.rooms.findMany({
    where: eq(rooms.status, 'AVAILABLE'),
    orderBy: (r, { asc }) => [asc(r.pricePerNight)],
  })
  return all as PublicRoom[]
}

export async function getPublicRoomBySlug(slug: string): Promise<PublicRoom | null> {
  const found = await db.query.rooms.findFirst({
    where: and(eq(rooms.slug, slug), eq(rooms.status, 'AVAILABLE')),
  })
  return (found as PublicRoom) ?? null
}

export async function getPublicRoomSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const all = await db.query.rooms.findMany({
    where: eq(rooms.status, 'AVAILABLE'),
    columns: { slug: true, updatedAt: true },
  })
  return all
}