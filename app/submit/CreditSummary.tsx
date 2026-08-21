'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CreditsByServiceType {
  accept_decline: number
  counter_offer: number
  bundle: number
  trade_finder: number
}

interface CreditSummaryProps {
  userId: string | null
  selectedServiceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
  onServiceTypeChange: (serviceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder') => void
}

export default function CreditSummary({ userId, selectedServiceType, onServiceTypeChange }: CreditSummaryProps) {
  const [credits, setCredits] = useState<CreditsByServiceType | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCredits() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Fetch all active bundles for this user
        const { data: bundles, error } = await supabase
          .from('bundles')
          .select('service_type, credits_remaining')
          .eq('user_id', userId)
          .gt('credits_remaining', 0)
          .gt('expires_at', new Date().toISOString())

        if (error) throw error

        // Aggregate credits by service type
        const creditsByType: CreditsByServiceType = {
          accept_decline: 0,
          counter_offer: 0,
          bundle: 0,
          trade_finder: 0,
        }

        bundles?.forEach(bundle => {
          if (bundle.service_type in creditsByType) {
            creditsByType[bundle.service_type as keyof CreditsByServiceType] += bundle.credits_remaining
          }
        })

        setCredits(creditsByType)
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [userId, supabase])

  if (loading) {
    return (
      <div style={{
        padding: '32px',
        backgroundColor: '#1a1710',
        border: '2px solid #2a261e',
        marginBottom: '48px',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          textAlign: 'center',
        }}>
          Loading credits...
        </p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div style={{
        padding: '32px',
        backgroundColor: '#1a1710',
        border: '2px solid #C9A84C',
        marginBottom: '48px',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          You need to sign in to submit a trade evaluation.
        </p>
        <Link
          href="/login?redirect=/submit"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#0C0A07',
            backgroundColor: '#C9A84C',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (!credits) {
    return null
  }

  const totalCredits = credits.accept_decline + credits.counter_offer + credits.bundle + credits.trade_finder
  const availableServiceTypes = (Object.keys(credits) as Array<keyof CreditsByServiceType>).filter(
    type => credits[type] > 0
  )

  // No credits at all
  if (totalCredits === 0) {
    return (
      <div style={{
        padding: '32px',
        backgroundColor: '#1a1710',
        border: '2px solid #C9A84C',
        marginBottom: '48px',
      }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          You don&apos;t have any credits. Get started on the pricing page.
        </p>
        <Link
          href="/pricing"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#0C0A07',
            backgroundColor: '#C9A84C',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          View Pricing
        </Link>
      </div>
    )
  }

  const serviceTypeLabels: Record<keyof CreditsByServiceType, string> = {
    accept_decline: 'Accept/Decline',
    counter_offer: 'Counter Offer',
    bundle: 'Accept/Decline + Bonus',
    trade_finder: 'Trade Finder',
  }

  // Has credits - show summary and selector if multiple types available
  return (
    <div style={{
      padding: '32px',
      backgroundColor: '#1a1710',
      border: '2px solid #C9A84C',
      marginBottom: '48px',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#C9A84C',
        marginBottom: '24px',
      }}>
        Your Credits
      </h2>

      {/* Show credits for each available service type */}
      {availableServiceTypes.map(serviceType => (
        <div
          key={serviceType}
          style={{
            marginBottom: '16px',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#F2EDE4',
          }}>
            <strong>{serviceTypeLabels[serviceType]}:</strong> {credits[serviceType]} {credits[serviceType] === 1 ? 'credit' : 'credits'} remaining
          </p>
        </div>
      ))}

      {/* Service type selector if multiple types available */}
      {availableServiceTypes.length > 1 ? (
        <div style={{ marginTop: '24px' }}>
          <label style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#F2EDE4',
            marginBottom: '16px',
            display: 'block',
          }}>
            Select Service Type for This Submission *
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableServiceTypes.map(serviceType => (
              <div
                key={serviceType}
                onClick={() => onServiceTypeChange(serviceType)}
                style={{
                  border: selectedServiceType === serviceType ? '2px solid #C9A84C' : '2px solid #2a261e',
                  padding: '16px',
                  cursor: 'pointer',
                  backgroundColor: selectedServiceType === serviceType ? '#0C0A07' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: selectedServiceType === serviceType ? '6px solid #C9A84C' : '2px solid #2a261e',
                    marginRight: '12px',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    {serviceTypeLabels[serviceType]}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                }}>
                  {credits[serviceType]} {credits[serviceType] === 1 ? 'credit' : 'credits'}
                </span>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            marginTop: '12px',
          }}>
            This submission will use 1 {serviceTypeLabels[selectedServiceType]} credit.
          </p>
        </div>
      ) : (
        // Only one service type available - show simple message
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #2a261e',
        }}>
          This submission will use 1 {serviceTypeLabels[selectedServiceType]} credit.
        </p>
      )}

      {/* Link to get more credits */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #2a261e' }}>
        <Link
          href="/pricing"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#C9A84C',
            textDecoration: 'none',
          }}
        >
          Get more credits →
        </Link>
      </div>
    </div>
  )
}
