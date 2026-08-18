'use client'

import { useState, useEffect } from 'react'

interface DeadlineCountdownProps {
  submittedAt: string
  serviceType: string
}

export default function DeadlineCountdown({ submittedAt, serviceType }: DeadlineCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const calculateTimeRemaining = () => {
      const submissionTime = new Date(submittedAt).getTime()

      // Determine deadline hours based on service type
      let deadlineHours = 24 // Default for accept_decline, counter_offer, bundle
      if (serviceType === 'trade_finder') {
        deadlineHours = 48
      }

      const deadlineTime = submissionTime + (deadlineHours * 60 * 60 * 1000)
      const now = Date.now()
      const remaining = deadlineTime - now

      setTimeRemaining(remaining)
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [submittedAt, serviceType, isClient])

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  const formatTime = (ms: number) => {
    if (ms <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isOverdue: true }
    }

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return { hours, minutes, seconds, isOverdue: false }
  }

  const { hours, minutes, seconds, isOverdue } = formatTime(timeRemaining)

  // Determine color based on time remaining
  const twoHours = 2 * 60 * 60 * 1000
  const thirtyMinutes = 30 * 60 * 1000

  let backgroundColor = '#1a5c1a' // Green
  let borderColor = '#2d8f2d'
  let textColor = '#7dff7d'
  let statusText = 'ON TIME'

  if (isOverdue) {
    backgroundColor = '#5c1a1a' // Red
    borderColor = '#8f2d2d'
    textColor = '#ff7d7d'
    statusText = 'OVERDUE'
  } else if (timeRemaining < thirtyMinutes) {
    backgroundColor = '#5c1a1a' // Red
    borderColor = '#8f2d2d'
    textColor = '#ff7d7d'
    statusText = 'URGENT'
  } else if (timeRemaining < twoHours) {
    backgroundColor = '#5c4d1a' // Yellow/amber
    borderColor = '#8f7a2d'
    textColor = '#ffd87d'
    statusText = 'APPROACHING'
  }

  const deadlineHours = serviceType === 'trade_finder' ? 48 : 24

  return (
    <div
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        padding: '24px 32px',
        marginBottom: '32px',
        animation: isOverdue ? 'flash 1s infinite' : 'none',
      }}
    >
      <style jsx>{`
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: textColor,
            marginBottom: '8px',
            fontWeight: 600,
          }}>
            {statusText} - {deadlineHours} Hour Guarantee
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.02em',
          }}>
            {isOverdue ? 'DEADLINE PASSED' : (
              <>
                {String(hours).padStart(2, '0')}:
                {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: textColor,
            marginBottom: '8px',
          }}>
            Submitted
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: textColor,
          }}>
            {new Date(submittedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {!isOverdue && (
        <div style={{
          marginTop: '12px',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: textColor,
          opacity: 0.8,
        }}>
          {timeRemaining < twoHours ? (
            timeRemaining < thirtyMinutes ? (
              '⚠️ Less than 30 minutes remaining - submit immediately!'
            ) : (
              '⏰ Less than 2 hours remaining - please prioritize'
            )
          ) : (
            `Time remaining until ${deadlineHours}-hour guarantee expires`
          )}
        </div>
      )}
    </div>
  )
}
