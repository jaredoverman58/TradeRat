'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import SignedImage from '@/components/SignedImage'

type Submission = {
  id: string
  user_id: string
  service_type: string
  rate_tier: string
  status: string
  expert_id: string | null
  created_at: string
  claimed_at: string | null
  expert: { name: string } | null
  league_profile: {
    league_name: string
    platform: string
  } | null
  offer_direction: string | null
  receive_players: string | null
  give_players: string | null
  receive_picks: string | null
  give_picks: string | null
  fab_receive: number | null
  fab_give: number | null
  additional_context: string | null
}

type SubmissionFile = {
  id: string
  file_url: string
  file_type: string
  label: string | null
}

type Response = {
  id: string
  written_content: string
  sent_at: string
}

export default function SubmissionRow({
  submission,
  userEmail,
  isExpanded,
  onToggle,
  formatServiceType,
  formatStatus,
  formatDate,
  shortenId,
}: {
  submission: Submission
  userEmail: string
  isExpanded: boolean
  onToggle: () => void
  formatServiceType: (type: string) => string
  formatStatus: (status: string) => string
  formatDate: (date: string) => string
  shortenId: (id: string) => string
}) {
  const [files, setFiles] = useState<SubmissionFile[]>([])
  const [response, setResponse] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailsLoaded, setDetailsLoaded] = useState(false)

  const loadDetails = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Load submission files
    const { data: filesData } = await supabase
      .from('submission_files')
      .select('*')
      .eq('submission_id', submission.id)

    if (filesData) {
      setFiles(filesData)
    }

    // Load response if completed
    if (submission.status === 'completed') {
      const { data: responseData } = await supabase
        .from('responses')
        .select('id, written_content, sent_at')
        .eq('submission_id', submission.id)
        .single()

      if (responseData) {
        setResponse(responseData)
      }
    }

    setLoading(false)
    setDetailsLoaded(true)
  }, [submission.id, submission.status])

  useEffect(() => {
    if (isExpanded && !detailsLoaded) {
      loadDetails()
    }
  }, [isExpanded, detailsLoaded, loadDetails])

  return (
    <div>
      {/* Row */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 200px 150px 120px 120px 150px 160px 160px',
          gap: '16px',
          padding: '16px 24px',
          border: '1px solid #2a261e',
          backgroundColor: isExpanded ? '#1a1710' : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#F2EDE4',
        }}>
          {shortenId(submission.id)}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {userEmail}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#F2EDE4',
        }}>
          {formatServiceType(submission.service_type)}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#F2EDE4',
        }}>
          {submission.rate_tier === 'rat_rate' ? 'Rat Rate' : 'Standard'}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#C9A84C',
        }}>
          {formatStatus(submission.status)}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#F2EDE4',
        }}>
          {submission.expert?.name || 'Unclaimed'}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
        }}>
          {formatDate(submission.created_at)}
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
        }}>
          {submission.claimed_at ? formatDate(submission.claimed_at) : '—'}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          border: '1px solid #C9A84C',
          borderTop: 'none',
          padding: '32px',
          backgroundColor: '#1a1710',
        }}>
          {loading ? (
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textAlign: 'center',
              padding: '24px',
            }}>
              Loading details...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* League Info */}
              {submission.league_profile && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    League Information
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                    marginBottom: '4px',
                  }}>
                    {submission.league_profile.league_name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                  }}>
                    Platform: {submission.league_profile.platform}
                  </div>
                </div>
              )}

              {/* Trade Details */}
              {submission.offer_direction && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    Trade Details
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    marginBottom: '8px',
                  }}>
                    Direction: {submission.offer_direction === 'received' ? 'Received offer' : 'Proposing offer'}
                  </div>
                  {submission.receive_players && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#6b6457' }}>Receive Players:</span> {submission.receive_players}
                    </div>
                  )}
                  {submission.give_players && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#6b6457' }}>Give Players:</span> {submission.give_players}
                    </div>
                  )}
                  {submission.receive_picks && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#6b6457' }}>Receive Picks:</span> {submission.receive_picks}
                    </div>
                  )}
                  {submission.give_picks && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#6b6457' }}>Give Picks:</span> {submission.give_picks}
                    </div>
                  )}
                  {(submission.fab_receive !== null || submission.fab_give !== null) && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#6b6457' }}>FAB:</span>{' '}
                      {submission.fab_receive ? `Receive $${submission.fab_receive}` : ''}{' '}
                      {submission.fab_give ? `Give $${submission.fab_give}` : ''}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Context */}
              {submission.additional_context && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    Additional Context
                  </h3>
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

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    Uploaded Files ({files.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {files.map(file => (
                      <div key={file.id} style={{
                        border: '1px solid #2a261e',
                        padding: '8px',
                      }}>
                        {file.file_type.startsWith('image/') ? (
                          <SignedImage
                            filePath={file.file_url}
                            alt={file.label || 'Uploaded file'}
                            label={file.label}
                            style={{
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        ) : (
                          <div>
                            <div style={{
                              padding: '32px',
                              textAlign: 'center',
                              backgroundColor: '#2a261e',
                              marginBottom: '8px',
                              fontFamily: 'var(--font-dm-sans)',
                              fontSize: '0.75rem',
                              color: '#6b6457',
                            }}>
                              {file.file_type}
                            </div>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontFamily: 'var(--font-dm-sans)',
                                fontSize: '0.75rem',
                                color: '#C9A84C',
                                textDecoration: 'none',
                                display: 'block',
                              }}
                            >
                              {file.label || 'View file'} →
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expert Response */}
              {response && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    Expert Response
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#0C0A07',
                    padding: '16px',
                    border: '1px solid #2a261e',
                  }}>
                    {response.written_content}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    color: '#6b6457',
                    marginTop: '8px',
                  }}>
                    Sent at: {formatDate(response.sent_at)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
