'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export default function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please check your browser permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setRecordingTime(0)
    chunksRef.current = []
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      border: '1px solid #2a261e',
      padding: '24px',
      backgroundColor: '#1a1710',
    }}>
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#F2EDE4',
        marginBottom: '16px',
      }}>
        Audio Commentary (Optional)
      </div>

      {!audioUrl ? (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
          }}>
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '16px 32px',
                  backgroundColor: disabled ? '#2a261e' : '#C9A84C',
                  color: disabled ? '#6b6457' : '#0C0A07',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Start Recording
              </button>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#C9A84C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#ff4444',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s infinite',
                  }} />
                  {formatTime(recordingTime)}
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    padding: '16px 32px',
                    backgroundColor: '#2a261e',
                    color: '#F2EDE4',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    border: '1px solid #C9A84C',
                    cursor: 'pointer',
                  }}
                >
                  Stop Recording
                </button>
              </>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
          }}>
            Record audio commentary to provide additional context with your written analysis
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#C9A84C',
            marginBottom: '12px',
          }}>
            Recording complete ({formatTime(recordingTime)})
          </div>
          <audio
            controls
            src={audioUrl}
            style={{
              width: '100%',
              marginBottom: '16px',
            }}
          />
          <button
            type="button"
            onClick={deleteRecording}
            disabled={disabled}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#6b6457',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: '1px solid #2a261e',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            Delete & Re-record
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
