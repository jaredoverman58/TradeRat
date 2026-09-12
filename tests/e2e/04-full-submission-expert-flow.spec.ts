import { test, expect } from '@playwright/test'
import { signUp, completeOnboarding, login } from '../helpers/auth'
import { completeStripeHostedCheckout, STRIPE_TEST_CARDS } from '../helpers/stripe'
import {
  generateTestEmail,
  createMockScreenshot,
  TEST_TRADE_DESCRIPTION,
} from '../fixtures/test-data'

test.describe('Full Submission to Expert Response Flow', () => {
  let customerEmail: string
  let screenshotPath: string

  // These should be set in .env.test
  const EXPERT_EMAIL = process.env.TEST_EXPERT_EMAIL || 'expert@traderat.co'
  const EXPERT_PASSWORD = process.env.TEST_EXPERT_PASSWORD || 'expert-password'

  test.beforeEach(() => {
    customerEmail = generateTestEmail()
    screenshotPath = createMockScreenshot()
  })

  test('complete flow: customer submits → expert claims → expert responds → customer views', async ({
    page,
    context,
  }) => {
    // ===== CUSTOMER: Sign up and purchase bundle =====
    await signUp(page, customerEmail, 'TestPassword123!')
    await completeOnboarding(page)

    // Buy a bundle to get credits
    await page.goto('/pricing')
    await page.locator('button').filter({ hasText: /buy|purchase/i }).first().click()
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()
    await completeStripeHostedCheckout(page, customerEmail, STRIPE_TEST_CARDS.SUCCESS)

    await page.waitForURL(/localhost:3000/, { timeout: 30000 })

    // ===== CUSTOMER: Submit trade evaluation =====
    await page.goto('/submit')

    // Select evaluation type
    await page.locator('text=Accept/Decline').first().click()

    // Fill trade description
    await page.fill('textarea[name="tradeDescription"]', TEST_TRADE_DESCRIPTION)

    // Upload screenshots
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles([screenshotPath, screenshotPath]) // Upload 2 screenshots

    // Wait for uploads
    await expect(page.locator('text=/2.*file|uploaded/i')).toBeVisible({ timeout: 10000 })

    // Fill league details
    await page.selectOption('select[name="platform"]', 'ESPN')
    await page.selectOption('select[name="scoringFormat"]', 'PPR')
    await page.fill('textarea[name="notes"]', 'Looking to upgrade my RB position')

    // Submit
    await page.click('button[type="submit"]:has-text("Submit")')

    // Should redirect to success or dashboard
    await expect(page).toHaveURL(/\/submit\/success|\/dashboard/, { timeout: 15000 })

    // Get submission ID from dashboard
    await page.goto('/dashboard')
    const submissionLink = page.locator('a[href*="/dashboard/advice/"]').first()
    await expect(submissionLink).toBeVisible({ timeout: 5000 })

    const submissionHref = await submissionLink.getAttribute('href')
    const submissionId = submissionHref?.split('/').pop()

    expect(submissionId).toBeTruthy()

    // Verify submission shows "Pending" status
    await expect(page.locator('text=/pending|waiting/i')).toBeVisible()

    // ===== EXPERT: Log in and claim submission =====

    // Open new page context for expert
    const expertPage = await context.newPage()

    // Login as expert
    await login(expertPage, EXPERT_EMAIL, EXPERT_PASSWORD)

    // Navigate to expert dashboard
    await expertPage.goto('/expert')

    // Find the submission in the queue
    await expect(
      expertPage.locator(`text=${TEST_TRADE_DESCRIPTION.substring(0, 20)}`)
    ).toBeVisible({ timeout: 5000 })

    // Click "Claim" button
    await expertPage
      .locator(`tr:has-text("${customerEmail}") button:has-text("Claim")`)
      .first()
      .click()

    // Should show success message
    await expect(expertPage.locator('text=/claimed|assigned/i')).toBeVisible({ timeout: 5000 })

    // ===== EXPERT: Submit response =====

    // Navigate to submission detail page
    await expertPage.goto(`/expert/submissions/${submissionId}`)

    // Fill response form
    await expertPage.selectOption('select[name="recommendation"]', 'accept')

    await expertPage.fill(
      'textarea[name="analysis"]',
      'This is a great trade for you. Jefferson is the best player in this deal and Jacobs gives you RB depth.'
    )

    await expertPage.fill(
      'textarea[name="rosterImpact"]',
      'Your WR corps remains strong and you significantly upgrade at RB.'
    )

    // Submit response
    await expertPage.click('button[type="submit"]:has-text("Submit")')

    // Should show success
    await expect(expertPage.locator('text=/submitted|complete/i')).toBeVisible({ timeout: 5000 })

    // ===== CUSTOMER: View response =====

    // Refresh customer dashboard
    await page.goto('/dashboard')
    await page.reload()

    // Submission should now show "Complete" or "Ready"
    await expect(page.locator('text=/complete|ready|view/i')).toBeVisible({ timeout: 5000 })

    // Click to view advice
    await page.goto(`/dashboard/advice/${submissionId}`)

    // Verify expert response is visible
    await expect(page.locator('text=/accept/i')).toBeVisible()
    await expect(page.locator('text=/great trade for you/i')).toBeVisible()
    await expect(page.locator('text=/significantly upgrade at RB/i')).toBeVisible()

    // Verify credit was consumed
    await page.goto('/dashboard')
    await expect(page.locator('text=/0.*credit/i')).toBeVisible()

    // Clean up
    await expertPage.close()
  })

  test('expert cannot claim submission already claimed by them', async ({ page, context }) => {
    // Set up submission (abbreviated)
    await signUp(page, customerEmail, 'TestPassword123!')
    await completeOnboarding(page)

    await page.goto('/pricing')
    await page.locator('button').filter({ hasText: /buy/i }).first().click()
    await page.locator('button:has-text("Continue to Checkout"), button:has-text("CONTINUE TO CHECKOUT")').click()
    await completeStripeHostedCheckout(page, customerEmail, STRIPE_TEST_CARDS.SUCCESS)

    await page.waitForURL(/localhost:3000/, { timeout: 30000 })
    await page.goto('/submit')
    await page.locator('input[value="accept_decline"]').first().click()
    await page.fill('textarea[name="tradeDescription"]', 'Quick test trade')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(screenshotPath)

    await page.click('button[type="submit"]')

    // Expert claims
    const expertPage = await context.newPage()
    await login(expertPage, EXPERT_EMAIL, EXPERT_PASSWORD)
    await expertPage.goto('/expert')

    await expertPage.locator('button:has-text("Claim")').first().click()
    await expect(expertPage.locator('text=/claimed/i')).toBeVisible()

    // Try to claim again - button should be disabled or show "Assigned to you"
    await expertPage.reload()
    await expect(expertPage.locator('text=/assigned to you|claimed/i')).toBeVisible()

    await expertPage.close()
  })
})
