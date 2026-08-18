import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tier, service_type, draft_data } = body

    // Validate required fields
    if (!tier || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!['rat_rate', 'standard'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    // Check if user already on this waitlist
    const { data: existingEntry } = await supabase
      .from('waitlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('tier', tier)
      .is('converted_at', null)
      .is('cancelled_at', null)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You are already on this waitlist' },
        { status: 400 }
      )
    }

    // Create waitlist entry
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        user_id: user.id,
        tier,
        service_type,
        draft_data: draft_data || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating waitlist entry:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, entry: waitlistEntry })
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
