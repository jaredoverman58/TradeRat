'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'rate_limit'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setStatus('rate_limit')
          setErrorMessage(data.error || 'Rate limit exceeded')
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Something went wrong')
        }
        return
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '80px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '16px',
          }}>
            Contact Us
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1.125rem',
            color: '#6b6457',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Have a question or need support? Send us a message and we'll get back to you soon.
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' && (
          <div style={{
            padding: '24px',
            backgroundColor: '#1a1710',
            border: '2px solid #C9A84C',
            marginBottom: '32px',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#C9A84C',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Message sent successfully!
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
            }}>
              We'll respond to your message as soon as possible.
            </p>
          </div>
        )}

        {/* Rate Limit Message */}
        {status === 'rate_limit' && (
          <div style={{
            padding: '24px',
            backgroundColor: '#1a1710',
            border: '2px solid #8B0000',
            marginBottom: '32px',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#8B0000',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Rate limit exceeded
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
            }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div style={{
            padding: '24px',
            backgroundColor: '#1a1710',
            border: '2px solid #8B0000',
            marginBottom: '32px',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#8B0000',
              fontWeight: 600,
            }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Contact Form */}
        <form onSubmit={handleSubmit} style={{
          border: '1px solid #2a261e',
          padding: '48px',
          backgroundColor: '#1a1710',
        }}>
          {/* Name Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
              }}
            />
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
              }}
            />
          </div>

          {/* Message Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Rate Limit Info */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
            marginBottom: '24px',
          }}>
            Rate limit: 3 messages per 24 hours, 6 per week per email address
          </p>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                padding: '16px 40px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                backgroundColor: status === 'submitting' ? '#6b6457' : '#C9A84C',
                color: '#0C0A07',
                border: 'none',
                cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
