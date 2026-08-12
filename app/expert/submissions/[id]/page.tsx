import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RespondForm from './RespondForm'
import SignedImage from '@/components/SignedImage'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: submissionId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get expert info
  const { data: expert } = await supabase
    .from('experts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!expert) {
    redirect('/expert')
  }

  // Fetch submission with all details
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      league_profile:league_profiles(*),
      submission_files(*)
    `)
    .eq('id', submissionId)
    .eq('expert_id', expert.id)
    .single()

  if (error || !submission) {
    notFound()
  }

  // Check if response already exists
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('*')
    .eq('submission_id', submissionId)
    .is('recalled_at', null)
    .single()

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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
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
          }}>
            Submission Details
          </h1>
        </div>

        {/* Submission Info Card */}
        <div style={{
          backgroundColor: '#1a1710',
          border: '2px solid #C9A84C',
          padding: '32px',
          marginBottom: '40px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
                marginBottom: '8px',
              }}>
                Service Type
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#F2EDE4',
              }}>
                {formatServiceType(submission.service_type)}
              </div>
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
                marginBottom: '8px',
              }}>
                Rate Tier
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#C9A84C',
              }}>
                {submission.rate_tier === 'rat_rate' ? 'Rat Rate (Premium)' : 'Standard'}
              </div>
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
                marginBottom: '8px',
              }}>
                Offer Direction
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#F2EDE4',
              }}>
                {submission.offer_direction === 'received' ? 'User Received This Offer' : 'User is Proposing This Offer'}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #2a261e',
            paddingTop: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
              marginBottom: '8px',
            }}>
              Submitted
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#F2EDE4',
            }}>
              {new Date(submission.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* League Info */}
        {submission.league_profile && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              League Information
            </h2>
            <div style={{
              border: '1px solid #2a261e',
              padding: '24px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '8px',
                  }}>
                    League Name
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    {submission.league_profile.league_name}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '8px',
                  }}>
                    Platform
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    {submission.league_profile.platform}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '8px',
                  }}>
                    Scoring
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    {submission.league_profile.scoring_format}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '8px',
                  }}>
                    Teams
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    {submission.league_profile.num_teams}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#6b6457',
                  marginBottom: '8px',
                }}>
                  League Type
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  color: '#F2EDE4',
                }}>
                  {submission.league_profile.league_type}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Details */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Trade Details
          </h2>
          <div style={{
            border: '1px solid #2a261e',
            padding: '24px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
              {/* User Receives */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#C9A84C',
                  marginBottom: '16px',
                }}>
                  User Receives
                </h3>
                {submission.receive_players && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      Players
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {submission.receive_players}
                    </div>
                  </div>
                )}
                {submission.receive_picks && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      Picks
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {submission.receive_picks}
                    </div>
                  </div>
                )}
                {submission.fab_receive && (
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      FAAB
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                    }}>
                      ${submission.fab_receive}
                    </div>
                  </div>
                )}
                {!submission.receive_players && !submission.receive_picks && !submission.fab_receive && (
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    fontStyle: 'italic',
                  }}>
                    Nothing
                  </div>
                )}
              </div>

              {/* User Gives */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#C9A84C',
                  marginBottom: '16px',
                }}>
                  User Gives
                </h3>
                {submission.give_players && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      Players
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {submission.give_players}
                    </div>
                  </div>
                )}
                {submission.give_picks && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      Picks
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {submission.give_picks}
                    </div>
                  </div>
                )}
                {submission.fab_give && (
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b6457',
                      marginBottom: '4px',
                    }}>
                      FAAB
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '1rem',
                      color: '#F2EDE4',
                    }}>
                      ${submission.fab_give}
                    </div>
                  </div>
                )}
                {!submission.give_players && !submission.give_picks && !submission.fab_give && (
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    fontStyle: 'italic',
                  }}>
                    Nothing
                  </div>
                )}
              </div>
            </div>

            {/* Additional Context */}
            {submission.additional_context && (
              <div style={{
                borderTop: '1px solid #2a261e',
                paddingTop: '24px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#6b6457',
                  marginBottom: '8px',
                }}>
                  Additional Context
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  color: '#F2EDE4',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}>
                  {submission.additional_context}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {submission.submission_files && submission.submission_files.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Uploaded Screenshots ({submission.submission_files.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {submission.submission_files.map((file: any) => (
                <div
                  key={file.id}
                  style={{
                    border: '1px solid #2a261e',
                    padding: '16px',
                  }}
                >
                  <SignedImage
                    filePath={file.file_url}
                    alt={file.label || 'Screenshot'}
                    label={file.label}
                    isOwnRoster={file.is_own_roster}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Form or Existing Response */}
        {existingResponse ? (
          <div style={{
            backgroundColor: '#1a1710',
            border: '2px solid #C9A84C',
            padding: '32px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Response Sent ✓
            </h2>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#6b6457',
              marginBottom: '16px',
            }}>
              Sent at: {new Date(existingResponse.sent_at).toLocaleString()}
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#F2EDE4',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              padding: '24px',
              backgroundColor: '#0C0A07',
              border: '1px solid #2a261e',
            }}>
              {existingResponse.written_content}
            </div>
          </div>
        ) : (
          <RespondForm submissionId={submissionId} expertId={expert.id} />
        )}
      </div>
    </div>
  )
}
