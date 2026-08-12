import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RatingPrompt from './RatingPrompt'
import SafeHtmlRenderer from './SafeHtmlRenderer'

export default async function AdvicePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch submission with response and expert info
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      responses (
        *,
        experts (
          name
        )
      ),
      league_profiles (
        league_name,
        platform,
        scoring_format
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!submission) {
    notFound()
  }

  // Get the active (non-recalled) response
  const response = Array.isArray(submission.responses) && submission.responses.length > 0
    ? submission.responses.find((r: any) => !r.recalled_at) || submission.responses[0]
    : null

  const expertName = response?.experts?.name || 'Expert'

  const isTradeEvaluation = submission.service_type === 'accept_decline' ||
                            submission.service_type === 'counter_offer' ||
                            submission.service_type === 'bundle'
  const isTradeFinder = submission.service_type === 'trade_finder'

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
          {response && (
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#C9A84C',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Reviewed by {expertName}
            </div>
          )}
        </div>

        {!response ? (
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
            {/* Expert Response */}
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
                Expert Analysis
              </div>
              <SafeHtmlRenderer
                html={response.written_content}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#F2EDE4',
                }}
              />
            </div>

            {/* Audio Commentary */}
            {response.audio_url && (
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
                  src={response.audio_url}
                  style={{
                    width: '100%',
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Rating Prompt - Only show if completed */}
            {submission.status === 'completed' && (
              <RatingPrompt
                submissionId={submission.id}
                deliveredAt={submission.delivered_at}
              />
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
                Service Type: {isTradeFinder ? 'Trade Finder' : 'Trade Evaluation'}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                Submitted: {new Date(submission.created_at).toLocaleString()}
              </div>
              {submission.league_profiles && (
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                  marginBottom: '16px',
                }}>
                  League: {submission.league_profiles.league_name} ({submission.league_profiles.platform} - {submission.league_profiles.scoring_format})
                </div>
              )}
              {submission.offer_direction && (
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                  marginBottom: '16px',
                }}>
                  Offer Direction: {submission.offer_direction === 'received' ? 'Received offer' : 'Proposing offer'}
                </div>
              )}
              {submission.additional_context && (
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
                    {submission.additional_context}
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
