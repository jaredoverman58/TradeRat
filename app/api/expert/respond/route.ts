import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendResponseReadyNotification } from '@/lib/twilio'

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

  if (!submission_id || !expert_id || !written_content) {
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
    .select('expert_id, status, claimed_at')
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

  // Check if a response already exists
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('id')
    .eq('submission_id', submission_id)
    .is('recalled_at', null)
    .single()

  if (existingResponse) {
    return NextResponse.json(
      { error: 'A response already exists for this submission' },
      { status: 400 }
    )
  }

  // Insert the response
  const { error: responseError } = await supabase
    .from('responses')
    .insert({
      submission_id,
      expert_id,
      written_content,
    })

  if (responseError) {
    console.error('Error creating response:', responseError)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }

  // Update submission status to completed
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      status: 'completed',
      delivered_at: new Date().toISOString(),
      claimed_at: submission.claimed_at || new Date().toISOString(),
    })
    .eq('id', submission_id)

  if (updateError) {
    console.error('Error updating submission status:', updateError)
    // Response was created but status update failed
    // This is not critical, so we don't fail the whole request
  }

  // Send SMS notification if user has a phone number
  try {
    // Fetch user's phone number
    const { data: submissionData } = await supabase
      .from('submissions')
      .select('user_id')
      .eq('id', submission_id)
      .single()

    if (submissionData?.user_id) {
      const { data: userData } = await supabase
        .from('user_roles')
        .select('phone_number')
        .eq('user_id', submissionData.user_id)
        .single()

      if (userData?.phone_number) {
        const smsResult = await sendResponseReadyNotification(
          userData.phone_number,
          submission_id
        )

        if (smsResult.success) {
          console.log('SMS notification sent successfully:', smsResult.messageSid)
        } else {
          console.error('Failed to send SMS notification:', smsResult.error)
        }
      } else {
        console.log('User has no phone number on file, skipping SMS notification')
      }
    }
  } catch (smsError) {
    // SMS sending is non-critical, log but don't fail the request
    console.error('Error in SMS notification flow:', smsError)
  }

  return NextResponse.json({ success: true })
}
