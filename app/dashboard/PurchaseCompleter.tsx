'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BuyConfirmationModal from '@/components/BuyConfirmationModal'

export default function PurchaseCompleter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we should complete a purchase
    const shouldCompletePurchase = searchParams.get('complete_purchase') === 'true'

    if (shouldCompletePurchase) {
      // Retrieve purchase data from URL params
      const bundle = searchParams.get('bundle')
      const service = searchParams.get('service')
      const credits = searchParams.get('credits')
      const price = searchParams.get('price')
      const name = searchParams.get('name')
      const desc = searchParams.get('desc')

      if (bundle && service && credits && price && name && desc) {
        setPurchaseData({
          bundleType: bundle,
          serviceType: service,
          credits: parseInt(credits),
          price: parseFloat(price),
          name: name,
          description: desc,
        })
        setShowModal(true)

        // Clean up URL (remove query params)
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [searchParams])

  const handleConfirm = async () => {
    if (!purchaseData) return

    setShowModal(false)
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bundle_type: purchaseData.bundleType,
          service_type: purchaseData.serviceType,
          credits: purchaseData.credits,
          price: Math.round(purchaseData.price * 100), // Convert dollars to cents
          name: purchaseData.name,
          description: purchaseData.description,
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

  const handleCancel = () => {
    setShowModal(false)
    setPurchaseData(null)
  }

  if (!showModal || !purchaseData) {
    return null
  }

  // Determine tier from bundleType
  const tier = purchaseData.bundleType.includes('rat_rate') ? 'rat' : 'standard'

  return (
    <>
      {loading && (
        <div style={{
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
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#F2EDE4',
            fontSize: '1.25rem',
          }}>
            Processing...
          </p>
        </div>
      )}

      {showModal && (
        <BuyConfirmationModal
          variant="landing"
          serviceType={purchaseData.serviceType}
          tier={tier}
          price={purchaseData.price}
          credits={purchaseData.credits}
          name={purchaseData.name}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
