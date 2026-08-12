'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('id')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState<any>(null)

  useEffect(() => {
    async function loadSubmission() {
      if (!submissionId) {
        router.push('/dashboard')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setSubmission(data)
      setLoading(false)
    }

    loadSubmission()
  }, [submissionId, supabase, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm-sans)', color: '#C9A84C' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '3px solid #C9A84C',
          margin: '0 auto 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '2.5rem',
            color: '#C9A84C',
          }}>
            ✓
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 900,
          color: '#F2EDE4',
          marginBottom: '24px',
        }}>
          Trade Evaluation Submitted
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1.125rem',
          color: '#6b6457',
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 48px',
        }}>
          Your trade evaluation request is now in the queue. An expert will review your submission and provide detailed advice within 24-48 hours.
        </p>

        {/* Status Box */}
        <div style={{
          backgroundColor: '#1a1710',
          border: '1px solid #2a261e',
          padding: '32px',
          marginBottom: '48px',
          textAlign: 'left',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
                marginBottom: '8px',
              }}>
                Submission ID
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                {submissionId?.substring(0, 8)}...
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
                Status
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#C9A84C',
                fontWeight: 600,
              }}>
                {submission?.status === 'submitted' ? 'In Queue' : submission?.status}
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
                Expert Tier
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                {submission?.rate_tier === 'rat_rate' ? 'The Trade Rat (Premium)' : 'Standard'}
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
                Submitted At
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                {new Date(submission?.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          textAlign: 'left',
          marginBottom: '48px',
          backgroundColor: '#1a1710',
          border: '1px solid #2a261e',
          padding: '32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            What Happens Next?
          </h2>

          <ol style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            lineHeight: '1.8',
            paddingLeft: '24px',
          }}>
            <li style={{ marginBottom: '12px', color: '#F2EDE4' }}>
              An expert will claim your submission from the queue
            </li>
            <li style={{ marginBottom: '12px', color: '#F2EDE4' }}>
              They&apos;ll review your rosters and trade details
            </li>
            <li style={{ marginBottom: '12px', color: '#F2EDE4' }}>
              You&apos;ll receive a notification when the analysis is ready (within 24-48 hours)
            </li>
            <li style={{ color: '#F2EDE4' }}>
              Check your dashboard to view the expert&apos;s recommendation
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              display: 'inline-block',
            }}
          >
            Go to Dashboard
          </Link>

          <Link
            href="/submit"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: 'transparent',
              border: '1px solid #2a261e',
              color: '#F2EDE4',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              display: 'inline-block',
            }}
          >
            Submit Another Trade
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm-sans)', color: '#C9A84C' }}>Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
