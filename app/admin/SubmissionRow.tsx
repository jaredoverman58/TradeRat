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
  expert: { id: string; name: string } | null
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

type Expert = {
  id: string
  name: string
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
  experts,
  onReassign,
}: {
  submission: Submission
  userEmail: string
  isExpanded: boolean
  onToggle: () => void
  formatServiceType: (type: string) => string
  formatStatus: (status: string) => string
  formatDate: (date: string) => string
  shortenId: (id: string) => string
  experts: Expert[]
  onReassign: () => void
}) {
  const [files, setFiles] = useState<SubmissionFile[]>([])
  const [response, setResponse] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailsLoaded, setDetailsLoaded] = useState(false)
  const [showReassignDropdown, setShowReassignDropdown] = useState(false)
  const [reassigning, setReassigning] = useState(false)
  const [reassignMessage, setReassignMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [reassignmentLogs, setReassignmentLogs] = useState<Array<{
    created_at: string
    details: {
      old_expert_name: string
      new_expert_name: string
    }
  }>>([])

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

    // Load reassignment logs from audit_log
    const { data: auditData } = await supabase
      .from('audit_log')
      .select('created_at, details')
      .eq('submission_id', submission.id)
      .eq('action', 'expert_reassigned')
      .order('created_at', { ascending: false })

    if (auditData) {
      setReassignmentLogs(auditData)
    }

    setLoading(false)
    setDetailsLoaded(true)
  }, [submission.id, submission.status])

  useEffect(() => {
    if (isExpanded && !detailsLoaded) {
      loadDetails()
    }
  }, [isExpanded, detailsLoaded, loadDetails])

  const handleReassign = async (newExpertId: string) => {
    setReassigning(true)
    setReassignMessage(null)
    try {
      const response = await fetch('/api/admin/reassign-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          newExpertId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setReassignMessage({
          type: 'error',
          text: `Failed to reassign: ${errorData.error || 'Unknown error'}`
        })
        return
      }

      const result = await response.json()
      setReassignMessage({
        type: 'success',
        text: `Successfully reassigned from ${result.oldExpert} to ${result.newExpert}`
      })
      setShowReassignDropdown(false)

      // Reload details to fetch updated reassignment logs
      await loadDetails()

      // Refresh the parent list
      onReassign()
    } catch (error) {
      console.error('Error reassigning expert:', error)
      setReassignMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
    } finally {
      setReassigning(false)
    }
  }

  // Get available experts (exclude currently assigned expert)
  const availableExperts = experts.filter(
    expert => expert.id !== submission.expert_id
  )

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
              {/* Reassign Expert Section - Only show if expert is assigned */}
              {submission.expert_id && (
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6b6457',
                    marginBottom: '12px',
                  }}>
                    Expert Management
                  </h3>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowReassignDropdown(!showReassignDropdown)
                      }}
                      disabled={reassigning}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        padding: '12px 20px',
                        backgroundColor: reassigning ? '#2a261e' : 'transparent',
                        color: reassigning ? '#6b6457' : '#C9A84C',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.875rem',
                        border: '1px solid #C9A84C',
                        cursor: reassigning ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {reassigning ? 'Reassigning...' : 'Reassign Expert'}
                    </button>

                    {showReassignDropdown && !reassigning && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '8px',
                          backgroundColor: '#1a1710',
                          border: '1px solid #C9A84C',
                          minWidth: '250px',
                          zIndex: 10,
                        }}
                      >
                        <div style={{
                          padding: '12px',
                          borderBottom: '1px solid #2a261e',
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: '#6b6457',
                        }}>
                          Select New Expert
                        </div>
                        {availableExperts.length > 0 ? (
                          availableExperts.map(expert => (
                            <button
                              key={expert.id}
                              onClick={() => handleReassign(expert.id)}
                              style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: 'transparent',
                                color: '#F2EDE4',
                                fontFamily: 'var(--font-dm-sans)',
                                fontSize: '0.875rem',
                                textAlign: 'left',
                                border: 'none',
                                borderBottom: '1px solid #2a261e',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2a261e'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {expert.name}
                            </button>
                          ))
                        ) : (
                          <div style={{
                            padding: '16px',
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.875rem',
                            color: '#6b6457',
                          }}>
                            No other experts available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    color: '#6b6457',
                    marginTop: '8px',
                  }}>
                    Currently assigned to: <span style={{ color: '#C9A84C' }}>{submission.expert?.name}</span>
                  </p>

                  {/* Inline success/error message */}
                  {reassignMessage && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      backgroundColor: reassignMessage.type === 'success' ? '#1a2e1a' : '#2a0a0a',
                      border: `1px solid ${reassignMessage.type === 'success' ? '#4a7c59' : '#ff4444'}`,
                      color: reassignMessage.type === 'success' ? '#88cc88' : '#ff6666',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                    }}>
                      {reassignMessage.text}
                    </div>
                  )}

                  {/* Reassignment history */}
                  {reassignmentLogs.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#6b6457',
                        marginBottom: '8px',
                      }}>
                        Reassignment History
                      </h4>
                      {reassignmentLogs.map((log, index) => (
                        <div
                          key={index}
                          style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.75rem',
                            color: '#6b6457',
                            marginBottom: '4px',
                          }}
                        >
                          Reassigned from <span style={{ color: '#F2EDE4' }}>{log.details.old_expert_name}</span> to <span style={{ color: '#C9A84C' }}>{log.details.new_expert_name}</span> on {formatDate(log.created_at)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
