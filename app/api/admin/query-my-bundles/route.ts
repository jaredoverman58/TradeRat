import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query bundles for this user
  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bundles', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    user_id: user.id,
    user_email: user.email,
    bundles: bundles || [],
  })
}
