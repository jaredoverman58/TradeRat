import { createClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { submissionId, newExpertId } = body

  if (!submissionId || !newExpertId) {
    return NextResponse.json({ error: 'Missing submissionId or newExpertId' }, { status: 400 })
  }

  // Get current submission details
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      user_id,
      expert_id,
      claimed_at,
      deadline_at
    `)
    .eq('id', submissionId)
    .single()

  if (submissionError || !submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (!submission.expert_id) {
    return NextResponse.json({ error: 'Submission does not have an assigned expert' }, { status: 400 })
  }

  // Get old expert details
  const { data: oldExpert, error: oldExpertError } = await supabase
    .from('experts')
    .select('id, name, tier')
    .eq('id', submission.expert_id)
    .single()

  if (oldExpertError || !oldExpert) {
    return NextResponse.json({ error: 'Old expert not found' }, { status: 404 })
  }

  // Get new expert details
  const { data: newExpert, error: newExpertError } = await supabase
    .from('experts')
    .select('id, name, tier')
    .eq('id', newExpertId)
    .single()

  if (newExpertError || !newExpert) {
    return NextResponse.json({ error: 'New expert not found' }, { status: 404 })
  }

  // Reassign the expert (preserving claimed_at and deadline_at)
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      expert_id: newExpertId,
      // claimed_at and deadline_at are NOT updated - preserved
    })
    .eq('id', submissionId)

  if (updateError) {
    console.error('Error reassigning expert:', updateError)
    return NextResponse.json({ error: 'Failed to reassign expert' }, { status: 500 })
  }

  // Log the reassignment in audit_log
  await supabase
    .from('audit_log')
    .insert({
      submission_id: submissionId,
      user_id: user.id,
      action: 'expert_reassigned',
      details: {
        old_expert_id: submission.expert_id,
        old_expert_name: oldExpert?.name,
        new_expert_id: newExpertId,
        new_expert_name: newExpert.name,
        claimed_at_preserved: submission.claimed_at,
        deadline_at_preserved: submission.deadline_at,
      },
    })

  // Send SMS notification to user (if phone number on file)
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select('phone_number')
    .eq('user_id', submission.user_id)
    .single()

  if (userRoleData?.phone_number) {
    let smsMessage = ''

    // Determine message based on reassignment scenario
    const oldExpertName = oldExpert?.name || 'your previous expert'
    const isUpgradeToRat = newExpert.name === 'The Rat' && newExpert.tier === 'premium'
    const isStandardReassignment =
      (oldExpertName === 'The Monkey' || oldExpertName === 'The Badger') &&
      (newExpert.name === 'The Monkey' || newExpert.name === 'The Badger')

    if (isUpgradeToRat) {
      // Upgrade to The Rat
      smsMessage = `Great news — your Trade Rat analysis has been picked up by The Rat himself. Expect a premium-level response. Your timeline is unchanged. Reply STOP to opt out.`
    } else if (isStandardReassignment) {
      // Standard expert reassignment
      smsMessage = `Your Trade Rat analysis has been assigned to a new expert. ${newExpert.name} will be reviewing your submission. Your place in queue is preserved and your response is on the way. Reply STOP to opt out.`
    } else {
      // Fallback for other scenarios (e.g., downgrade from Rat)
      smsMessage = `Your Trade Rat analysis has been assigned to a new expert. ${newExpert.name} will be reviewing your submission. Your place in queue is preserved and your response is on the way. Reply STOP to opt out.`
    }

    try {
      const smsResult = await sendSms({
        to: userRoleData.phone_number,
        message: smsMessage,
      })

      if (!smsResult.success) {
        console.error('SMS send failed:', smsResult.error)
        // Don't fail the reassignment if SMS fails - just log it
      }
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      // Continue even if SMS fails
    }
  }

  return NextResponse.json({
    success: true,
    oldExpert: oldExpert?.name,
    newExpert: newExpert.name,
  })
}
