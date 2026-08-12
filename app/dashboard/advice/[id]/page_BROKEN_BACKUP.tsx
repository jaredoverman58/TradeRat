import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AdvicePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch trade request with advice
  const { data: request } = await supabase
    .from('trade_requests')
    .select(`
      *,
      trade_advice (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!request) {
    notFound()
  }

  const advice = Array.isArray(request.trade_advice) && request.trade_advice.length > 0
    ? request.trade_advice[0]
    : null

  const isTradeEvaluation = request.request_type === 'trade_evaluation'
  const isTradeFinder = request.request_type === 'trade_finder'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '16px',
          }}>
            {isTradeFinder ? 'Trade Suggestions' : 'Trade Analysis'}
          </h1>
          {advice && (
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#C9A84C',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Reviewed by {advice.expert}
            </div>
          )}
        </div>

        {!advice ? (
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
              Analysis in progress
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
            }}>
              Your trade request is being reviewed. You&apos;ll be notified when the analysis is complete.
            </p>
          </div>
        ) : (
          <>
            {/* Recommendation - Different display for Trade Evaluation vs Trade Finder */}
            {isTradeEvaluation ? (
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
                  marginBottom: '16px',
                }}>
                  Recommendation
                </div>
                <div style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                }}>
                  {advice.recommendation}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                }}>
                  {advice.proposed_trade}
                </div>
              </div>
            ) : (
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
                  marginBottom: '16px',
                }}>
                  Suggested Trade
                </div>
                <div style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#C9A84C',
                  marginBottom: '24px',
                  lineHeight: 1.3,
                }}>
                  {advice.proposed_trade}
                </div>
              </div>
            )}

            {/* Analysis */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
              marginBottom: '40px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '24px',
              }}>
                Analysis
              </h2>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#F2EDE4',
                whiteSpace: 'pre-wrap',
              }}>
                {advice.analysis}
              </div>
            </div>

            {/* Counter Offer */}
            {advice.counter_offer && (
              <div style={{
                border: '1px solid #2a261e',
                padding: '40px',
                marginBottom: '40px',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#F2EDE4',
                  marginBottom: '24px',
                }}>
                  Counter Offer
                </h2>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#F2EDE4',
                  whiteSpace: 'pre-wrap',
                }}>
                  {advice.counter_offer}
                </div>
              </div>
            )}

            {/* Roster Impact */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
              marginBottom: '40px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '24px',
              }}>
                Roster Impact
              </h2>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#F2EDE4',
                whiteSpace: 'pre-wrap',
              }}>
                {advice.roster_impact}
              </div>
            </div>

            {/* Audio Commentary */}
            {advice.audio_url && (
              <div style={{
                border: '1px solid #2a261e',
                padding: '40px',
                marginBottom: '40px',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#F2EDE4',
                  marginBottom: '24px',
                }}>
                  Audio Commentary
                </h2>
                <audio
                  controls
                  src={advice.audio_url}
                  style={{
                    width: '100%',
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Request Details */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '24px',
              }}>
                Your Request Details
              </h2>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                Request Type: {isTradeFinder ? 'Trade Finder' : 'Trade Evaluation'}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                Submitted: {new Date(request.submitted_at).toLocaleString()}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                League: {request.league_rules.platform} - {request.league_rules.scoring_type}
              </div>
              {isTradeEvaluation && request.specific_trade_offer && (
                <div style={{
                  marginTop: '24px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#C9A84C',
                    marginBottom: '12px',
                  }}>
                    Trade Offer Submitted
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {request.specific_trade_offer}
                  </div>
                </div>
              )}
              {request.user_notes && (
                <div style={{
                  marginTop: '24px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#C9A84C',
                    marginBottom: '12px',
                  }}>
                    Your Notes
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {request.user_notes}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
