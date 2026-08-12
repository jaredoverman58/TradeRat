'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Rating = {
  id: string
  thumbs_up: boolean
  feedback_text: string | null
  created_at: string
}

type RatingPromptProps = {
  submissionId: string
  deliveredAt: string | null
}

export default function RatingPrompt({ submissionId, deliveredAt }: RatingPromptProps) {
  const [rating, setRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedThumb, setSelectedThumb] = useState<boolean | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Check if we're within 48 hours of delivery
  const isWithin48Hours = deliveredAt
    ? Date.now() - new Date(deliveredAt).getTime() < 48 * 60 * 60 * 1000
    : false

  useEffect(() => {
    async function fetchRating() {
      const supabase = createClient()
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('submission_id', submissionId)
        .single()

      if (data) {
        setRating(data)
      }
      setLoading(false)
    }

    fetchRating()
  }, [submissionId])

  async function handleSubmit() {
    if (selectedThumb === null) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/ratings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          thumbs_up: selectedThumb,
          feedback_text: feedbackText.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit rating')
      }

      // Update local state with the new rating
      setRating(result.rating)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating')
      setSubmitting(false)
    }
  }

  if (loading) {
    return null // Don't show anything while loading
  }

  // If already rated, show the existing rating (read-only)
  if (rating) {
    return (
      <div style={{
        border: '1px solid #2a261e',
        padding: '32px',
        marginBottom: '40px',
        backgroundColor: '#0C0A07',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          Your Feedback
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: rating.feedback_text ? '16px' : '0',
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {rating.thumbs_up ? '👍' : '👎'}
          </span>
          <span style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            You rated this {rating.thumbs_up ? 'helpful' : 'not helpful'}
          </span>
        </div>
        {rating.feedback_text && (
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#F2EDE4',
            padding: '16px',
            backgroundColor: '#1a1710',
            border: '1px solid #2a261e',
            whiteSpace: 'pre-wrap',
          }}>
            {rating.feedback_text}
          </div>
        )}
      </div>
    )
  }

  // Show rating prompt
  return (
    <div style={{
      border: '1px solid #C9A84C',
      padding: '32px',
      marginBottom: '40px',
      backgroundColor: '#1a1710',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '8px',
      }}>
        Was this helpful?
      </h3>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        marginBottom: '24px',
      }}>
        Your feedback helps us improve our service
      </p>

      {/* Thumbs up/down buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: isWithin48Hours ? '24px' : '0',
      }}>
        <button
          onClick={() => {
            setSelectedThumb(true)
            if (!isWithin48Hours) {
              // Auto-submit if no text box showing
              handleSubmit()
            }
          }}
          disabled={submitting}
          style={{
            padding: '16px 32px',
            fontSize: '2rem',
            backgroundColor: selectedThumb === true ? '#C9A84C' : '#2a261e',
            border: selectedThumb === true ? '2px solid #C9A84C' : '1px solid #2a261e',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: submitting ? 0.5 : 1,
          }}
        >
          👍
        </button>
        <button
          onClick={() => {
            setSelectedThumb(false)
            if (!isWithin48Hours) {
              // Auto-submit if no text box showing
              handleSubmit()
            }
          }}
          disabled={submitting}
          style={{
            padding: '16px 32px',
            fontSize: '2rem',
            backgroundColor: selectedThumb === false ? '#C9A84C' : '#2a261e',
            border: selectedThumb === false ? '2px solid #C9A84C' : '1px solid #2a261e',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: submitting ? 0.5 : 1,
          }}
        >
          👎
        </button>
      </div>

      {/* Optional feedback text (only shown within 48 hours) */}
      {isWithin48Hours && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              display: 'block',
              marginBottom: '8px',
            }}>
              Want to tell us more? (optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share any additional thoughts..."
              disabled={submitting}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                resize: 'vertical',
                opacity: submitting ? 0.5 : 1,
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedThumb === null || submitting}
            style={{
              padding: '12px 24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: selectedThumb === null ? '#6b6457' : '#0C0A07',
              backgroundColor: selectedThumb === null ? '#2a261e' : '#C9A84C',
              border: 'none',
              cursor: selectedThumb === null || submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </>
      )}

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#3d1a1a',
          border: '1px solid #5a2424',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#ff6b6b',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
