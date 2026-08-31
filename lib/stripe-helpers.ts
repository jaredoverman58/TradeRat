import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

/**
 * Helper function to check if a Stripe customer has a payment method on file
 */
export async function hasPaymentMethodOnFile(customerId: string): Promise<boolean> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data.length > 0
}
