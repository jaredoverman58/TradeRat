'use client'

import { useState } from 'react'

interface BundlePurchaseButtonProps {
  bundleType: 'standard_3_pack' | 'standard_5_pack' | 'rat_rate_3_pack' | 'rat_rate_5_pack'
  serviceType: 'accept_decline' | 'counter_offer' | 'bundle'
  credits: number
  price: number // Price in dollars (will be converted to cents)
  name: string
  description: string
  buttonText: string
  disabled?: boolean
}

export default function BundlePurchaseButton({
  bundleType,
  serviceType,
  credits,
  price,
  name,
  description,
  buttonText,
  disabled = false,
}: BundlePurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bundle_type: bundleType,
          service_type: serviceType,
          credits,
          price: Math.round(price * 100), // Convert dollars to cents
          name,
          description,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        alert('Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error starting checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading || disabled}
      style={{
        fontFamily: 'var(--font-dm-sans)',
        padding: '16px 40px',
        backgroundColor: loading || disabled ? '#6b6457' : '#C9A84C',
        color: '#0C0A07',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.875rem',
        border: 'none',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
      }}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  )
}
