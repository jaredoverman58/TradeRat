'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BuyConfirmationModal from '@/components/BuyConfirmationModal'

interface BundlePurchaseButtonProps {
  bundleType: 'standard_3_pack' | 'standard_5_pack' | 'rat_rate_3_pack' | 'rat_rate_5_pack'
  serviceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
  credits: number
  price: number // Price in dollars (will be converted to cents)
  name: string
  description: string
  buttonText: string
  disabled?: boolean
  variant?: 'landing' | 'pricing' // Default to 'landing' for landing page usage
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
  variant = 'landing',
}: BundlePurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [supabase])

  // Show the confirmation modal
  const handlePurchase = () => {
    // If not logged in, redirect to signup with purchase intent in URL
    if (isLoggedIn === false) {
      const params = new URLSearchParams({
        intent: 'purchase',
        bundle: bundleType,
        service: serviceType,
        credits: credits.toString(),
        price: price.toString(),
        name: name,
        desc: description,
      })
      router.push(`/signup?${params.toString()}`)
      return
    }

    // Otherwise show confirmation modal
    setShowModal(true)
  }

  // Process checkout after confirmation
  const handleConfirm = async () => {
    setShowModal(false)
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

  // Cancel modal
  const handleCancel = () => {
    setShowModal(false)
  }

  // Determine tier from bundleType
  const tier = bundleType.includes('rat_rate') ? 'rat' : 'standard'

  return (
    <>
      <button
        onClick={handlePurchase}
        disabled={loading || disabled || isLoggedIn === null}
        style={{
          fontFamily: 'var(--font-dm-sans)',
          padding: '16px 40px',
          backgroundColor: loading || disabled || isLoggedIn === null ? '#6b6457' : '#C9A84C',
          color: '#0C0A07',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '0.875rem',
          border: 'none',
          cursor: loading || disabled || isLoggedIn === null ? 'not-allowed' : 'pointer',
          opacity: loading || disabled || isLoggedIn === null ? 0.6 : 1,
        }}
      >
        {loading ? 'Processing...' : buttonText}
      </button>

      {showModal && (
        <BuyConfirmationModal
          variant={variant}
          serviceType={serviceType}
          tier={tier}
          price={price}
          credits={credits}
          name={name}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
