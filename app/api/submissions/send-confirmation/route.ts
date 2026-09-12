import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendSubmissionConfirmation } from '@/lib/email'

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

  const body = await request.json()
  const { submission_id } = body

  if (!submission_id) {
    return NextResponse.json(
      { error: 'Missing submission_id' },
      { status: 400 }
    )
  }

  // Get submission details
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, user_id, service_type')
    .eq('id', submission_id)
    .single()

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: 'Submission not found' },
      { status: 404 }
    )
  }

  // Verify this submission belongs to the authenticated user
  if (submission.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Send confirmation email
  try {
    const emailResult = await sendSubmissionConfirmation(
      user.email!,
      submission.id,
      submission.service_type
    )

    if (emailResult.success) {
      console.log(`Confirmation email sent to ${user.email} for submission ${submission.id}`)
      return NextResponse.json({ success: true, emailId: emailResult.emailId })
    } else {
      console.error('Failed to send confirmation email:', emailResult.error)
      // Don't fail the request - email is nice-to-have, not critical
      return NextResponse.json({
        success: false,
        error: emailResult.error,
        message: 'Email failed but submission was successful'
      })
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    // Don't fail the request - email is nice-to-have, not critical
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Email failed but submission was successful'
    })
  }
}
