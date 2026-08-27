'use client'

import { useEffect, useState } from 'react'

export default function DashboardLoading() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '24px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #2a261e',
            borderTop: '3px solid #C9A84C',
            borderRadius: '50%',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.03s linear',
          }} />
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            letterSpacing: '0.05em',
          }}>
            Sniffing out your trades...
          </div>
        </div>
      </div>
    </div>
  )
}
