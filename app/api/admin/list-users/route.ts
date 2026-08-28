import { createAdminClient } from '@/lib/supabase/server'
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

  try {
    const adminClient = createAdminClient()

    // Fetch all users using admin client
    const { data, error } = await adminClient.auth.admin.listUsers()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    // Format users for dropdown
    const users = data.users.map(u => ({
      id: u.id,
      email: u.email || 'No email',
      created_at: u.created_at,
    }))

    // Sort by email
    users.sort((a, b) => a.email.localeCompare(b.email))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
