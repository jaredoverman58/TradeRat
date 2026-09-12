import * as path from 'path'
import * as fs from 'fs'

/**
 * Test data for submissions
 */
export const TEST_LEAGUE_RULES = {
  platform: 'ESPN',
  scoringFormat: 'PPR',
  rosterSize: '10 teams',
  tradeDeadline: '2026-11-15',
}

export const TEST_TRADE_DESCRIPTION =
  'My CMC and Tyreek Hill for their Justin Jefferson and Josh Jacobs'

/**
 * Create a mock screenshot file for testing
 * Returns a path to a 1x1 PNG
 */
export function createMockScreenshot(filename: string = 'test-screenshot.png'): string {
  // 1x1 transparent PNG base64
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )

  const tempDir = path.join(__dirname, '..', 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const filepath = path.join(tempDir, filename)
  fs.writeFileSync(filepath, pngData)
  return filepath
}

/**
 * Generate unique test email
 * Uses gmail.com to pass email validation (real domain)
 */
export function generateTestEmail(): string {
  return `traderat.test.${Date.now()}.${Math.random().toString(36).substring(7)}@gmail.com`
}
