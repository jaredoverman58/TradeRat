import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

let twilioClient: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured')
    return null
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken)
  }

  return twilioClient
}

export interface SendSmsParams {
  to: string
  message: string
}

export interface SendSmsResult {
  success: boolean
  messageSid?: string
  error?: string
}

/**
 * Send an SMS notification via Twilio
 * @param to - Phone number to send to (E.164 format recommended, e.g., +1234567890)
 * @param message - Message body
 * @returns Result object with success status
 */
export async function sendSms({ to, message }: SendSmsParams): Promise<SendSmsResult> {
  const client = getTwilioClient()

  if (!client) {
    return {
      success: false,
      error: 'Twilio client not configured',
    }
  }

  if (!twilioPhoneNumber) {
    return {
      success: false,
      error: 'Twilio phone number not configured',
    }
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    })

    console.log(`SMS sent successfully to ${to}, SID: ${result.sid}`)

    return {
      success: true,
      messageSid: result.sid,
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a "response ready" notification to a user
 * @param phoneNumber - User's phone number
 * @param submissionId - Submission ID for the link
 * @returns Result object with success status
 */
export async function sendResponseReadyNotification(
  phoneNumber: string,
  submissionId: string
): Promise<SendSmsResult> {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const message = `Your Trade Rat analysis is ready. Log in to view it: ${appUrl}/dashboard`

  return sendSms({ to: phoneNumber, message })
}
