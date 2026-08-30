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
    const { expertId, serviceType } = await request.json()

    if (!expertId) {
      return NextResponse.json({ error: 'Expert ID is required' }, { status: 400 })
    }

    // Default to accept_decline if not specified
    const selectedServiceType = serviceType || 'accept_decline'

    // Verify expert exists and get their tier
    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id, name, tier')
      .eq('id', expertId)
      .single()

    if (expertError || !expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 })
    }

    // Set rate_tier based on expert tier
    const rateTier = expert.tier === 'premium' ? 'rat_rate' : 'standard'

    // Create a test league profile first
    const { data: leagueProfile, error: leagueError } = await supabase
      .from('league_profiles')
      .insert({
        user_id: user.id,
        league_name: `Test League ${Date.now()}`,
        platform: 'Sleeper',
        scoring_format: 'PPR',
        num_teams: 12,
        league_type: 'Redraft',
      })
      .select()
      .single()

    if (leagueError || !leagueProfile) {
      return NextResponse.json({ error: 'Failed to create test league profile' }, { status: 500 })
    }

    // Create test submission with conditional fields based on service type
    const submissionData: any = {
      user_id: user.id,
      league_profile_id: leagueProfile.id,
      service_type: selectedServiceType,
      offer_direction: selectedServiceType === 'trade_finder' ? null : 'received',
      rate_tier: rateTier,
      status: 'claimed',
      expert_id: expertId,
      claimed_at: new Date().toISOString(),
      deadline_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
    }

    // Add service-type-specific fields
    if (selectedServiceType === 'trade_finder') {
      // Trade Finder: no specific offer, just context
      submissionData.additional_context = `TEST SUBMISSION (TRADE FINDER) - Created via admin dev tools. Looking to upgrade at RB and willing to move WR depth. Currently 5-3, competing for playoffs. No untouchables except my QB1.`
    } else {
      // Trade Evaluation: specific offer with players/picks
      submissionData.receive_players = 'Justin Jefferson, WR\nAlvin Kamara, RB'
      submissionData.give_players = 'Ja&apos;Marr Chase, WR\nJosh Jacobs, RB'
      submissionData.receive_picks = '2026 2nd Round'
      submissionData.give_picks = null
      submissionData.fab_receive = null
      submissionData.fab_give = null
      submissionData.additional_context = `TEST SUBMISSION (${selectedServiceType.toUpperCase()}) - Created via admin dev tools for testing purposes. I&apos;m currently 5-3 and looking to make a playoff push. My WR depth is strong but RB is thin. Should I make this trade?`
    }

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Failed to create test submission', details: submissionError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      expertName: expert.name,
      message: 'Test submission created successfully',
    })
  } catch (error) {
    console.error('Error creating test submission:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
