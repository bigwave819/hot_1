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