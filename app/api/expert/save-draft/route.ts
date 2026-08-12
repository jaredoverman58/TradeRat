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
  const { submission_id, expert_id, written_content } = body

  if (!submission_id || !expert_id) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Verify the expert_id belongs to the logged-in user
  const { data: expert, error: expertError } = await supabase
    .from('experts')
    .select('id')
    .eq('id', expert_id)
    .eq('user_id', user.id)
    .single()

  if (expertError || !expert) {
    return NextResponse.json(
      { error: 'Unauthorized: expert does not match user' },
      { status: 403 }
    )
  }

  // Verify the submission is assigned to this expert
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('expert_id')
    .eq('id', submission_id)
    .single()

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: 'Submission not found' },
      { status: 404 }
    )
  }

  if (submission.expert_id !== expert_id) {
    return NextResponse.json(
      { error: 'This submission is not assigned to you' },
      { status: 403 }
    )
  }

  // For now, we'll use localStorage on the client side for drafts
  // This endpoint just validates the request and confirms the expert can save
  // In the future, we could store drafts in a separate table

  return NextResponse.json({
    success: true,
    message: 'Draft validated successfully'
  })
}
