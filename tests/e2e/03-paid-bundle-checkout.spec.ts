import { test, expect } from '@playwright/test'
import { signUp, completeOnboarding } from '../helpers/auth'
import { completeStripeHostedCheckout, STRIPE_TEST_CARDS } from '../helpers/stripe'
import { generateTestEmail } from '../fixtures/test-data'

test.describe('Paid Bundle Checkout', () => {
  let testEmail: string

  test.beforeEach(() => {
    testEmail = generateTestEmail()
  })

  test('user purchases Single Standard bundle ($3.99) and receives 1 credit', async ({ page }) => {
    // Create account and complete onboarding
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    // Navigate to pricing page
    await page.goto('/pricing')

    // Click "Buy" button for Single Standard bundle (first Buy button)
    await page
      .locator('button:has-text("Buy"), button:has-text("Purchase")')
      .first()
      .click()

    // Click "Continue to Checkout" in the modal
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()

    // Should redirect to Stripe Checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })

    // Complete payment with test card
    await completeStripeHostedCheckout(page, testEmail, STRIPE_TEST_CARDS.SUCCESS)

    // Should redirect back to dashboard or pricing page
    await expect(page).toHaveURL(/\/dashboard|\/pricing/, { timeout: 30000 })

    // Navigate to dashboard to verify credit
    await page.goto('/dashboard')

    // Verify user has 1 credit
    await expect(page.locator('text=/1.*credit|credit.*1/i')).toBeVisible({ timeout: 10000 })

    // Verify bundle appears in account page
    await page.goto('/account')
    await expect(page.locator('text=/standard|bundle/i')).toBeVisible()
  })

  test('purchasing 3-Pack Standard bundle grants 3 credits', async ({ page }) => {
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    // Buy 3-Pack Standard bundle ($9.99, 3 credits)
    await page.goto('/pricing')
    await page
      .locator('button')
      .filter({ hasText: /buy|purchase/i })
      .nth(1)
      .click()

    // Click "Continue to Checkout" in the modal
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()

    await completeStripeHostedCheckout(page, testEmail, STRIPE_TEST_CARDS.SUCCESS)

    // Wait for redirect
    await page.waitForURL(/localhost:3000/, { timeout: 30000 })

    // Verify 3 credits
    await page.goto('/dashboard')
    await expect(page.locator('text=/3.*credit|credit.*3/i')).toBeVisible({ timeout: 10000 })
  })

  test('purchasing multiple bundles stacks credits', async ({ page }) => {
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    // Buy 3-Pack Standard (3 credits)
    await page.goto('/pricing')
    await page.locator('button:has-text("3-Pack")').first().click()
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()
    await completeStripeHostedCheckout(page, testEmail, STRIPE_TEST_CARDS.SUCCESS)

    await page.waitForURL(/localhost:3000/, { timeout: 30000 })

    // Buy Single Standard (1 credit)
    await page.goto('/pricing')
    await page.locator('button').filter({ hasText: /buy.*3\.99/i }).first().click()
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()
    await completeStripeHostedCheckout(page, testEmail, STRIPE_TEST_CARDS.SUCCESS)

    // Verify total credits = 4
    await page.goto('/dashboard')
    await expect(page.locator('text=/4.*credit|credit.*4/i')).toBeVisible({ timeout: 10000 })
  })

  test('declined card shows error and does not grant credit', async ({ page }) => {
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    await page.goto('/pricing')
    await page.locator('button').filter({ hasText: /buy|purchase/i }).first().click()
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()

    // Try to use declined test card
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 })

    await page.fill('input[type="email"]', testEmail)

    const cardFrame = page.frameLocator('iframe[name*="number"]').first()
    await cardFrame.locator('input[name="number"]').fill(STRIPE_TEST_CARDS.DECLINE)

    const expiryFrame = page.frameLocator('iframe[name*="expiry"]').first()
    await expiryFrame.locator('input[name="expiry"]').fill('1230')

    const cvcFrame = page.frameLocator('iframe[name*="cvc"]').first()
    await cvcFrame.locator('input[name="cvc"]').fill('123')

    await page.fill('input[name="billingName"]', 'Test User')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=/declined|error|failed/i')).toBeVisible({ timeout: 10000 })

    // Navigate back to app manually
    await page.goto('http://localhost:3000/dashboard')

    // Verify no credits were granted
    await expect(page.locator('text=/0.*credit|no credit/i')).toBeVisible()
  })
})
