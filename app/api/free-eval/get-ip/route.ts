import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'

    return NextResponse.json({ ipAddress })
  } catch (error) {
    console.error('Error getting IP address:', error)
    return NextResponse.json(
      { ipAddress: 'unknown' },
      { status: 200 } // Don't fail - return 'unknown' instead
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
