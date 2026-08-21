'use client'

import { useState } from 'react'

type Bundle = {
  id: string
  service_type: string
  bundle_type: string
  credits_remaining: number
  expires_at: string
}

type Props = {
  bundles: Bundle[]
  getServiceName: (serviceType: string) => string
  getRateTierName: (bundleType: string) => string
}

export default function CollapsiblePurchases({ bundles, getServiceName, getRateTierName }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div style={{ marginBottom: '60px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '24px',
          padding: 0,
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2rem',
          fontWeight: 700,
          color: '#F2EDE4',
          margin: 0,
        }}>
          Your Purchases
        </h2>
        <span style={{
          fontSize: '1.5rem',
          color: '#C9A84C',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>
          +
        </span>
      </button>

      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px',
          backgroundColor: '#2a261e',
        }}>
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              style={{
                backgroundColor: '#0C0A07',
                padding: '32px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#C9A84C',
                marginBottom: '4px',
              }}>
                {getServiceName(bundle.service_type)}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#6b6457',
                marginBottom: '12px',
              }}>
                {getRateTierName(bundle.bundle_type)}
              </div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                {bundle.credits_remaining}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
              }}>
                {bundle.credits_remaining === 1 ? 'Credit' : 'Credits'} remaining
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
              }}>
                Expires: {new Date(bundle.expires_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
