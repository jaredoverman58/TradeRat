import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Extract IP address from request headers
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'

    // Call database function to check rate limit
    const { data, error } = await supabase
      .rpc('check_free_eval_rate_limit', {
        p_user_id: user.id,
        p_ip_address: ipAddress
      })

    if (error) {
      console.error('Error checking free eval rate limit:', error)
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      )
    }

    const result = data?.[0]
    const isBlocked = result?.is_blocked || false
    const reason = result?.reason || null

    return NextResponse.json({
      allowed: !isBlocked,
      ipAddress,
      reason
    })
  } catch (error) {
    console.error('Error in rate limit check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
