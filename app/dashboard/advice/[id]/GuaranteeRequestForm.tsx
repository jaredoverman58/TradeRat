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
  const [remedy, setRemedy] = useState<'refund' | 'credit' | null>(null)

  if (!isEligible) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!reason.trim() || !remedy) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/guarantee/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          reason: reason.trim(),
          remedy,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit guarantee request')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guarantee request')
      setSubmitting(false)
    }
  }

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
          {remedy === 'refund' ? 'Refund Processed' : 'Replacement Credit Added'}
        </h3>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#F2EDE4',
          marginBottom: '12px',
        }}>
          {remedy === 'refund'
            ? 'Your full refund has been processed and will appear in your original payment method within 5-10 business days.'
            : 'A free replacement credit has been added to your account. You can submit a new request anytime.'}
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
        Request a full refund or free replacement evaluation.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#F2EDE4',
          display: 'block',
          marginBottom: '12px',
        }}>
          Choose your remedy <span style={{ color: '#ff6b6b' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="button"
            onClick={() => setRemedy('refund')}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '16px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textAlign: 'left',
              backgroundColor: remedy === 'refund' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
              border: `2px solid ${remedy === 'refund' ? '#C9A84C' : '#2a261e'}`,
              color: '#F2EDE4',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Full Refund</div>
            <div style={{ fontSize: '0.75rem', color: '#6b6457' }}>
              Money back in 5-10 business days
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRemedy('credit')}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '16px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textAlign: 'left',
              backgroundColor: remedy === 'credit' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
              border: `2px solid ${remedy === 'credit' ? '#C9A84C' : '#2a261e'}`,
              color: '#F2EDE4',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Free Replacement</div>
            <div style={{ fontSize: '0.75rem', color: '#6b6457' }}>
              Get a free do-over analysis
            </div>
          </button>
        </div>
      </div>

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
          Either option uses your one-time guarantee for this account. You won&apos;t be able to request this again on a future purchase.
        </p>
      </div>

      <button
        type="submit"
        disabled={!reason.trim() || !remedy || submitting}
        style={{
          padding: '12px 24px',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: (!reason.trim() || !remedy) ? '#6b6457' : '#0C0A07',
          backgroundColor: (!reason.trim() || !remedy) ? '#2a261e' : '#C9A84C',
          border: 'none',
          cursor: (!reason.trim() || !remedy || submitting) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {submitting ? 'Processing...' : 'Submit Request'}
      </button>

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
