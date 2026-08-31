import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 })
    }

    // Get target user details
    const adminClient = createAdminClient()
    console.log('=== BEFORE getUserById ===')
    console.log('Requested targetUserId:', targetUserId)
    console.log('========================')

    const { data: targetUserData, error: userError } = await adminClient.auth.admin.getUserById(targetUserId)

    console.log('=== AFTER getUserById ===')
    console.log('Error:', userError)
    console.log('Full targetUserData:', JSON.stringify(targetUserData, null, 2))
    console.log('targetUserData.user.id:', targetUserData?.user?.id)
    console.log('targetUserData.user.email:', targetUserData?.user?.email)
    console.log('========================')

    if (userError || !targetUserData.user || !targetUserData.user.email) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const targetUser = targetUserData.user

    // Check if target user is an expert to determine redirect
    const { data: expert } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', targetUserId)
      .single()

    // Determine appropriate landing page based on role
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const redirectPath = expert ? '/expert' : '/dashboard'
    const redirectTo = `${baseUrl}/auth/confirm?next=${redirectPath}`

    // Generate magic link for target user
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.email!, // Already verified not null above
      options: {
        redirectTo,
      },
    })

    console.log('=== LOGIN-AS API DEBUG ===')
    console.log('Target User ID:', targetUserId)
    console.log('Target User Email:', targetUser.email)
    console.log('Redirect To:', redirectTo)
    console.log('Generated Link Data:', linkData)
    console.log('Action Link:', linkData.properties?.action_link)
    console.log('=========================')

    if (linkError || !linkData.properties?.action_link) {
      return NextResponse.json(
        { error: 'Failed to generate login link', details: linkError?.message },
        { status: 500 }
      )
    }

    // Log the impersonation in audit_log
    await supabase.from('audit_log').insert({
      user_id: currentUser.id,
      action: 'admin_impersonation',
      details: {
        admin_user_id: currentUser.id,
        admin_email: currentUser.email,
        target_user_id: targetUserId,
        target_user_email: targetUser.email,
        redirect_path: redirectPath,
      },
    })

    console.log('=== RETURNING TO CLIENT ===')
    console.log('Full action_link being returned:', linkData.properties.action_link)
    console.log('===========================')

    return NextResponse.json({
      success: true,
      action_link: linkData.properties.action_link,
      target_email: targetUser.email,
      redirect_path: redirectPath,
    })
  } catch (error) {
    console.error('Error generating login-as link:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
