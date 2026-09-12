import { Page } from '@playwright/test'

/**
 * Stripe test card numbers
 * https://stripe.com/docs/testing#cards
 */
export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  REQUIRE_3DS: '4000002500003155',
  DECLINE: '4000000000000002',
}

/**
 * Fill Stripe checkout form with test card (embedded Stripe Elements)
 */
export async function fillStripeCheckout(
  page: Page,
  cardNumber: string = STRIPE_TEST_CARDS.SUCCESS,
  email?: string
) {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()

  // Fill card number
  await stripeFrame.locator('input[name="number"], input[placeholder*="Card number"]').fill(cardNumber)

  // Fill expiry (any future date)
  await stripeFrame.locator('input[name="expiry"], input[placeholder*="MM"]').fill('12/30')

  // Fill CVC
  await stripeFrame.locator('input[name="cvc"], input[placeholder*="CVC"]').fill('123')

  // Fill ZIP if present
  const zipInput = stripeFrame.locator('input[name="postalCode"], input[placeholder*="ZIP"]')
  if ((await zipInput.count()) > 0) {
    await zipInput.fill('12345')
  }

  // Fill email if provided and field exists
  if (email) {
    const emailInput = page.locator('input[type="email"]')
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(email)
    }
  }
}

/**
 * Complete Stripe hosted checkout page
 */
export async function completeStripeHostedCheckout(
  page: Page,
  email: string,
  cardNumber: string = STRIPE_TEST_CARDS.SUCCESS
) {
  // Wait for Stripe Checkout page to load
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })

  // Fill email if field is present (may be pre-filled if customer is logged in)
  const emailInput = page.locator('input[type="email"]')
  if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await emailInput.fill(email)
  }

  // Select "Card" payment method by clicking the radio button
  await page.locator('input[type="radio"][value="card"], button[aria-label*="Pay with card"]').first().click()

  // Wait for card input fields to appear
  await page.waitForSelector('iframe[name*="number"]', { timeout: 5000 })

  // Fill card details in iframes
  const cardFrame = page.frameLocator('iframe[name*="number"]').first()
  await cardFrame.locator('input[name="number"]').fill(cardNumber)

  const expiryFrame = page.frameLocator('iframe[name*="expiry"]').first()
  await expiryFrame.locator('input[name="expiry"]').fill('1230')

  const cvcFrame = page.frameLocator('iframe[name*="cvc"]').first()
  await cvcFrame.locator('input[name="cvc"]').fill('123')

  // Fill billing details
  await page.fill('input[name="billingName"]', 'Test User')

  // Submit
  await page.click('button[type="submit"]')

  // Wait for redirect back to app
  await page.waitForURL(/localhost:3000/, { timeout: 30000 })
}
