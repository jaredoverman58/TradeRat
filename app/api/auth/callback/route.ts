import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user is an expert (but not admin) and redirect to /expert
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user has admin role
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const isAdmin = userRole?.role === 'admin'

        // Check if user is an expert
        const { data: expert } = await supabase
          .from('experts')
          .select('id')
          .eq('user_id', user.id)
          .single()

        // Always redirect non-admin experts to /expert on login (bypass onboarding and dashboard)
        if (expert && !isAdmin) {
          next = '/expert'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
