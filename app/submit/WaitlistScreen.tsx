'use client'

import { useState } from 'react'

type WaitlistScreenProps = {
  tier: 'rat_rate' | 'standard'
  serviceType: string
  standardAvailable: boolean
  onJoinWaitlist: () => Promise<void>
  onSubmitWithStandard?: () => void
  onCancel: () => void
  standardPrice?: string
}

export default function WaitlistScreen({
  tier,
  serviceType,
  standardAvailable,
  onJoinWaitlist,
  onSubmitWithStandard,
  onCancel,
  standardPrice
}: WaitlistScreenProps) {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinWaitlist = async () => {
    setJoining(true)
    setError(null)
    try {
      await onJoinWaitlist()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist')
      setJoining(false)
    }
  }

  // Rat Rate at capacity
  if (tier === 'rat_rate') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0C0A07',
        padding: '40px 24px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            The Rat is Currently at Capacity
          </h1>

          {/* Message */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#F2EDE4',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Would you like to join the Rat Rate waitlist and submit when notified, or submit now with a standard expert at Standard Rate pricing?
          </p>

          {/* Explanation Box */}
          <div style={{
            border: '1px solid #2a261e',
            padding: '24px',
            marginBottom: '32px',
            backgroundColor: '#1a1710'
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: '#6b6457',
              margin: 0
            }}>
              Joining the waitlist is free. You will not be charged until you submit your request after your spot opens. Your spot is held for 2 hours once notified.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '16px',
              marginBottom: '24px',
              backgroundColor: '#3d1a1a',
              border: '1px solid #8b2d2d',
              borderRadius: '4px'
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <button
              onClick={handleJoinWaitlist}
              disabled={joining}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '16px 32px',
                backgroundColor: joining ? '#6b6457' : '#C9A84C',
                color: '#0C0A07',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: 'none',
                cursor: joining ? 'not-allowed' : 'pointer',
                width: '100%',
                minHeight: '44px'
              }}
            >
              {joining ? 'Joining...' : 'Join Rat Rate Waitlist'}
            </button>

            {onSubmitWithStandard && (
              <button
                onClick={onSubmitWithStandard}
                disabled={joining}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: '#C9A84C',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: '2px solid #C9A84C',
                  cursor: joining ? 'not-allowed' : 'pointer',
                  width: '100%',
                  minHeight: '44px'
                }}
              >
                Submit with Standard Expert {standardPrice && `(${standardPrice})`}
              </button>
            )}
          </div>

          <button
            onClick={onCancel}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#6b6457',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              width: '100%',
              textDecoration: 'underline'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Standard at capacity
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0C0A07',
      padding: '40px 24px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 900,
          color: '#F2EDE4',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Standard Experts at Capacity
        </h1>

        {/* Message */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#F2EDE4',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Our standard experts are currently at capacity. Join the waitlist and we&apos;ll notify you as soon as a spot opens.
        </p>

        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          color: '#6b6457',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Standard Rate spots open frequently — most waitlist members hear back within a few hours.
        </p>

        {/* Explanation Box */}
        <div style={{
          border: '1px solid #2a261e',
          padding: '24px',
          marginBottom: '32px',
          backgroundColor: '#1a1710'
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#6b6457',
            margin: 0
          }}>
            Your spot is held for 2 hours once notified. Joining the waitlist is free — you will not be charged until you submit your request after your spot opens.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#3d1a1a',
            border: '1px solid #8b2d2d',
            borderRadius: '4px'
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button
            onClick={handleJoinWaitlist}
            disabled={joining}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 32px',
              backgroundColor: joining ? '#6b6457' : '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: 'none',
              cursor: joining ? 'not-allowed' : 'pointer',
              width: '100%',
              minHeight: '44px'
            }}
          >
            {joining ? 'Joining...' : 'Join Waitlist'}
          </button>
        </div>

        <button
          onClick={onCancel}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#6b6457',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            width: '100%',
            textDecoration: 'underline'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
