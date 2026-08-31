import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { hasPaymentMethodOnFile } from '@/lib/stripe-helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get or create Stripe customer
    let customerId: string | null = null

    // Check if user has a Stripe customer ID in our database
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Check if customer already has a payment method
    if (!customerId) {
      throw new Error('Failed to create or retrieve Stripe customer')
    }

    const hasPaymentMethod = await hasPaymentMethodOnFile(customerId)

    // Create Checkout Session in setup mode
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      success_url: `${baseUrl}/submit?free_eval=true&setup=success`,
      cancel_url: `${baseUrl}/submit?free_eval=true&setup=cancelled`,
    })

    return NextResponse.json({
      url: session.url,
      hasPaymentMethod,
    })
  } catch (error) {
    console.error('Error creating setup checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create setup checkout session' },
      { status: 500 }
    )
  }
}
