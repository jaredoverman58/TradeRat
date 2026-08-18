import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BuyThreePackButton from './BuyThreePackButton'
import PurchaseMessage from './PurchaseMessage'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is an expert - experts skip onboarding and go to /expert
  const { data: expert } = await supabase
    .from('experts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (expert) {
    redirect('/expert')
  }

  // Check if user has completed onboarding
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (userRole && !userRole.onboarding_completed) {
    redirect('/onboarding')
  }

  // Fetch user's free evaluation status
  const { data: freeEval } = await supabase
    .from('free_evaluations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch user's bundles
  const { data: bundles } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  // Group bundles by service type and rate tier
  const activeBundles = bundles?.filter(b => new Date(b.expires_at) > new Date() && b.credits_remaining > 0) || []

  // Helper to get service display name
  const getServiceName = (serviceType: string) => {
    const names: Record<string, string> = {
      'accept_decline': 'Accept/Decline',
      'counter_offer': 'Counter Offer',
      'bundle': 'Accept/Decline + Bonus',
      'trade_finder': 'Trade Finder',
    }
    return names[serviceType] || serviceType
  }

  // Helper to get rate tier display name
  const getRateTierName = (bundleType: string) => {
    if (bundleType.includes('rat_rate')) return 'Rat Rate'
    if (bundleType.includes('standard')) return 'Standard'
    return bundleType
  }

  // Group by service type, then by rate tier
  type ServiceGroup = {
    serviceType: string
    serviceName: string
    tiers: {
      tierName: string
      credits: number
      bundles: typeof activeBundles
    }[]
  }

  const groupedServices: ServiceGroup[] = []
  const serviceTypes = ['accept_decline', 'counter_offer', 'bundle', 'trade_finder']

  serviceTypes.forEach(serviceType => {
    const serviceBundles = activeBundles.filter(b => b.service_type === serviceType)
    if (serviceBundles.length === 0) return

    const standardBundles = serviceBundles.filter(b => b.bundle_type.includes('standard'))
    const ratBundles = serviceBundles.filter(b => b.bundle_type.includes('rat_rate'))

    const tiers = []
    if (standardBundles.length > 0) {
      tiers.push({
        tierName: 'Standard',
        credits: standardBundles.reduce((sum, b) => sum + b.credits_remaining, 0),
        bundles: standardBundles
      })
    }
    if (ratBundles.length > 0) {
      tiers.push({
        tierName: 'Rat Rate',
        credits: ratBundles.reduce((sum, b) => sum + b.credits_remaining, 0),
        bundles: ratBundles
      })
    }

    if (tiers.length > 0) {
      groupedServices.push({
        serviceType,
        serviceName: getServiceName(serviceType),
        tiers
      })
    }
  })

  const hasFreeCredit = freeEval && !freeEval.used && (!freeEval.expires_at || new Date(freeEval.expires_at) > new Date())

  // Fetch user's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      expert:experts(name),
      league_profile:league_profiles(league_name),
      response:responses!submission_id(
        id,
        written_content,
        sent_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const pendingSubmissions = submissions?.filter(s =>
    s.status === 'submitted' || s.status === 'claimed' || s.status === 'in_progress'
  ) || []
  const completedSubmissions = submissions?.filter(s => s.status === 'completed') || []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 60px' }}>
        <PurchaseMessage />
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
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              href="/admin"
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
              Admin
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
            marginBottom: '20px',
          }}>
            Your Credits
          </div>

          {/* Free Evaluation Credit */}
          {hasFreeCredit && (
            <div style={{
              marginBottom: '32px',
              paddingBottom: '32px',
              borderBottom: '1px solid #2a261e',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                Free Evaluation
              </div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 900,
                color: '#C9A84C',
              }}>
                1
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
              }}>
                One-time credit • Accept/Decline evaluation
              </div>
            </div>
          )}

          {/* Paid Bundle Credits by Service Type */}
          {groupedServices.length > 0 && (
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                Paid Credits
              </div>
              {groupedServices.map((service, idx) => (
                <div key={service.serviceType} style={{ marginBottom: idx < groupedServices.length - 1 ? '24px' : '0' }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    marginBottom: '12px',
                  }}>
                    {service.serviceName}
                  </div>
                  {service.tiers.map(tier => (
                    <div key={tier.tierName} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      paddingLeft: '16px',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        {tier.tierName}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#C9A84C',
                      }}>
                        {tier.credits}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!hasFreeCredit && groupedServices.length === 0 && (
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textAlign: 'center',
              padding: '20px 0',
            }}>
              No credits available. Purchase a bundle to get started.
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/submit"
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
            <BuyThreePackButton />
            <Link
              href="/pricing"
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
              View All Pricing
            </Link>
          </div>
        </div>

        {/* Bundle Details */}
        {activeBundles.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Active Bundles
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              backgroundColor: '#2a261e',
            }}>
              {activeBundles.map((bundle) => (
                <div
                  key={bundle.id}
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
                    marginBottom: '4px',
                  }}>
                    {getServiceName(bundle.service_type)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    {getRateTierName(bundle.bundle_type)} • {bundle.bundle_type.replace(/_/g, ' ')}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#F2EDE4',
                    marginBottom: '8px',
                  }}>
                    {bundle.credits_remaining}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    marginBottom: '16px',
                  }}>
                    {bundle.credits_remaining === 1 ? 'Credit' : 'Credits'} remaining
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    color: '#6b6457',
                  }}>
                    Expires: {new Date(bundle.expires_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Pending Submissions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.id}
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
                      {submission.service_type === 'trade_finder' ? 'Trade Finder' : 'Trade Evaluation'} • {
                        submission.status === 'submitted' ? 'In Queue' :
                        submission.status === 'claimed' ? `Claimed by ${submission.expert?.name || 'Expert'}` :
                        submission.status === 'in_progress' ? `${submission.expert?.name || 'Expert'} working on it` :
                        submission.status
                      }
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      Submitted: {new Date(submission.created_at).toLocaleString()}
                    </div>
                    {submission.league_profile?.league_name && (
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        League: {submission.league_profile.league_name}
                      </div>
                    )}
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

        {/* Completed Submissions */}
        {completedSubmissions.length > 0 && (
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
              {completedSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #2a261e',
                    padding: '32px',
                    display: 'block',
                    textDecoration: 'none',
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
                    Reviewed by {submission.expert?.name || 'Expert'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    color: '#F2EDE4',
                    marginBottom: '4px',
                  }}>
                    Completed: {new Date(submission.delivered_at || submission.updated_at).toLocaleString()}
                  </div>
                  {submission.league_profile?.league_name && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#6b6457',
                      marginBottom: '16px',
                    }}>
                      League: {submission.league_profile.league_name}
                    </div>
                  )}

                  {/* Expert Response */}
                  {submission.response && Array.isArray(submission.response) && submission.response.length > 0 ? (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #2a261e',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: '#6b6457',
                        marginBottom: '8px',
                      }}>
                        Expert Response
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        backgroundColor: '#1a1710',
                        padding: '16px',
                        border: '1px solid #2a261e',
                        maxHeight: '200px',
                        overflow: 'auto',
                      }}>
                        {submission.response[0].written_content}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#6b6457',
                      marginTop: '16px',
                      fontStyle: 'italic',
                    }}>
                      Response not yet available
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!submissions || submissions.length === 0) && (
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
              No submissions yet
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              marginBottom: '32px',
            }}>
              Submit your first trade evaluation to get expert analysis
            </p>
            <Link
              href="/submit"
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
              Submit Trade Evaluation
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
