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
    const { userId, serviceType, tier } = await request.json()

    if (!userId || !serviceType || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map tier to bundle_type (same logic as adjust-credits)
    const bundleType = tier === 'rat_rate' ? 'rat_rate_3_pack' : 'standard_3_pack'

    // Fetch the most recent matching bundle (same query as adjust-credits)
    const { data: existingBundle, error: fetchError } = await supabase
      .from('bundles')
      .select('credits_remaining')
      .eq('user_id', userId)
      .eq('service_type', serviceType)
      .eq('bundle_type', bundleType)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch current credits', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      credits: existingBundle?.credits_remaining ?? 0,
      exists: !!existingBundle,
    })
  } catch (error) {
    console.error('Error fetching current credits:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
