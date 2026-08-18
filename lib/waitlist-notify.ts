import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

/**
 * Notify the next person in the waitlist queue when a spot opens
 * Called when a submission is completed
 */
export async function notifyNextInQueue(tier: 'rat_rate' | 'standard') {
  // Use service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Find the next person in queue (oldest first, not yet notified, not converted, not cancelled)
    const { data: nextInQueue, error: queueError } = await supabase
      .from('waitlist')
      .select(`
        *,
        user:user_roles!waitlist_user_id_fkey(phone_number)
      `)
      .eq('tier', tier)
      .is('notified_at', null)
      .is('converted_at', null)
      .is('cancelled_at', null)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single()

    if (queueError || !nextInQueue) {
      console.log(`No one in queue for ${tier}`)
      return { success: false, reason: 'no_one_in_queue' }
    }

    // Check if user has a phone number
    if (!nextInQueue.user?.phone_number) {
      console.error('User has no phone number, skipping:', nextInQueue.user_id)
      // Mark as cancelled and try next person
      await supabase
        .from('waitlist')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', nextInQueue.id)

      // Recursively try next person
      return await notifyNextInQueue(tier)
    }

    // Set notification time and expiration (2 hours from now)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours

    const { error: updateError } = await supabase
      .from('waitlist')
      .update({
        notified_at: now.toISOString(),
        spot_expires_at: expiresAt.toISOString()
      })
      .eq('id', nextInQueue.id)

    if (updateError) {
      console.error('Error updating waitlist entry:', updateError)
      return { success: false, reason: 'update_failed', error: updateError }
    }

    // Send SMS notification via Twilio
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    const message = `A spot has opened on The Trade Rat! You have 2 hours to submit your request. Visit trade-rat.vercel.app/submit to claim your spot.`

    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: nextInQueue.user.phone_number
      })

      console.log(`SMS sent to ${nextInQueue.user.phone_number} for ${tier} waitlist spot`)

      return {
        success: true,
        waitlistId: nextInQueue.id,
        userId: nextInQueue.user_id,
        expiresAt: expiresAt.toISOString()
      }
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      // Still return success since the spot was allocated, just SMS failed
      return {
        success: true,
        smsError,
        waitlistId: nextInQueue.id,
        userId: nextInQueue.user_id
      }
    }
  } catch (error) {
    console.error('Error in notifyNextInQueue:', error)
    return { success: false, reason: 'unexpected_error', error }
  }
}

/**
 * Check for expired waitlist spots and notify the next person
 * Can be called periodically or when checking capacity
 */
export async function processExpiredSpots() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const now = new Date().toISOString()

    // Find expired spots (notified but not converted and past expiration)
    const { data: expired, error: expiredError } = await supabase
      .from('waitlist')
      .select('id, tier')
      .not('notified_at', 'is', null)
      .is('converted_at', null)
      .is('cancelled_at', null)
      .lt('spot_expires_at', now)

    if (expiredError) {
      console.error('Error finding expired spots:', expiredError)
      return { success: false, error: expiredError }
    }

    if (!expired || expired.length === 0) {
      return { success: true, processed: 0 }
    }

    console.log(`Found ${expired.length} expired waitlist spots`)

    // Mark expired spots as cancelled
    const expiredIds = expired.map(e => e.id)
    await supabase
      .from('waitlist')
      .update({ cancelled_at: now })
      .in('id', expiredIds)

    // Notify next person for each expired tier
    const tiers = [...new Set(expired.map(e => e.tier))] as ('rat_rate' | 'standard')[]

    for (const tier of tiers) {
      await notifyNextInQueue(tier)
    }

    return { success: true, processed: expired.length }
  } catch (error) {
    console.error('Error in processExpiredSpots:', error)
    return { success: false, error }
  }
}
