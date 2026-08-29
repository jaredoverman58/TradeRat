import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Get user_id from query params
    const url = new URL(request.url)
    const targetUserId = url.searchParams.get('user_id')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id query parameter is required' },
        { status: 400 }
      )
    }

    // Query bundles for the specified user
    const { data: bundles, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('user_id', targetUserId)
      .order('purchased_at', { ascending: false })
      .limit(3)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bundles', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user_id: targetUserId,
      count: bundles?.length || 0,
      bundles: bundles || [],
    })
  } catch (error) {
    console.error('Error querying bundles:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
