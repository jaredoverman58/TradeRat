import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Sample roster images already uploaded to Supabase Storage
const SAMPLE_ROSTER_FILES = [
  {
    path: 'test-assets/roster-1-IMG_0089.PNG',
    label: 'Sample Roster 1',
    fileType: 'image/png',
  },
  {
    path: 'test-assets/roster-2-FullSizeRender.jpeg',
    label: 'Sample Roster 2',
    fileType: 'image/jpeg',
  },
  {
    path: 'test-assets/roster-3-MacNKraft.png',
    label: 'Sample Roster 3',
    fileType: 'image/png',
  },
  {
    path: 'test-assets/roster-4-TeamSweetness.png',
    label: 'Sample Roster 4',
    fileType: 'image/png',
  },
]

// Helper to randomly select 2 roster files
function getRandomTwoFiles() {
  const shuffled = [...SAMPLE_ROSTER_FILES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2)
}

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
    const { count = 10 } = await request.json()

    const createdSubmissions = []
    const serviceTypes = ['accept_decline', 'counter_offer', 'bundle', 'trade_finder']
    const offerDirections = ['received', 'proposed']
    const rateTiers = ['standard', 'rat_rate']

    for (let i = 0; i < count; i++) {
      // Randomly select service type
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]

      // Randomly select rate tier
      const rateTier = rateTiers[Math.floor(Math.random() * rateTiers.length)]

      // For trade_finder, offer_direction must be null
      const offerDirection = serviceType === 'trade_finder'
        ? null
        : offerDirections[Math.floor(Math.random() * offerDirections.length)]

      // Create league profile
      const { data: leagueProfile, error: leagueError } = await supabase
        .from('league_profiles')
        .insert({
          user_id: user.id,
          league_name: `Test League ${Date.now()}-${i}`,
          platform: ['Sleeper', 'ESPN', 'Yahoo', 'NFL.com'][Math.floor(Math.random() * 4)],
          scoring_format: ['PPR', 'Half-PPR', 'Standard'][Math.floor(Math.random() * 3)],
          num_teams: [10, 12, 14][Math.floor(Math.random() * 3)],
          league_type: ['Redraft', 'Dynasty', 'Keeper'][Math.floor(Math.random() * 3)],
        })
        .select()
        .single()

      if (leagueError || !leagueProfile) {
        console.error(`Failed to create league profile ${i}:`, leagueError)
        continue
      }

      // Create test submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          league_profile_id: leagueProfile.id,
          service_type: serviceType,
          offer_direction: offerDirection,
          rate_tier: rateTier,
          status: 'submitted',
          deadline_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          receive_players: 'Justin Jefferson, WR\nAlvin Kamara, RB',
          give_players: "Ja'Marr Chase, WR\nJosh Jacobs, RB",
          receive_picks: Math.random() > 0.5 ? '2026 2nd Round' : null,
          give_picks: Math.random() > 0.5 ? '2026 3rd Round' : null,
          fab_receive: Math.random() > 0.7 ? Math.floor(Math.random() * 50) : null,
          fab_give: Math.random() > 0.7 ? Math.floor(Math.random() * 50) : null,
          additional_context: `TEST SUBMISSION #${i + 1} (${serviceType.toUpperCase()}) - Created via bulk seeder. Currently 5-3 and looking to make a playoff push. My WR depth is strong but RB is thin.`,
        })
        .select()
        .single()

      if (submissionError || !submission) {
        console.error(`Failed to create submission ${i}:`, submissionError)
        continue
      }

      // Attach roster images based on service type
      const filesToAttach = serviceType === 'trade_finder'
        ? SAMPLE_ROSTER_FILES // All 4 images for trade_finder
        : getRandomTwoFiles() // Random 2 for other types

      // Insert submission_files records
      const fileRecords = filesToAttach.map(file => ({
        submission_id: submission.id,
        file_url: file.path,
        file_type: file.fileType,
        label: file.label,
        is_own_roster: false, // All marked as false for testing
      }))

      const { error: filesError } = await supabase
        .from('submission_files')
        .insert(fileRecords)

      if (filesError) {
        console.error(`Failed to attach files to submission ${submission.id}:`, filesError)
      }

      createdSubmissions.push({
        id: submission.id,
        serviceType,
        fileCount: filesToAttach.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdSubmissions.length} test submissions with roster images`,
      submissions: createdSubmissions,
    })
  } catch (error) {
    console.error('Error creating bulk test submissions:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
