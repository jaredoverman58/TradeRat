import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

  // Fetch all experts
  const { data: experts, error } = await supabase
    .from('experts')
    .select('id, name, tier')
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch experts' }, { status: 500 })
  }

  return NextResponse.json({ experts })
}
