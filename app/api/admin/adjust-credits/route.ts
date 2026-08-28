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
    const { userId, serviceType, tier, creditsRemaining } = await request.json()

    if (!userId || !serviceType || !tier || creditsRemaining === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (creditsRemaining < 0) {
      return NextResponse.json(
        { error: 'Credits remaining must be 0 or greater' },
        { status: 400 }
      )
    }

    // Map tier to bundle_type (using 3-pack as default)
    const bundleType = tier === 'rat_rate' ? 'rat_rate_3_pack' : 'standard_3_pack'

    // Check if bundle already exists for this user/service/tier combination
    // If multiple exist (from testing), update the most recent one
    const { data: existingBundle, error: fetchError } = await supabase
      .from('bundles')
      .select('id, credits_remaining')
      .eq('user_id', userId)
      .eq('service_type', serviceType)
      .eq('bundle_type', bundleType)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to check existing bundle', details: fetchError.message },
        { status: 500 }
      )
    }

    if (existingBundle) {
      // Update existing bundle
      const { error: updateError } = await supabase
        .from('bundles')
        .update({ credits_remaining: creditsRemaining })
        .eq('id', existingBundle.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update credits', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Updated existing bundle: ${creditsRemaining} credits (was ${existingBundle.credits_remaining})`,
      })
    } else {
      // Create new bundle
      const { error: insertError } = await supabase
        .from('bundles')
        .insert({
          user_id: userId,
          bundle_type: bundleType,
          service_type: serviceType,
          credits_remaining: creditsRemaining,
          purchased_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        })

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create bundle', details: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Created new bundle: ${creditsRemaining} credits`,
      })
    }
  } catch (error) {
    console.error('Error adjusting credits:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
