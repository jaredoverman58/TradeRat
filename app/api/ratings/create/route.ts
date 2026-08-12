import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get request body
  const body = await request.json()
  const { submission_id, thumbs_up, feedback_text } = body

  if (!submission_id || typeof thumbs_up !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing required fields: submission_id and thumbs_up' },
      { status: 400 }
    )
  }

  // Verify the submission belongs to the user and is completed
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, user_id, status, expert_id')
    .eq('id', submission_id)
    .single()

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: 'Submission not found' },
      { status: 404 }
    )
  }

  if (submission.user_id !== user.id) {
    return NextResponse.json(
      { error: 'You can only rate your own submissions' },
      { status: 403 }
    )
  }

  if (submission.status !== 'completed') {
    return NextResponse.json(
      { error: 'You can only rate completed submissions' },
      { status: 400 }
    )
  }

  if (!submission.expert_id) {
    return NextResponse.json(
      { error: 'Cannot rate submission without an assigned expert' },
      { status: 400 }
    )
  }

  // Check if rating already exists
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('submission_id', submission_id)
    .single()

  if (existingRating) {
    return NextResponse.json(
      { error: 'You have already rated this submission' },
      { status: 400 }
    )
  }

  // Create the rating
  const { data: rating, error: ratingError } = await supabase
    .from('ratings')
    .insert({
      submission_id,
      expert_id: submission.expert_id,
      user_id: user.id,
      thumbs_up,
      feedback_text: feedback_text || null,
    })
    .select()
    .single()

  if (ratingError) {
    console.error('Error creating rating:', ratingError)
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, rating })
}
