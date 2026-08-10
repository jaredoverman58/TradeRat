import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's packages
  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  // Calculate total credits
  const totalCredits = packages?.reduce((sum, pkg) => sum + pkg.credits_remaining, 0) || 0

  // Fetch user's trade requests
  const { data: tradeRequests } = await supabase
    .from('trade_requests')
    .select(`
      *,
      trade_advice (
        id,
        expert,
        recommendation,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  const pendingRequests = tradeRequests?.filter(r => r.status === 'pending' || r.status === 'assigned') || []
  const completedRequests = tradeRequests?.filter(r => r.status === 'completed') || []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#F2EDE4',
              marginBottom: '8px',
            }}>
              Dashboard
            </h1>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              fontSize: '1rem',
            }}>
              {user.email}
            </p>
          </div>
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

        {/* Credits Summary */}
        <div style={{
          border: '2px solid #C9A84C',
          padding: '40px',
          marginBottom: '40px',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#6b6457',
            marginBottom: '12px',
          }}>
            Available Credits
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '4rem',
            fontWeight: 900,
            color: '#C9A84C',
            marginBottom: '20px',
          }}>
            {totalCredits}
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/dashboard/submit"
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
              Submit Trade Request
            </Link>
            <Link
              href="/#pricing"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '16px 40px',
                backgroundColor: 'transparent',
                color: '#6b6457',
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: '1px solid #C9A84C',
                display: 'inline-block',
              }}
            >
              Buy More Credits
            </Link>
          </div>
        </div>

        {/* Active Packages */}
        {packages && packages.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Your Packages
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              backgroundColor: '#2a261e',
            }}>
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  style={{
                    backgroundColor: '#0C0A07',
                    padding: '32px',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#C9A84C',
                    marginBottom: '12px',
                  }}>
                    {pkg.package_type.replace('_', ' ')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#F2EDE4',
                    marginBottom: '8px',
                  }}>
                    {pkg.credits_remaining}/{pkg.credits_purchased}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    marginBottom: '16px',
                  }}>
                    Credits remaining
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    color: '#6b6457',
                  }}>
                    Expires: {new Date(pkg.expires_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Pending Requests
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    border: '1px solid #2a261e',
                    padding: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: '#C9A84C',
                      marginBottom: '8px',
                    }}>
                      {request.request_type === 'trade_finder' ? 'Trade Finder' : 'Trade Evaluation'} • {request.status === 'assigned' ? `Assigned to ${request.assigned_expert}` : 'Awaiting assignment'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      Submitted: {new Date(request.submitted_at).toLocaleString()}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#6b6457',
                    }}>
                      {request.screenshot_urls.length} screenshot{request.screenshot_urls.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#6b6457',
                    padding: '8px 16px',
                    border: '1px solid #2a261e',
                  }}>
                    In Progress
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Requests */}
        {completedRequests.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Completed Reviews
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {completedRequests.map((request) => {
                const advice = Array.isArray(request.trade_advice) && request.trade_advice.length > 0
                  ? request.trade_advice[0]
                  : null;

                return (
                  <Link
                    key={request.id}
                    href={`/dashboard/advice/${request.id}`}
                    style={{
                      border: '1px solid #2a261e',
                      padding: '32px',
                      display: 'block',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: '#C9A84C',
                      marginBottom: '8px',
                    }}>
                      Reviewed by {advice?.expert || 'Expert'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      Completed: {new Date(request.completed_at || '').toLocaleString()}
                    </div>
                    {advice && (
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        Recommendation: {advice.recommendation}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!tradeRequests || tradeRequests.length === 0) && (
          <div style={{
            border: '1px solid #2a261e',
            padding: '60px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              No trade requests yet
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              marginBottom: '32px',
            }}>
              Submit your first trade request to get expert analysis
            </p>
            <Link
              href="/dashboard/submit"
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
              Submit Trade Request
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
