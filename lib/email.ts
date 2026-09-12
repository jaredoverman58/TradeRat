import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

let resendClient: Resend | null = null

function getResendClient() {
  if (!resendApiKey) {
    console.error('Resend API key not configured')
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(resendApiKey)
  }

  return resendClient
}

export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Send an email notification via Resend
 * @param to - Email address to send to
 * @param subject - Email subject line
 * @param html - Email HTML body
 * @returns Result object with success status
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  const client = getResendClient()

  if (!client) {
    return {
      success: false,
      error: 'Resend client not configured',
    }
  }

  try {
    const result = await client.emails.send({
      from: 'Trade Rat <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    })

    console.log(`Email sent successfully to ${to}, ID: ${result.data?.id}`)

    return {
      success: true,
      emailId: result.data?.id,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a confirmation email when a submission is received
 * @param email - User's email address
 * @param submissionId - Submission ID
 * @param serviceType - Type of service (accept_decline, counter_offer, etc.)
 * @returns Result object with success status
 */
export async function sendSubmissionConfirmation(
  email: string,
  submissionId: string,
  serviceType: string
): Promise<SendEmailResult> {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const serviceNames: Record<string, string> = {
    accept_decline: 'Accept/Decline Evaluation',
    counter_offer: 'Counter Offer',
    bundle: 'Accept/Decline + Bonus Evaluation',
    trade_finder: 'Trade Finder',
  }

  const serviceName = serviceNames[serviceType] || 'Trade Evaluation'

  const subject = "We received your trade evaluation — here's what happens next"

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 16px;">Your request is confirmed</h1>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Thanks for submitting your <strong>${serviceName}</strong> request. Your submission has been received and added to our expert queue.
      </p>

      <div style="background-color: #f5f5f5; border-left: 4px solid #C9A84C; padding: 16px; margin: 24px 0;">
        <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">What happens next:</h2>
        <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>An expert will claim your request and review your submission</li>
          <li>They&apos;ll analyze your trade and prepare their response</li>
          <li>You&apos;ll receive an email when your analysis is ready</li>
        </ol>
      </div>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        We know your trade window won&apos;t wait — we always aim to respond as quickly as possible. Most evaluations are delivered within a few hours.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #C9A84C; color: #0C0A07; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          View Your Dashboard
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">

      <p style="color: #999; font-size: 12px; line-height: 1.6;">
        You&apos;re receiving this because you submitted a trade evaluation request at Trade Rat.
      </p>
    </div>
  `

  return sendEmail({ to: email, subject, html })
}

/**
 * Send a "response ready" notification to a user
 * @param email - User's email address
 * @param submissionId - Submission ID for the link
 * @returns Result object with success status
 */
export async function sendResponseReadyNotification(
  email: string,
  submissionId: string
): Promise<SendEmailResult> {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const viewUrl = `${appUrl}/dashboard/advice/${submissionId}`

  const subject = 'Your Trade Rat analysis is ready'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 16px;">Your analysis is ready</h1>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Your expert has completed their analysis of your trade. Log in to view your personalized recommendation.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${viewUrl}" style="display: inline-block; background-color: #C9A84C; color: #0C0A07; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          View Your Analysis
        </a>
      </div>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 24px;">
        Or copy this link: <a href="${viewUrl}" style="color: #C9A84C; word-break: break-all;">${viewUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">

      <p style="color: #999; font-size: 12px; line-height: 1.6;">
        You&apos;re receiving this because your trade evaluation request has been completed.
      </p>
    </div>
  `

  return sendEmail({ to: email, subject, html })
}
