'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function AuthConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        // Get the hash fragment from the URL (e.g., #access_token=...&refresh_token=...)
        const hashFragment = window.location.hash.substring(1) // Remove leading '#'

        if (!hashFragment) {
          setError('No authentication data found in URL')
          return
        }

        // Parse the hash fragment into key-value pairs
        const params = new URLSearchParams(hashFragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setError('Missing authentication tokens')
          return
        }

        // Set the session using the tokens from the hash
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        // Get the final destination from the query parameter
        const next = searchParams.get('next') || '/dashboard'

        // Redirect to the final destination
        window.location.href = next
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    }

    confirmAuth()
  }, [router, searchParams, supabase.auth])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            color: '#ff6666',
            marginBottom: '16px',
          }}>
            Authentication Failed
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            marginBottom: '24px',
          }}>
            {error}
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 32px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Return to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2rem',
          color: '#C9A84C',
          marginBottom: '16px',
        }}>
          Confirming Authentication...
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          color: '#6b6457',
        }}>
          Please wait while we log you in.
        </p>
      </div>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            color: '#C9A84C',
            marginBottom: '16px',
          }}>
            Loading...
          </h1>
        </div>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  )
}
