import { getUploadAuthParams } from '@imagekit/next/server'
import { requireAdmin } from '@/lib/guard'
import { NextResponse } from 'next/server'

// Issues short-lived, signed upload credentials to the browser.
// The private key never leaves this server route.
export async function GET() {
  try {
    // Only admins/staff can request upload credentials — same guard
    // used by every room/booking action.
    await requireAdmin()

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY

    if (!privateKey || !publicKey) {
      return NextResponse.json(
        { error: 'Image uploads are not configured' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const { token, expire, signature } = getUploadAuthParams({
      privateKey,
      publicKey,
    })

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey,
    }, { headers: { 'Cache-Control': 'no-store' } })  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? 'Not authorized' },
      { status: 401 }
    )
  }
}