import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OverviewTab from './OverviewTab'
import SubmissionsTab from './SubmissionsTab'
import LandingPageTab from './LandingPageTab'
import TestimonialsTab from './TestimonialsTab'
import UsersTab from './UsersTab'
import PaymentsTab from './PaymentsTab'
import SupportTab from './SupportTab'
import AnalyticsTab from './AnalyticsTab'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Not Authorized
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            marginBottom: '32px',
          }}>
            Your account does not have admin access.
          </p>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              display: 'inline-block',
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Determine active tab (default to 'overview')
  const activeTab = params.tab || 'overview'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#F2EDE4',
              marginBottom: '8px',
            }}>
              Admin Dashboard
            </h1>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              fontSize: '1rem',
            }}>
              {user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              href="/dashboard"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6b6457',
                border: '1px solid #2a261e',
                fontSize: '0.875rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Dashboard
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  border: '1px solid #2a261e',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #2a261e' }}>
          <div style={{ display: 'flex', gap: '32px', overflowX: 'auto' }}>
            <Link
              href="/admin?tab=overview"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'overview' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'overview' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Overview
            </Link>
            <Link
              href="/admin?tab=submissions"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'submissions' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'submissions' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Submissions
            </Link>
            <Link
              href="/admin?tab=users"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'users' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'users' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Users
            </Link>
            <Link
              href="/admin?tab=payments"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'payments' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'payments' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Payments
            </Link>
            <Link
              href="/admin?tab=support"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'support' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'support' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Support
            </Link>
            <Link
              href="/admin?tab=analytics"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'analytics' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'analytics' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Analytics
            </Link>
            <Link
              href="/admin?tab=landing-page"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'landing-page' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'landing-page' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Landing Page
            </Link>
            <Link
              href="/admin?tab=testimonials"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingBottom: '16px',
                textDecoration: 'none',
                color: activeTab === 'testimonials' ? '#C9A84C' : '#6b6457',
                borderBottom: activeTab === 'testimonials' ? '2px solid #C9A84C' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              Testimonials
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'submissions' && <SubmissionsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'support' && <SupportTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'landing-page' && <LandingPageTab />}
        {activeTab === 'testimonials' && <TestimonialsTab />}
      </div>
    </div>
  )
}
