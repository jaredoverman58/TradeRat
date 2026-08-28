import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get count of bundles that will be affected
    const { data: bundlesToZero, error: countError } = await supabase
      .from('bundles')
      .select('id, service_type, bundle_type, credits_remaining')
      .eq('user_id', userId)
      .gt('credits_remaining', 0)

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to fetch bundles', details: countError.message },
        { status: 500 }
      )
    }

    const bundleCount = bundlesToZero?.length || 0

    if (bundleCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bundles with credits found for this user',
      })
    }

    // Zero all credits for this user
    const { error: updateError } = await supabase
      .from('bundles')
      .update({ credits_remaining: 0 })
      .eq('user_id', userId)
      .gt('credits_remaining', 0)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to zero credits', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Zeroed credits for ${bundleCount} bundle${bundleCount === 1 ? '' : 's'}`,
    })
  } catch (error) {
    console.error('Error zeroing credits:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
