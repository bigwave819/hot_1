// src/lib/auth/guard.ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const role = session.user.role as string

  if (!['owner', 'manager', 'staff', 'admin'].includes(role)) {
    throw new Error('Forbidden')
  }

  return session.user
}

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized: please sign in')
  }

  return session.user
}

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session ?? null
}