'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SignedImageProps {
  filePath: string
  alt: string
  label?: string | null
  isOwnRoster?: boolean
  style?: React.CSSProperties
}

export default function SignedImage({
  filePath,
  alt,
  label,
  isOwnRoster,
  style
}: SignedImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getSignedUrl() {
      try {
        const supabase = createClient()

        // Check if filePath is already a full URL (legacy data)
        if (filePath.startsWith('http')) {
          // Extract path from URL for legacy data
          // Format: https://[project].supabase.co/storage/v1/object/public/trade-screenshots/path
          const pathMatch = filePath.match(/trade-screenshots\/(.+)$/)
          if (pathMatch) {
            const path = pathMatch[1]
            const { data, error } = await supabase.storage
              .from('trade-screenshots')
              .createSignedUrl(path, 60 * 60 * 24) // 24 hours

            if (error) throw error
            if (data?.signedUrl) {
              setSignedUrl(data.signedUrl)
            }
          } else {
            // If we can't extract path, use the URL as-is (might fail)
            setSignedUrl(filePath)
          }
        } else {
          // New format: filePath is already the storage path
          const { data, error } = await supabase.storage
            .from('trade-screenshots')
            .createSignedUrl(filePath, 60 * 60 * 24) // 24 hours

          if (error) throw error
          if (data?.signedUrl) {
            setSignedUrl(data.signedUrl)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error getting signed URL:', err)
        setError(err instanceof Error ? err.message : 'Failed to load image')
        setLoading(false)
      }
    }

    getSignedUrl()
  }, [filePath])

  if (loading) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1710',
        border: '1px solid #2a261e',
        minHeight: '200px',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
        }}>
          Loading image...
        </div>
      </div>
    )
  }

  if (error || !signedUrl) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1710',
        border: '1px solid #2a261e',
        minHeight: '200px',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#ff6666',
        }}>
          Failed to load image
        </div>
      </div>
    )
  }

  return (
    <div>
      {(label || isOwnRoster) && (
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          marginBottom: '8px',
        }}>
          {label}
          {isOwnRoster && (label ? ' (User\'s Roster)' : 'User\'s Roster')}
        </div>
      )}
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          marginBottom: '12px',
        }}
      >
        <img
          src={signedUrl}
          alt={alt}
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #2a261e',
            ...style,
          }}
        />
      </a>
      <a
        href={signedUrl}
        download
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          textDecoration: 'underline',
        }}
      >
        Download Full Size
      </a>
    </div>
  )
}
