'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SignedAudioProps {
  filePath: string
  style?: React.CSSProperties
}

export default function SignedAudio({ filePath, style }: SignedAudioProps) {
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
          const pathMatch = filePath.match(/expert-audio\/(.+)$/)
          if (pathMatch) {
            const path = pathMatch[1]
            const { data, error } = await supabase.storage
              .from('expert-audio')
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
            .from('expert-audio')
            .createSignedUrl(filePath, 60 * 60 * 24) // 24 hours

          if (error) throw error
          if (data?.signedUrl) {
            setSignedUrl(data.signedUrl)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error getting signed URL for audio:', err)
        setError(err instanceof Error ? err.message : 'Failed to load audio')
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
        minHeight: '100px',
        padding: '24px',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
        }}>
          Loading audio...
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
        minHeight: '100px',
        padding: '24px',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#ff6666',
        }}>
          Failed to load audio
        </div>
      </div>
    )
  }

  return (
    <audio
      controls
      src={signedUrl}
      style={{
        width: '100%',
        ...style,
      }}
    >
      Your browser does not support the audio element.
    </audio>
  )
}
