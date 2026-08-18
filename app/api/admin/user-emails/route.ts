import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { userIds } = body

  if (!Array.isArray(userIds)) {
    return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 })
  }

  // Use admin client to fetch user emails
  const adminClient = createAdminClient()
  const { data: authUsers } = await adminClient.auth.admin.listUsers()

  const emails: Record<string, string> = {}

  if (authUsers?.users) {
    for (const authUser of authUsers.users) {
      if (userIds.includes(authUser.id) && authUser.email) {
        emails[authUser.id] = authUser.email
      }
    }
  }

  return NextResponse.json({ emails })
}
