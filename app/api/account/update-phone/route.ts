import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    // Validate E.164 format if phone number is provided
    if (phoneNumber && phoneNumber.trim() !== '') {
      const e164Regex = /^\+[1-9]\d{1,14}$/
      if (!e164Regex.test(phoneNumber.trim())) {
        return NextResponse.json(
          { error: 'Phone number must be in E.164 format (e.g., +1XXXXXXXXXX)' },
          { status: 400 }
        )
      }
    }

    // Update phone number in user_roles table
    const { error } = await supabase
      .from('user_roles')
      .update({ phone_number: phoneNumber.trim() || null })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating phone number:', error)
      return NextResponse.json(
        { error: 'Failed to update phone number' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update-phone route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
