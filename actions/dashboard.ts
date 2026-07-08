'use server'

import { db } from '@/lib/db'
import { rooms, bookings, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/guard'
import { eq } from 'drizzle-orm'
import type { ActionResult } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────
export type DashboardStats = {
    rooms: {
        total: number
        available: number
        occupied: number
        maintenance: number
    }
    bookings: {
        pending: number
        thisMonth: number
    }
    revenue: {
        thisMonth: number
    }
    guests: {
        total: number
        newThisMonth: number
    }
}

export type RoomCell = {
    id: string
    name: string
    number: string | null
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
}

export type RecentBooking = {
    id: string
    checkIn: Date
    checkOut: Date
    totalNights: number
    totalAmount: number
    status: string
    createdAt: Date
    user: {
        id: string
        name: string
        email: string
    }
    room: {
        id: string
        name: string
    }
}

// ── Stats ─────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
    try {
        await requireAdmin()

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const [allRooms, allBookings, allGuests] = await Promise.all([
            db.select({ status: rooms.status }).from(rooms),
            db.select({
                status: bookings.status,
                totalAmount: bookings.totalAmount,
                createdAt: bookings.createdAt,
            }).from(bookings),
            db.select({ createdAt: user.createdAt })
                .from(user)
                .where(eq(user.role, 'guest')),
        ])

        const thisMonthBookings = allBookings.filter(
            b => new Date(b.createdAt) >= monthStart
        )

        const revenueThisMonth = thisMonthBookings
            .filter(b =>
                ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status)
            )
            .reduce((acc, b) => acc + b.totalAmount, 0)

        return {
            success: true,
            data: {
                rooms: {
                    total: allRooms.length,
                    available: allRooms.filter(r => r.status === 'AVAILABLE').length,
                    occupied: allRooms.filter(r => r.status === 'OCCUPIED').length,
                    maintenance: allRooms.filter(r => r.status === 'MAINTENANCE').length,
                },
                bookings: {
                    pending: allBookings.filter(b => b.status === 'PENDING').length,
                    thisMonth: thisMonthBookings.length,
                },
                revenue: { thisMonth: revenueThisMonth },
                guests: {
                    total: allGuests.length,
                    newThisMonth: allGuests.filter(
                        g => new Date(g.createdAt) >= monthStart
                    ).length,
                },
            },
        }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}

// ── Room grid ─────────────────────────────────────────────────
export async function getRoomCells(): Promise<ActionResult<RoomCell[]>> {
    try {
        await requireAdmin()

        const all = await db
            .select({
                id: rooms.id,
                name: rooms.name,
                number: rooms.number,
                status: rooms.status,
            })
            .from(rooms)

        return { success: true, data: all }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}

// ── Recent bookings ───────────────────────────────────────────
export async function getRecentBookings(): Promise<ActionResult<RecentBooking[]>> {
    try {
        await requireAdmin()

        const recent = await db.query.bookings.findMany({
            with: {
                user: { columns: { id: true, name: true, email: true } },
                room: { columns: { id: true, name: true } },
            },
            orderBy: (b, { desc }) => [desc(b.createdAt)],
            limit: 6,
        })

        // Cast is safe — with: columns above matches RecentBooking shape exactly
        return { success: true, data: recent as unknown as RecentBooking[] }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}