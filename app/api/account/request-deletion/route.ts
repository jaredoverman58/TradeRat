import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's phone number
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('phone_number')
      .eq('user_id', user.id)
      .single()

    // Mark account for deletion
    const { error } = await supabase
      .from('user_roles')
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking account for deletion:', error)
      return NextResponse.json(
        { error: 'Failed to request account deletion' },
        { status: 500 }
      )
    }

    // Send SMS if phone number exists
    if (userRole?.phone_number) {
      try {
        // Call Twilio SMS API
        await fetch('/api/twilio/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userRole.phone_number,
            message: 'You have requested to delete your Trade Rat account. You have 30 days to cancel by logging back in. After 30 days your account and all data will be permanently deleted. Reply STOP to opt out.',
          }),
        })
      } catch (smsError) {
        // Log but don't fail the request if SMS fails
        console.error('Failed to send deletion SMS:', smsError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in request-deletion route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
