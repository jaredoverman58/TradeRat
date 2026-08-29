'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Check if user is an expert (but not admin) and redirect to /expert
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Check if user has admin role
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          const isAdmin = userRole?.role === 'admin'

          // Check if user is an expert
          const { data: expert } = await supabase
            .from('experts')
            .select('id')
            .eq('user_id', user.id)
            .single()

          // Redirect non-admin experts to /expert
          if (expert && !isAdmin) {
            router.push('/expert')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/dashboard')
        }

        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '3rem',
            fontWeight: 900,
            color: '#C9A84C',
            marginBottom: '16px',
          }}>
            TRADE RAT
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '1rem',
          }}>
            Sign in to your account
          </p>
        </div>

        <div style={{ border: '1px solid #2a261e', padding: '48px' }}>
          <form onSubmit={handleLogin}>
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

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '12px',
                display: 'block',
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#0C0A07',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label htmlFor="password" style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '12px',
                display: 'block',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    paddingRight: '48px',
                    backgroundColor: '#0C0A07',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                width: '100%',
                padding: '16px',
                backgroundColor: loading ? '#2a261e' : '#C9A84C',
                color: loading ? '#6b6457' : '#0C0A07',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              fontSize: '0.875rem',
            }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#C9A84C', textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
