import { test, expect } from '@playwright/test'
import { signUp, completeOnboarding } from '../helpers/auth'
import { completeStripeHostedCheckout, STRIPE_TEST_CARDS } from '../helpers/stripe'
import {
  generateTestEmail,
  createMockScreenshot,
  TEST_TRADE_DESCRIPTION,
} from '../fixtures/test-data'

test.describe('Free Submission with Payment Setup Required', () => {
  let testEmail: string
  let screenshotPath: string

  test.beforeEach(async () => {
    testEmail = generateTestEmail()
    screenshotPath = createMockScreenshot()
  })

  test('free evaluation triggers payment setup modal and auto-submits after adding card', async ({
    page,
  }) => {
    // Create account
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    // Navigate to submit page
    await page.goto('/submit')

    // Select "Accept/Decline" service type (radio button)
    await page.locator('text=Accept/Decline').first().click()

    // Fill trade details - receive and give players
    await page.locator('textarea[placeholder*="Christian McCaffrey"]').fill('Christian McCaffrey')
    await page.locator('textarea[placeholder*="Justin Jefferson"]').fill('Justin Jefferson, Joe Mixon')

    // Upload screenshot
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(screenshotPath)

    // Wait for upload to complete
    await expect(page.locator('text=/uploaded/i, img[alt*="screenshot"]')).toBeVisible({ timeout: 10000 })

    // Mark file as "This is my roster" (required)
    await page.locator('input[type="checkbox"]').first().check()

    // Submit form - should trigger payment setup modal
    await page.click('button[type="submit"]:has-text("Submit")')

    // Expect modal with "Add Payment Method" message
    await expect(page.locator('text=/payment method required/i')).toBeVisible({ timeout: 5000 })

    // Click "Add Card" or "Continue to Payment" button
    const continueButton = page.locator(
      'button:has-text("Add Card"), button:has-text("Add Payment")'
    )

    // This should redirect to Stripe setup-mode checkout
    await continueButton.click()

    // Complete Stripe checkout in setup mode
    await completeStripeHostedCheckout(page, testEmail, STRIPE_TEST_CARDS.SUCCESS)

    // Should redirect back to app and auto-submit the saved form
    await expect(page).toHaveURL(/\/submit\/success|\/dashboard/, { timeout: 30000 })

    // Verify submission was created
    await page.goto('/dashboard')
    await expect(page.locator(`text=${TEST_TRADE_DESCRIPTION.substring(0, 30)}`)).toBeVisible({
      timeout: 5000,
    })
  })

  test('user can cancel payment setup and submission is not created', async ({ page }) => {
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    await page.goto('/submit')
    await page.locator('text=Accept/Decline').first().click()

    // Fill trade players
    await page.locator('textarea[placeholder*="Christian McCaffrey"]').fill('Christian McCaffrey')
    await page.locator('textarea[placeholder*="Justin Jefferson"]').fill('Justin Jefferson')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(screenshotPath)

    // Wait for upload and mark as "This is my roster"
    await expect(page.locator('text=/uploaded/i, img[alt*="screenshot"]')).toBeVisible({ timeout: 10000 })
    await page.locator('input[type="checkbox"]').first().check()

    await page.click('button[type="submit"]:has-text("Submit")')

    // Payment modal appears
    await expect(page.locator('text=/payment method required/i')).toBeVisible()

    // Close modal (cancel)
    await page.click('button:has-text("Cancel"), button[aria-label="Close"]')

    // Should still be on submit page
    await expect(page).toHaveURL('/submit')

    // No submission in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=/no submissions|get started/i')).toBeVisible()
  })
})
