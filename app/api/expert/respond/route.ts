import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendResponseReadyNotification } from '@/lib/twilio'
import { notifyNextInQueue } from '@/lib/waitlist-notify'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

  // Get form data (supports both JSON and FormData)
  const contentType = request.headers.get('content-type')
  let submission_id: string
  let expert_id: string
  let written_content: string
  let audioFile: File | null = null
  let verdict: string | null = null
  let bonus_content: string | null = null

  if (contentType?.includes('multipart/form-data')) {
    const formData = await request.formData()
    submission_id = formData.get('submission_id') as string
    expert_id = formData.get('expert_id') as string
    written_content = formData.get('written_content') as string
    audioFile = formData.get('audio') as File | null
    verdict = formData.get('verdict') as string | null
    bonus_content = formData.get('bonus_content') as string | null
  } else {
    const body = await request.json()
    submission_id = body.submission_id
    expert_id = body.expert_id
    written_content = body.written_content
    verdict = body.verdict || null
    bonus_content = body.bonus_content || null
  }

  // Require submission_id, expert_id, and at least one of written_content or audio
  if (!submission_id || !expert_id) {
    return NextResponse.json(
      { error: 'Missing required fields: submission_id and expert_id' },
      { status: 400 }
    )
  }

  if (!written_content && !audioFile) {
    return NextResponse.json(
      { error: 'Please provide either written content or audio commentary' },
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
    .select('expert_id, status, claimed_at, rate_tier')
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

  // Handle audio upload and transcription if provided
  let audioUrl: string | null = null
  let audioTranscript: string | null = null

  if (audioFile) {
    try {
      // Upload audio to Supabase Storage
      const fileExt = audioFile.name.split('.').pop() || 'webm'
      const fileName = `${expert_id}/${submission_id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('expert-audio')
        .upload(fileName, audioFile)

      if (uploadError) {
        console.error('Error uploading audio:', uploadError)
      } else {
        audioUrl = fileName // Store path, not URL (will use signed URLs)

        // Transcribe audio with Whisper
        try {
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
          })
          audioTranscript = transcription.text
          console.log('✓ Audio transcribed successfully:', audioTranscript.substring(0, 100) + (audioTranscript.length > 100 ? '...' : ''))
        } catch (transcribeError) {
          console.error('Error transcribing audio:', transcribeError)
          // Continue without transcript - not critical
        }
      }
    } catch (audioError) {
      console.error('Error processing audio:', audioError)
      // Continue without audio - not critical
    }
  }

  // Insert the response
  // Note: written_content is NOT NULL in DB, so use empty string if not provided
  const { error: responseError } = await supabase
    .from('responses')
    .insert({
      submission_id,
      expert_id,
      written_content: written_content || '',
      audio_url: audioUrl,
      audio_transcript: audioTranscript,
      verdict: verdict,
      bonus_content: bonus_content,
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
  } else {
    // Submission completed successfully - notify next person in waitlist
    try {
      const tier = submission.rate_tier as 'rat_rate' | 'standard'
      const waitlistResult = await notifyNextInQueue(tier)

      if (waitlistResult.success) {
        console.log(`✓ Waitlist notification sent for ${tier} tier`)
      } else {
        console.log(`No waitlist notification needed for ${tier}:`, waitlistResult.reason)
      }
    } catch (waitlistError) {
      // Waitlist notification is non-critical, log but don't fail the request
      console.error('Error notifying waitlist:', waitlistError)
    }
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
