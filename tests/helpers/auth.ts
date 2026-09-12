import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function signUp(page: Page, email: string, password: string) {
  const adminClient = getAdminClient()
  await adminClient.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 10000 })
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

export async function logout(page: Page) {
  await page.goto('/dashboard')
  await page.click('button:has-text("Sign Out"), a:has-text("Sign Out")')
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 })
}

export async function completeOnboarding(page: Page) {
  await page.waitForURL('/onboarding')

  // Step 1: Click "Get Started"
  await page.locator('button:has-text("Get Started")').click()

  // Step 2: Click "Skip for now" on league profiles page
  await page.locator('button:has-text("Skip for now")').click()

  // Step 3: Click "Claim Your Free Analysis"
  await page.locator('button:has-text("Claim Your Free Analysis")').click()

  await page.waitForURL('/dashboard', { timeout: 10000 })
}

export async function loginAsUser(
  page: Page,
  adminEmail: string,
  adminPassword: string,
  targetUserEmail: string
) {
  await login(page, adminEmail, adminPassword)
  await page.goto('/admin')

  await page.fill('input[type="search"], input[placeholder*="email"]', targetUserEmail)
  await page.locator(`tr:has-text("${targetUserEmail}") button:has-text("Login As")`).first().click()

  await page.waitForURL('/dashboard', { timeout: 10000 })
}
