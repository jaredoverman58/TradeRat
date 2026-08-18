'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AudioRecorder from './AudioRecorder'

// Dynamically import TipTap to avoid SSR issues
const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false })

export default function RespondForm({
  submissionId,
  expertId,
  serviceType,
}: {
  submissionId: string
  expertId: string
  serviceType: string
}) {
  const router = useRouter()
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  // Bundle service fields
  const [verdict, setVerdict] = useState<'accept' | 'decline' | ''>('')
  const [bonusContent, setBonusContent] = useState('')
  const isBundleService = serviceType === 'bundle'

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const draftKey = `draft_${submissionId}_${expertId}`

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) {
      setResponse(savedDraft)
      setLastSaved(new Date(localStorage.getItem(`${draftKey}_timestamp`) || ''))
    }
  }, [draftKey])

  // Auto-save draft every 30 seconds
  const saveDraft = useCallback(() => {
    if (response && response.trim()) {
      localStorage.setItem(draftKey, response)
      localStorage.setItem(`${draftKey}_timestamp`, new Date().toISOString())
      setLastSaved(new Date())
    }
  }, [response, draftKey])

  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    // Set up auto-save every 30 seconds
    if (response) {
      autoSaveTimerRef.current = setInterval(() => {
        saveDraft()
      }, 30000) // 30 seconds
    }

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [response, saveDraft])

  const canSubmit = () => {
    // Strip HTML tags for validation
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = response
    const textContent = tempDiv.textContent || tempDiv.innerText || ''

    // Must have written content OR audio
    const hasContent = textContent.trim() || audioBlob

    // If bundle service, must also have verdict and valid bonus content
    if (isBundleService) {
      return hasContent && verdict && bonusContent.trim().length >= 30
    }

    // For non-bundle services, just needs content
    return hasContent
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!canSubmit()) {
      setError('Please complete all required fields')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // Prepare request with or without audio
      let res: Response

      if (audioBlob) {
        // Send as FormData with audio
        const formData = new FormData()
        formData.append('submission_id', submissionId)
        formData.append('expert_id', expertId)
        formData.append('written_content', response || '') // Empty string if no text
        formData.append('audio', audioBlob, 'audio.webm')

        // Add bundle fields if applicable
        if (isBundleService) {
          formData.append('verdict', verdict)
          formData.append('bonus_content', bonusContent)
        }

        res = await fetch('/api/expert/respond', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Send as JSON without audio
        const payload: any = {
          submission_id: submissionId,
          expert_id: expertId,
          written_content: response,
        }

        // Add bundle fields if applicable
        if (isBundleService) {
          payload.verdict = verdict
          payload.bonus_content = bonusContent
        }

        res = await fetch('/api/expert/respond', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send response')
      }

      // Clear draft from localStorage on successful submission
      localStorage.removeItem(draftKey)
      localStorage.removeItem(`${draftKey}_timestamp`)

      setSuccess(true)
      // Refresh the page to show the sent response
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{
        backgroundColor: '#1a1710',
        border: '2px solid #C9A84C',
        padding: '48px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '24px',
        }}>
          ✓
        </div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          Response Sent!
        </h2>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          color: '#6b6457',
        }}>
          The user will be notified that their evaluation is ready.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '24px',
      }}>
        Write Your Response
      </h2>

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

      <form onSubmit={handleSubmit}>
        {/* Bundle Service: Verdict and Bonus Content */}
        {isBundleService && (
          <>
            {/* Verdict Dropdown */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                display: 'block',
                marginBottom: '12px',
              }}>
                Recommendation *
              </label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value as 'accept' | 'decline' | '')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1710',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                }}
              >
                <option value="">Select recommendation...</option>
                <option value="accept">Accept</option>
                <option value="decline">Decline</option>
              </select>
            </div>

            {/* Conditional Bonus Field */}
            {verdict && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  display: 'block',
                  marginBottom: '12px',
                }}>
                  {verdict === 'decline'
                    ? 'Counter Offer *'
                    : 'Bonus: Negotiation Tips or Next Move *'}
                </label>
                <textarea
                  value={bonusContent}
                  onChange={(e) => setBonusContent(e.target.value)}
                  placeholder={verdict === 'decline'
                    ? 'Provide a specific counter offer that improves the trade for the user...'
                    : 'Provide negotiation tips or next move advice to maximize value...'}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    backgroundColor: '#1a1710',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                  }}
                />
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  color: bonusContent.trim().length >= 30 ? '#4ade80' : '#6b6457',
                  marginTop: '8px',
                }}>
                  {bonusContent.trim().length}/30 characters minimum
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Analysis */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              display: 'block',
            }}>
              Your Expert Analysis *
            </label>
            {lastSaved && (
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
              }}>
                Draft saved at {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <TipTapEditor
              content={response}
              onChange={setResponse}
              placeholder="Write your detailed analysis here. Use the toolbar to format your text with bold, italics, and lists. Include your recommendation (accept/decline/counter) and explain your reasoning..."
            />
          </div>

          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
            marginTop: '8px',
          }}>
            Auto-saves every 30 seconds
          </div>
        </div>

        {/* Audio Recording */}
        <div style={{ marginBottom: '24px' }}>
          <AudioRecorder
            onRecordingComplete={setAudioBlob}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit()}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            width: '100%',
            padding: '20px',
            backgroundColor: submitting || !canSubmit() ? '#2a261e' : '#C9A84C',
            color: submitting || !canSubmit() ? '#6b6457' : '#0C0A07',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '1rem',
            border: 'none',
            cursor: submitting || !canSubmit() ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Sending Response...' : 'Send Response'}
        </button>
      </form>
    </div>
  )
}
