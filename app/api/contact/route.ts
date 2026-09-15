import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { name, email, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Check rate limit using the database function
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_contact_rate_limit', { p_email: email })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return NextResponse.json(
        { error: 'Failed to check rate limit' },
        { status: 500 }
      )
    }

    if (!rateLimitCheck) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can send 3 messages per 24 hours and 6 per week.' },
        { status: 429 }
      )
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Insert contact message
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        user_id: user?.id || null,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #C9A84C; font-size: 24px; margin-bottom: 16px;">New Contact Form Message</h1>

        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px 0; color: #333;"><strong>From:</strong> ${name}</p>
          <p style="margin: 0 0 8px 0; color: #333;"><strong>Email:</strong> ${email}</p>
          ${user?.id ? `<p style="margin: 0; color: #666; font-size: 14px;">User ID: ${user.id}</p>` : '<p style="margin: 0; color: #666; font-size: 14px;">Not logged in</p>'}
        </div>

        <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 16px; border-radius: 4px;">
          <h2 style="color: #333; font-size: 16px; margin: 0 0 12px 0;">Message:</h2>
          <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `

    await sendEmail({
      to: 'jaredoverman58@gmail.com',
      subject: `New Contact Form Message from ${name}`,
      html: emailHtml,
    })

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
