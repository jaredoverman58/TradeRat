import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (svg, png, jpg, jpeg, gif, webp)
     * - /api/stripe/webhook (Stripe webhook endpoint - uses signature auth, not sessions)
     * - /api/capacity/check (public endpoint for checking expert availability)
     * - /api/waitlist/* (waitlist endpoints handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|api/capacity/check|api/waitlist|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
