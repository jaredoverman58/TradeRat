import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    // Find highest existing testuser{N} by querying ALL users
    // Use pagination to get all users (not just first 50)
    let allUsers: any[] = []
    let page = 1
    const perPage = 1000 // Max per page

    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) {
        throw error
      }

      allUsers = allUsers.concat(data.users)

      // If we got fewer users than perPage, we've reached the end
      if (data.users.length < perPage) {
        break
      }

      page++
    }

    // Extract testuser numbers
    const testUserNumbers = allUsers
      .map(u => u.email)
      .filter(email => email && email.match(/^testuser\d+@traderat-test\.com$/))
      .map(email => {
        const match = email!.match(/^testuser(\d+)@traderat-test\.com$/)
        return match ? parseInt(match[1], 10) : 0
      })

    const maxN = testUserNumbers.length > 0 ? Math.max(...testUserNumbers) : 0
    const newN = maxN + 1
    const newEmail = `testuser${newN}@traderat-test.com`

    // Create user with admin API (bypasses signup rate limits and email confirmation)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: newEmail,
      password: 'testpassword123', // Fixed test password for all test users
      email_confirm: true, // Skip email verification
    })

    if (authError) {
      throw authError
    }

    console.log('=== CREATE-TEST-USER API ===')
    console.log('Created new test user:')
    console.log('  Email:', authData.user.email)
    console.log('  User ID:', authData.user.id)
    console.log('============================')

    return NextResponse.json({
      userId: authData.user.id,
      email: authData.user.email,
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    )
  }
}
