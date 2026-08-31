'use client'

import { useState } from 'react'

interface FreeEvaluationConfirmationModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function FreeEvaluationConfirmationModal({
  onConfirm,
  onCancel,
}: FreeEvaluationConfirmationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if user has a payment method on file
      const response = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check payment method status')
      }

      const data = await response.json()

      if (data.hasPaymentMethod) {
        // User already has a card on file - proceed with submission
        onConfirm()
      } else {
        // User needs to add a card - redirect to Stripe Checkout setup mode
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      }
    } catch (err) {
      console.error('Error during free eval setup:', err)
      setError('Failed to start free evaluation. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#1a1816',
          border: '1px solid #2a261e',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}
        >
          Free Evaluation
        </h2>

        {/* Price Badge */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
            }}
          >
            FREE
          </div>
        </div>

        {/* What's Included */}
        <div
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#F2EDE4',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          What&apos;s Included:
        </div>

        <ul
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#F2EDE4',
            lineHeight: 1.7,
            marginBottom: '24px',
            paddingLeft: '20px',
            listStyleType: 'disc',
          }}
        >
          <li style={{ marginBottom: '8px' }}>
            Reviewed personally by one of our trade experts
          </li>
          <li style={{ marginBottom: '8px' }}>
            Clear Accept/Decline verdict on your trade offer
          </li>
          <li style={{ marginBottom: '8px' }}>
            Reasoning behind the analysis
          </li>
          <li style={{ marginBottom: '8px' }}>
            Written and/or audio response you can reference anytime
          </li>
        </ul>

        {/* Turnaround Text */}
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            lineHeight: 1.7,
            marginBottom: '32px',
            fontStyle: 'italic',
          }}
        >
          We&apos;ll get to your free evaluation as quickly as we can. Response times may vary — but we won&apos;t leave you hanging.
        </p>

        {/* Payment Method Callout */}
        <div
          style={{
            border: '1px solid #C9A84C',
            backgroundColor: 'rgba(201, 168, 76, 0.05)',
            padding: '16px',
            marginBottom: '32px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            A payment method is required to prevent abuse of our free evaluations — you won&apos;t be charged.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: '#2a0a0a',
              border: '1px solid #ff4444',
              color: '#ff6666',
              padding: '16px',
              marginBottom: '24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: loading ? '#6b6457' : '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Processing...' : 'Start My Free Evaluation'}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: 'transparent',
              color: '#F2EDE4',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: '1px solid #2a261e',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
