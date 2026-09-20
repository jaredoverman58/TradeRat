'use client'

import Link from 'next/link'
import SignedAudio from '@/components/SignedAudio'
import SafeHtmlRenderer from '@/components/SafeHtmlRenderer'

type CompletedSubmission = {
  id: string
  created_at: string
  delivered_at?: string
  updated_at: string
  service_type: string
  expert?: {
    name: string
  } | null
  league_profile?: {
    league_name: string
  } | null
  response?: Array<{
    id: string
    written_content: string
    audio_url?: string
    sent_at: string
  }> | null
}

type CompletedReviewsListProps = {
  completedSubmissions: CompletedSubmission[]
}

export default function CompletedReviewsList({ completedSubmissions }: CompletedReviewsListProps) {
  if (completedSubmissions.length === 0) {
    return null
  }

  return (
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
          <Link
            key={submission.id}
            href={`/dashboard/advice/${submission.id}`}
            style={{
              border: '1px solid #2a261e',
              padding: '32px',
              display: 'block',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C9A84C'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a261e'}
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
              <>
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
                    <SafeHtmlRenderer
                      html={submission.response[0].written_content}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                        lineHeight: '1.6',
                      }}
                    />
                  </div>
                </div>

                {/* Audio Response */}
                {submission.response[0].audio_url && (
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
                      Audio Commentary
                    </div>
                    <SignedAudio
                      filePath={submission.response[0].audio_url}
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                )}
              </>
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

            {/* View Full Analysis Banner */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 0',
                backgroundColor: '#1a1710',
                color: '#C9A84C',
                borderTop: '1px solid #2a261e',
                textAlign: 'center',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C9A84C'
                e.currentTarget.style.color = '#0C0A07'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1710'
                e.currentTarget.style.color = '#C9A84C'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 600,
              }}>
                View Full Analysis →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
