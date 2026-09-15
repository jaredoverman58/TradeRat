import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendAdminSubmissionNotification } from '@/lib/email'

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

  // Get submission details including rate_tier
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, user_id, service_type, rate_tier')
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

  // Send admin notification email
  try {
    const emailResult = await sendAdminSubmissionNotification(
      submission.id,
      submission.service_type,
      user.email!,
      submission.rate_tier
    )

    if (emailResult.success) {
      console.log(`Admin notification sent for submission ${submission.id}`)
      return NextResponse.json({ success: true, emailId: emailResult.emailId })
    } else {
      console.error('Failed to send admin notification:', emailResult.error)
      // Don't fail the request - email is nice-to-have, not critical
      return NextResponse.json({
        success: false,
        error: emailResult.error,
        message: 'Email failed but submission was successful'
      })
    }
  } catch (error) {
    console.error('Error sending admin notification:', error)
    // Don't fail the request - email is nice-to-have, not critical
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Email failed but submission was successful'
    })
  }
}
