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

    // Clear deletion_requested_at to cancel deletion
    const { error } = await supabase
      .from('user_roles')
      .update({ deletion_requested_at: null })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error cancelling account deletion:', error)
      return NextResponse.json(
        { error: 'Failed to cancel account deletion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in cancel-deletion route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
