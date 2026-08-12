'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PurchaseMessage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const purchase = searchParams.get('purchase')

    if (purchase === 'success') {
      setMessage({
        type: 'success',
        text: 'Purchase successful! Your credits have been added to your account.',
      })
    } else if (purchase === 'cancelled') {
      setMessage({
        type: 'error',
        text: 'Purchase cancelled. No charges were made.',
      })
    }

    // Clear the message after 5 seconds
    if (purchase) {
      const timer = setTimeout(() => {
        setMessage(null)
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard')
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!message) return null

  return (
    <div
      style={{
        padding: '16px 24px',
        marginBottom: '24px',
        backgroundColor: message.type === 'success' ? '#1a3d1a' : '#3d1a1a',
        border: `1px solid ${message.type === 'success' ? '#4a7c4a' : '#7c4a4a'}`,
        color: message.type === 'success' ? '#a8d5a8' : '#d5a8a8',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
      }}
    >
      {message.text}
    </div>
  )
}
