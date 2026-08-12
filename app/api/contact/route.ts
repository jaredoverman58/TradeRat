import { createClient } from '@/lib/supabase/server'
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
