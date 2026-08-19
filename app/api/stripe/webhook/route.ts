import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Create Supabase client with service role for webhook
// Webhooks don't have user context, so we need service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Extract metadata
    const userId = session.metadata?.supabase_user_id
    const bundleType = session.metadata?.bundle_type
    const serviceType = session.metadata?.service_type

    if (!userId || !bundleType || !serviceType) {
      console.error('Missing metadata in checkout session:', session.id)
      return NextResponse.json(
        { error: 'Missing metadata' },
        { status: 400 }
      )
    }

    // Determine credits based on bundle_type + service_type combination
    let creditsRemaining = 0

    // Accept/Decline bundles (multi-credit)
    if (serviceType === 'accept_decline') {
      if (bundleType === 'standard_3_pack') {
        creditsRemaining = 3
      } else if (bundleType === 'standard_5_pack') {
        creditsRemaining = 5
      } else if (bundleType === 'rat_rate_3_pack') {
        creditsRemaining = 3
      } else if (bundleType === 'rat_rate_5_pack') {
        creditsRemaining = 5
      } else {
        console.error('Unknown bundle_type for accept_decline:', bundleType)
        return NextResponse.json(
          { error: 'Unknown bundle configuration' },
          { status: 400 }
        )
      }
    }
    // Accept/Decline + Bonus bundles (single-credit)
    else if (serviceType === 'bundle') {
      if (bundleType === 'standard_3_pack' || bundleType === 'rat_rate_3_pack') {
        creditsRemaining = 1
      } else {
        console.error('Unknown bundle_type for bundle service:', bundleType)
        return NextResponse.json(
          { error: 'Unknown bundle configuration' },
          { status: 400 }
        )
      }
    }
    // Counter Offer standalone (single-credit)
    else if (serviceType === 'counter_offer') {
      if (bundleType === 'standard_3_pack' || bundleType === 'rat_rate_3_pack') {
        creditsRemaining = 1
      } else {
        console.error('Unknown bundle_type for counter_offer:', bundleType)
        return NextResponse.json(
          { error: 'Unknown bundle configuration' },
          { status: 400 }
        )
      }
    }
    else {
      console.error('Unknown service_type:', serviceType)
      return NextResponse.json(
        { error: 'Unknown service type' },
        { status: 400 }
      )
    }

    // Calculate expiration date (1 year from now)
    const purchasedAt = new Date()
    const expiresAt = new Date(purchasedAt)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Create bundle record
    const { error: bundleError } = await supabase
      .from('bundles')
      .insert({
        user_id: userId,
        bundle_type: bundleType,
        service_type: serviceType,
        credits_remaining: creditsRemaining,
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })

    if (bundleError) {
      console.error('Error creating bundle:', bundleError)
      return NextResponse.json(
        { error: 'Failed to create bundle' },
        { status: 500 }
      )
    }

    console.log(`Bundle created successfully for user ${userId}: ${bundleType} (${serviceType}) - ${creditsRemaining} credits`)
  }

  return NextResponse.json({ received: true })
}

// Configure route to handle raw body for Stripe signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Next.js 15 uses bodyParser config differently - the raw body is available via request.text()
// which we're already using above, so no additional config needed
