'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Expert {
  id: string
  name: string
  tier: string
}

export default function DevToolsTab() {
  const router = useRouter()
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExpertId, setSelectedExpertId] = useState<string>('')
  const [selectedServiceType, setSelectedServiceType] = useState<string>('accept_decline')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ submissionId: string; expertUrl: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resettingOnboarding, setResettingOnboarding] = useState(false)

  // Fetch experts on mount
  useEffect(() => {
    fetch('/api/admin/experts')
      .then(res => res.json())
      .then(data => {
        setExperts(data.experts || [])
        if (data.experts && data.experts.length > 0) {
          setSelectedExpertId(data.experts[0].id)
        }
      })
      .catch(() => setError('Failed to load experts'))
  }, [])

  const handleResetOnboarding = async () => {
    setResettingOnboarding(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/reset-onboarding', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset onboarding')
      }

      // Redirect to onboarding
      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setResettingOnboarding(false)
    }
  }

  const handleCreateTestSubmission = async () => {
    if (!selectedExpertId) {
      setError('Please select an expert')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/create-test-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: selectedExpertId,
          serviceType: selectedServiceType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create test submission')
      }

      setResult({
        submissionId: data.submissionId,
        expertUrl: `/expert/submissions/${data.submissionId}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '16px',
      }}>
        Dev Tools
      </h2>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        marginBottom: '32px',
      }}>
        Quick testing utilities for development. These bypass normal workflows.
      </p>

      {/* Test Submission Creator */}
      <div style={{
        border: '1px solid #2a261e',
        padding: '32px',
        backgroundColor: '#1a1710',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '8px',
        }}>
          Create Test Submission
        </h3>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginBottom: '24px',
        }}>
          Instantly create a test submission with dummy data and auto-assign to an expert.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#2a0a0a',
            border: '1px solid #ff4444',
            color: '#ff6666',
            padding: '16px',
            marginBottom: '24px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            backgroundColor: '#0a2a0a',
            border: '1px solid #44ff44',
            color: '#66ff66',
            padding: '24px',
            marginBottom: '24px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
          }}>
            <div style={{ marginBottom: '16px' }}>
              ✓ Test submission created successfully!
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Submission ID:</strong> {result.submissionId}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Expert URL:</strong>
            </div>
            <a
              href={result.expertUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
              }}
            >
              Open in Expert View →
            </a>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#F2EDE4',
            display: 'block',
            marginBottom: '8px',
          }}>
            Assign to Expert
          </label>
          <select
            value={selectedExpertId}
            onChange={(e) => setSelectedExpertId(e.target.value)}
            disabled={loading}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              width: '100%',
              padding: '12px',
              backgroundColor: '#0C0A07',
              border: '1px solid #2a261e',
              color: '#F2EDE4',
              fontSize: '1rem',
            }}
          >
            {experts.length === 0 ? (
              <option>Loading experts...</option>
            ) : (
              experts.map(expert => (
                <option key={expert.id} value={expert.id}>
                  {expert.name} ({expert.tier})
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#F2EDE4',
            display: 'block',
            marginBottom: '8px',
          }}>
            Service Type
          </label>
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            disabled={loading}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              width: '100%',
              padding: '12px',
              backgroundColor: '#0C0A07',
              border: '1px solid #2a261e',
              color: '#F2EDE4',
              fontSize: '1rem',
            }}
          >
            <option value="accept_decline">Accept/Decline</option>
            <option value="counter_offer">Counter Offer</option>
            <option value="bundle">Accept/Decline + Bonus (Bundle)</option>
            <option value="trade_finder">Trade Finder</option>
          </select>
        </div>

        <button
          onClick={handleCreateTestSubmission}
          disabled={loading || !selectedExpertId}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '16px 32px',
            backgroundColor: loading || !selectedExpertId ? '#2a261e' : '#C9A84C',
            color: loading || !selectedExpertId ? '#6b6457' : '#0C0A07',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
            border: 'none',
            cursor: loading || !selectedExpertId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Test Submission'}
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        border: '1px solid #2a261e',
        padding: '24px',
        backgroundColor: '#1a1710',
      }}>
        <h4 style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#C9A84C',
          marginBottom: '12px',
        }}>
          What This Creates
        </h4>
        <ul style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          lineHeight: '1.8',
          paddingLeft: '20px',
        }}>
          <li>A complete submission with dummy trade data</li>
          <li>Status set to &quot;claimed&quot; and assigned to selected expert</li>
          <li>Fake league profile with realistic settings</li>
          <li>No actual files uploaded (screenshot upload optional)</li>
          <li>Direct link to expert submission view for immediate testing</li>
        </ul>
      </div>

      {/* Reset Onboarding Tool */}
      <div style={{
        border: '1px solid #2a261e',
        padding: '32px',
        backgroundColor: '#1a1710',
        marginTop: '32px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '8px',
        }}>
          Reset My Onboarding
        </h3>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginBottom: '24px',
        }}>
          Test the 3-step onboarding flow without creating a new account. Resets your onboarding status and redirects you to /onboarding.
        </p>

        <button
          onClick={handleResetOnboarding}
          disabled={resettingOnboarding}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '16px 32px',
            backgroundColor: resettingOnboarding ? '#2a261e' : '#C9A84C',
            color: resettingOnboarding ? '#6b6457' : '#0C0A07',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
            border: 'none',
            cursor: resettingOnboarding ? 'not-allowed' : 'pointer',
          }}
        >
          {resettingOnboarding ? 'Resetting...' : 'Reset My Onboarding'}
        </button>
      </div>
    </div>
  )
}
