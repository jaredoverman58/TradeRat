import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Reset onboarding_completed to false for this admin
  const { error } = await supabase
    .from('user_roles')
    .update({ onboarding_completed: false })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error resetting onboarding:', error)
    return NextResponse.json({ error: 'Failed to reset onboarding' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
