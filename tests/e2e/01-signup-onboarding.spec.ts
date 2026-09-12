import { test, expect } from '@playwright/test'
import { signUp, completeOnboarding } from '../helpers/auth'
import { generateTestEmail } from '../fixtures/test-data'

test.describe('Signup and Onboarding Flow', () => {
  let testEmail: string

  test.beforeEach(() => {
    testEmail = generateTestEmail()
  })

  test('new user completes signup and 3-step onboarding', async ({ page }) => {
    // Step 1: Sign up
    await signUp(page, testEmail, 'TestPassword123!')

    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding')

    // Step 2: Complete onboarding
    await completeOnboarding(page)

    // Step 3: Verify landed on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|welcome/i })).toBeVisible()

    // Verify user sees their account
    await expect(page.locator(`text=${testEmail}`)).toBeVisible()
  })

  test.skip('onboarding saves platform preference', async ({ page }) => {
    // SKIPPED: Platform preference is no longer collected during onboarding
    // Platform selection now happens in the submission flow
    await signUp(page, testEmail, 'TestPassword123!')
    await completeOnboarding(page)

    await page.goto('/account')
    await expect(page.locator('text=/yahoo/i')).toBeVisible()
  })
})
