import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ExpertQueuePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is linked to an expert
  const { data: expert } = await supabase
    .from('experts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!expert) {
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
            Not an Expert
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            marginBottom: '32px',
          }}>
            Your account is not linked to an expert profile.
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

  // Fetch expert stats
  // 1. Total completions (sent responses, not recalled)
  const { count: totalCompletions } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('expert_id', expert.id)
    .is('recalled_at', null)

  // 2. Average response time (sent_at - submission.created_at in hours)
  const { data: responseTimes } = await supabase
    .from('responses')
    .select(`
      sent_at,
      submissions!inner(created_at)
    `)
    .eq('expert_id', expert.id)
    .is('recalled_at', null)

  let avgResponseTimeHours = 0
  if (responseTimes && responseTimes.length > 0) {
    const times = responseTimes.map((r: any) => {
      const sent = new Date(r.sent_at).getTime()
      const created = new Date(r.submissions.created_at).getTime()
      return (sent - created) / (1000 * 60 * 60) // convert ms to hours
    })
    avgResponseTimeHours = times.reduce((sum, t) => sum + t, 0) / times.length
  }

  // 3. Thumbs up percentage
  // First get submission IDs for this expert's responses
  const { data: expertResponses } = await supabase
    .from('responses')
    .select('submission_id')
    .eq('expert_id', expert.id)
    .is('recalled_at', null)

  const submissionIds = expertResponses?.map(r => r.submission_id) || []

  let thumbsUpPercentage = 0
  if (submissionIds.length > 0) {
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('thumbs_up')
      .in('submission_id', submissionIds)

    if (ratingsData && ratingsData.length > 0) {
      const thumbsUpCount = ratingsData.filter(r => r.thumbs_up).length
      thumbsUpPercentage = (thumbsUpCount / ratingsData.length) * 100
    }
  }

  // Fetch open queue submissions (status = 'submitted' AND expert_id IS NULL)
  const { data: openSubmissions } = await supabase
    .from('submissions')
    .select(`
      *,
      league_profile:league_profiles(
        league_name,
        platform,
        scoring_format,
        num_teams,
        league_type
      )
    `)
    .eq('status', 'submitted')
    .is('expert_id', null)
    .order('created_at', { ascending: true })

  // Fetch expert's claimed/in-progress submissions
  const { data: mySubmissions } = await supabase
    .from('submissions')
    .select(`
      *,
      league_profile:league_profiles(
        league_name,
        platform,
        scoring_format,
        num_teams,
        league_type
      )
    `)
    .eq('expert_id', expert.id)
    .in('status', ['claimed', 'in_progress'])
    .order('claimed_at', { ascending: true })

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'just now'
  }

  const getUrgencyStyle = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours >= 12) {
      // Red for 12+ hours
      return {
        backgroundColor: '#3d1a1a',
        borderColor: '#8b2d2d',
      }
    } else if (diffHours >= 6) {
      // Yellow for 6-12 hours
      return {
        backgroundColor: '#3d3520',
        borderColor: '#8b7b3d',
      }
    } else {
      // Green for under 6 hours
      return {
        backgroundColor: '#1a3d2e',
        borderColor: '#2d8b5f',
      }
    }
  }

  const formatServiceType = (serviceType: string) => {
    switch (serviceType) {
      case 'accept_decline': return 'Accept/Decline'
      case 'counter_offer': return 'Counter Offer'
      case 'bundle': return 'Bundle'
      case 'trade_finder': return 'Trade Finder'
      default: return serviceType
    }
  }

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
              Expert Queue
            </h1>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              fontSize: '1rem',
            }}>
              Logged in as: {expert.name} • {user.email}
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

        {/* Expert Stats */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Your Performance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {/* Total Completions */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px 24px',
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                {totalCompletions || 0}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
              }}>
                Total Completions
              </div>
            </div>

            {/* Average Response Time */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px 24px',
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                {avgResponseTimeHours > 0 ? avgResponseTimeHours.toFixed(1) : '—'}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
              }}>
                Avg Response Time (hrs)
              </div>
            </div>

            {/* Rating Percentage */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px 24px',
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                {thumbsUpPercentage > 0 ? `${thumbsUpPercentage.toFixed(0)}%` : '—'}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
              }}>
                Thumbs Up Rating
              </div>
            </div>
          </div>
        </div>

        {/* My Active Submissions */}
        {mySubmissions && mySubmissions.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              My Active Submissions ({mySubmissions.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mySubmissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/expert/submissions/${submission.id}`}
                  style={{
                    border: '2px solid #C9A84C',
                    padding: '24px',
                    display: 'block',
                    textDecoration: 'none',
                    backgroundColor: '#1a1710',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '24px', alignItems: 'center' }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#C9A84C',
                        marginBottom: '8px',
                      }}>
                        {formatServiceType(submission.service_type)} • {submission.rate_tier === 'rat_rate' ? 'Rat Rate' : 'Standard'}
                      </div>
                      {submission.league_profile && (
                        <div style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '1rem',
                          color: '#F2EDE4',
                          marginBottom: '4px',
                        }}>
                          {submission.league_profile.league_name}
                        </div>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        {submission.offer_direction === 'received' ? 'Received offer' : 'Proposing offer'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        Status
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {submission.status === 'claimed' ? 'Claimed' : 'In Progress'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        Claimed
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {formatTimeAgo(submission.claimed_at || submission.created_at)}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        League
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {submission.league_profile?.platform || 'N/A'}
                      </div>
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '12px 24px',
                      backgroundColor: '#C9A84C',
                      color: '#0C0A07',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.875rem',
                    }}>
                      View →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Open Queue */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Open Queue ({openSubmissions?.length || 0})
          </h2>

          {openSubmissions && openSubmissions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {openSubmissions.map((submission) => {
                const urgencyStyle = getUrgencyStyle(submission.created_at)
                return (
                <div
                  key={submission.id}
                  style={{
                    border: `2px solid ${urgencyStyle.borderColor}`,
                    padding: '24px',
                    backgroundColor: urgencyStyle.backgroundColor,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '24px', alignItems: 'center' }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#C9A84C',
                        marginBottom: '8px',
                      }}>
                        {formatServiceType(submission.service_type)} • {submission.rate_tier === 'rat_rate' ? 'Rat Rate' : 'Standard'}
                      </div>
                      {submission.league_profile && (
                        <div style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '1rem',
                          color: '#F2EDE4',
                          marginBottom: '4px',
                        }}>
                          {submission.league_profile.league_name}
                        </div>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        {submission.offer_direction === 'received' ? 'Received offer' : 'Proposing offer'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        Waiting
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {formatTimeAgo(submission.created_at)}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        League
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {submission.league_profile?.platform || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        Format
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {submission.league_profile?.scoring_format || 'N/A'}
                      </div>
                    </div>

                    <form action={`/api/expert/claim`} method="post">
                      <input type="hidden" name="submission_id" value={submission.id} />
                      <input type="hidden" name="expert_id" value={expert.id} />
                      <button
                        type="submit"
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          padding: '12px 24px',
                          backgroundColor: '#C9A84C',
                          color: '#0C0A07',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontSize: '0.875rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Claim
                      </button>
                    </form>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
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
                Queue is empty
              </div>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#6b6457',
              }}>
                No open submissions at the moment. Check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
