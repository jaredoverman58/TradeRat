'use client'

import { useState } from 'react'

type GuaranteeRequestFormProps = {
  submissionId: string
  isEligible: boolean
}

export default function GuaranteeRequestForm({ submissionId, isEligible }: GuaranteeRequestFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [reason, setReason] = useState('')

  // Safety fallback - parent decides visibility, but this protects against misuse
  if (!isEligible) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!reason.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/guarantee/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          reason: reason.trim(),
          remedy: 'refund', // Fixed to refund-only for now
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit guarantee request')
      }

      // Success - show confirmation
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guarantee request')
      setSubmitting(false)
    }
  }

  // If already submitted successfully, show confirmation
  if (success) {
    return (
      <div style={{
        border: '2px solid #4ade80',
        padding: '32px',
        marginBottom: '40px',
        backgroundColor: '#1a1710',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#4ade80',
          marginBottom: '16px',
        }}>
          ✓ Refund Processed
        </h3>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#F2EDE4',
          marginBottom: '12px',
        }}>
          Your full refund has been processed and will appear in your original payment method within 5-10 business days.
        </p>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          color: '#6b6457',
        }}>
          Your one-time money-back guarantee has been used for this account.
        </p>
      </div>
    )
  }

  // Show guarantee request form
  return (
    <form onSubmit={handleSubmit} style={{
      border: '2px solid #C9A84C',
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
        Money-Back Guarantee
      </h3>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        marginBottom: '24px',
      }}>
        Not satisfied with this analysis? Request a full refund.
      </p>

      {/* Reason textarea */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#F2EDE4',
          display: 'block',
          marginBottom: '8px',
        }}>
          Tell us what didn&apos;t work for you <span style={{ color: '#ff6b6b' }}>*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please describe what was unsatisfactory about this analysis..."
          required
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

      {/* One-time guarantee disclosure */}
      <div style={{
        padding: '16px',
        marginBottom: '24px',
        backgroundColor: '#0C0A07',
        border: '1px solid #2a261e',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          color: '#6b6457',
          lineHeight: 1.6,
        }}>
          ⚠️ This uses your one-time guarantee for this account. You won&apos;t be able to request this again on a future purchase.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!reason.trim() || submitting}
        style={{
          padding: '12px 24px',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: !reason.trim() ? '#6b6457' : '#0C0A07',
          backgroundColor: !reason.trim() ? '#2a261e' : '#C9A84C',
          border: 'none',
          cursor: (!reason.trim() || submitting) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {submitting ? 'Processing...' : 'Request Refund'}
      </button>

      {/* Error display */}
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
    </form>
  )
}
