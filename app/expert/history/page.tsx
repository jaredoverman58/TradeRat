import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ExpertHistoryPage() {
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

  // Fetch completed submissions with responses and ratings
  const { data: completedSubmissions } = await supabase
    .from('submissions')
    .select(`
      *,
      league_profile:league_profiles(
        league_name,
        platform,
        scoring_format,
        num_teams,
        league_type
      ),
      responses!inner(
        id,
        written_content,
        audio_url,
        sent_at,
        verdict,
        bonus_content,
        recalled_at
      ),
      ratings(
        id,
        thumbs_up,
        created_at
      )
    `)
    .eq('expert_id', expert.id)
    .eq('status', 'completed')
    .order('delivered_at', { ascending: false })

  const formatServiceType = (serviceType: string) => {
    switch (serviceType) {
      case 'accept_decline': return 'Accept/Decline'
      case 'counter_offer': return 'Counter Offer'
      case 'bundle': return 'Bundle'
      case 'trade_finder': return 'Trade Finder'
      default: return serviceType
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <Link
            href="/expert"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to Queue
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Completion History
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '1rem',
          }}>
            {expert.name} • {completedSubmissions?.length || 0} completed submission{completedSubmissions?.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Completed Submissions List */}
        {completedSubmissions && completedSubmissions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {completedSubmissions.map((submission: any) => {
              // Filter out recalled responses - only show active responses
              const response = submission.responses?.find((r: any) => r.recalled_at === null)
              if (!response) return null // Skip if all responses are recalled

              const rating = submission.ratings?.[0]

              return (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #2a261e',
                    padding: '32px',
                    backgroundColor: '#0a0805',
                  }}
                >
                  {/* Header Row */}
                  <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                          fontSize: '1.125rem',
                          color: '#F2EDE4',
                          marginBottom: '4px',
                          fontWeight: 600,
                        }}>
                          {submission.league_profile.league_name}
                        </div>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                      }}>
                        {submission.league_profile?.platform || 'N/A'} • {submission.league_profile?.scoring_format || 'N/A'}
                      </div>
                    </div>

                    {/* Date Sent */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '4px',
                      }}>
                        Sent
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {response ? formatDate(response.sent_at) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Response Content */}
                  {response && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '24px',
                      backgroundColor: '#1a1710',
                      border: '1px solid #2a261e',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#C9A84C',
                        marginBottom: '16px',
                      }}>
                        Your Response
                      </div>

                      {/* Bundle-specific fields */}
                      {submission.service_type === 'bundle' && response.verdict && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.875rem',
                            color: '#6b6457',
                            marginBottom: '4px',
                          }}>
                            Recommendation:
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '1rem',
                            color: '#F2EDE4',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}>
                            {response.verdict}
                          </div>
                        </div>
                      )}

                      {/* Written Content */}
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '0.9375rem',
                          color: '#F2EDE4',
                          lineHeight: '1.8',
                        }}
                        dangerouslySetInnerHTML={{ __html: response.written_content || '<em style="color: #6b6457;">No written response</em>' }}
                      />

                      {/* Audio indicator */}
                      {response.audio_url && (
                        <div style={{
                          marginTop: '16px',
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '0.875rem',
                          color: '#C9A84C',
                        }}>
                          🎙️ Includes audio commentary
                        </div>
                      )}

                      {/* Bonus Content for Bundle */}
                      {submission.service_type === 'bundle' && response.bonus_content && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a261e' }}>
                          <div style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.875rem',
                            color: '#6b6457',
                            marginBottom: '8px',
                          }}>
                            {response.verdict === 'decline' ? 'Counter Offer:' : 'Bonus Tips:'}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.9375rem',
                            color: '#F2EDE4',
                            lineHeight: '1.6',
                          }}>
                            {response.bonus_content}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                    }}>
                      Customer Rating:
                    </div>
                    {rating ? (
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '1.25rem',
                      }}>
                        {rating.thumbs_up ? '👍' : '👎'}
                      </div>
                    ) : (
                      <div style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#6b6457',
                        fontStyle: 'italic',
                      }}>
                        Not yet rated
                      </div>
                    )}
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
              No completed submissions yet
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#6b6457',
            }}>
              Completed evaluations will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
