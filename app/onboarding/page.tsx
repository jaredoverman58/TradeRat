'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check if video is enabled (from admin settings)
  useEffect(() => {
    const checkVideoEnabled = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_roles')
        .select('onboarding_video_enabled')
        .eq('user_id', user.id)
        .single()

      if (data?.onboarding_video_enabled) {
        setShowVideo(true)
      }
    }
    checkVideoEnabled()
  }, [supabase])

  const completeOnboarding = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('user_roles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>

        {/* Progress Indicator */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: step === s ? '48px' : '12px',
                height: '12px',
                backgroundColor: step >= s ? '#C9A84C' : '#2a261e',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: '#F2EDE4',
              marginBottom: '32px',
            }}>
              Welcome to The Trade Rat
            </h1>

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.25rem',
              lineHeight: '1.8',
              color: '#F2EDE4',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px',
            }}>
              Get expert analysis on your fantasy football trades from real humans, not algorithms.
              Submit your trade, get personalized advice, typically within a few hours, and make smarter decisions.
              Your first evaluation is completely free.
            </p>

            {/* Video Placeholder (hidden until admin enables) */}
            {showVideo && (
              <div style={{
                border: '2px solid #C9A84C',
                padding: '32px',
                backgroundColor: '#1a1710',
                marginBottom: '48px',
              }}>
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: '#0C0A07',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #2a261e',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    color: '#6b6457',
                    fontSize: '0.875rem',
                  }}>
                    [Video Player Placeholder - Will be integrated by admin]
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '20px 48px',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: League Setup */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Set up your league profiles
            </h1>

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              color: '#6b6457',
              marginBottom: '48px',
            }}>
              Add as many leagues as you desire. Profiles help experts understand your league&apos;s scoring and roster rules.
            </p>

            <div style={{
              border: '1px solid #2a261e',
              padding: '48px',
              marginBottom: '32px',
              backgroundColor: '#1a1710',
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: '0 auto 16px' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  color: '#6b6457',
                }}>
                  No league profiles yet
                </p>
              </div>

              <Link
                href="/submit"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '16px 32px',
                  backgroundColor: '#C9A84C',
                  color: '#0C0A07',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Add League
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  border: '1px solid #2a261e',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: '#C9A84C',
                  border: '1px solid #C9A84C',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Free Evaluation CTA */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              Your free evaluation is ready
            </h1>

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              color: '#6b6457',
              marginBottom: '48px',
            }}>
              Submit your first trade and get expert analysis absolutely free. No credit card required.
            </p>

            <div style={{
              border: '2px solid #C9A84C',
              padding: '48px',
              backgroundColor: '#1a1710',
              marginBottom: '32px',
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '24px',
              }}>
                🎁
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '16px',
              }}>
                First Trade Evaluation - FREE
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#F2EDE4',
                lineHeight: '1.6',
                marginBottom: '32px',
              }}>
                Get professional analysis from our expert team. See if that trade offer is a trap or a steal.
              </p>

              <button
                onClick={completeOnboarding}
                disabled={loading}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '20px 48px',
                  backgroundColor: loading ? '#2a261e' : '#C9A84C',
                  color: loading ? '#6b6457' : '#0C0A07',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Loading...' : 'Claim Your Free Analysis'}
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#6b6457',
                border: '1px solid #2a261e',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
