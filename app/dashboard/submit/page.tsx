'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

export default function SubmitTradePage() {
  const router = useRouter()
  const supabase = createClient()

  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [requestType, setRequestType] = useState<'trade_evaluation' | 'trade_finder'>('trade_evaluation')
  const [specificTradeOffer, setSpecificTradeOffer] = useState('')
  const [platform, setPlatform] = useState('')
  const [scoringType, setScoringType] = useState('')
  const [rosterSize, setRosterSize] = useState('')
  const [userNotes, setUserNotes] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUploading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check for available credits
      const { data: packages } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', user.id)
        .gt('credits_remaining', 0)
        .order('expires_at', { ascending: true })

      if (!packages || packages.length === 0) {
        setError('No credits available. Please purchase a package first.')
        setUploading(false)
        return
      }

      // Use the package with the earliest expiration
      const packageToUse = packages[0]

      // Upload screenshots
      const screenshotUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, file)

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName)

        screenshotUrls.push(publicUrl)
      }

      // Create trade request
      const { error: requestError } = await supabase
        .from('trade_requests')
        .insert({
          user_id: user.id,
          package_id: packageToUse.id,
          screenshot_urls: screenshotUrls,
          league_rules: {
            platform,
            scoring_type: scoringType,
            roster_size: rosterSize,
          },
          user_notes: userNotes,
          request_type: requestType,
          specific_trade_offer: requestType === 'trade_evaluation' ? specificTradeOffer : null,
        })

      if (requestError) {
        throw new Error(`Failed to create request: ${requestError.message}`)
      }

      // Success - redirect to dashboard
      router.push('/dashboard?submitted=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
          }}>
            Submit Trade Request
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: '#2a0a0a',
              border: '1px solid #ff4444',
              color: '#ff6666',
              padding: '16px',
              marginBottom: '32px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* Request Type Selection */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '20px',
              display: 'block',
            }}>
              What do you need? *
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Trade Evaluation Option */}
              <div
                onClick={() => setRequestType('trade_evaluation')}
                style={{
                  border: requestType === 'trade_evaluation' ? '2px solid #C9A84C' : '2px solid #2a261e',
                  padding: '24px',
                  cursor: 'pointer',
                  backgroundColor: requestType === 'trade_evaluation' ? '#1a1710' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: requestType === 'trade_evaluation' ? '6px solid #C9A84C' : '2px solid #2a261e',
                    marginRight: '12px',
                  }} />
                  <h3 style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#F2EDE4',
                    margin: 0,
                  }}>
                    Evaluate an Offer
                  </h3>
                </div>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  You have a specific trade offer to evaluate. Expert will analyze and recommend accept/decline/counter.
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  color: '#C9A84C',
                  marginTop: '12px',
                  marginBottom: 0,
                }}>
                  ~20-30 min review
                </p>
              </div>

              {/* Trade Finder Option */}
              <div
                onClick={() => setRequestType('trade_finder')}
                style={{
                  border: requestType === 'trade_finder' ? '2px solid #C9A84C' : '2px solid #2a261e',
                  padding: '24px',
                  cursor: 'pointer',
                  backgroundColor: requestType === 'trade_finder' ? '#1a1710' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: requestType === 'trade_finder' ? '6px solid #C9A84C' : '2px solid #2a261e',
                    marginRight: '12px',
                  }} />
                  <h3 style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#F2EDE4',
                    margin: 0,
                  }}>
                    Find Me a Trade
                  </h3>
                </div>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#6b6457',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  You want trade ideas. Expert will analyze your entire league and create specific trade suggestions.
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  color: '#C9A84C',
                  marginTop: '12px',
                  marginBottom: 0,
                }}>
                  ~45-60 min review • Premium pricing
                </p>
              </div>
            </div>
          </div>

          {/* Specific Trade Offer Field (only for trade_evaluation) */}
          {requestType === 'trade_evaluation' && (
            <div style={{ marginBottom: '40px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '16px',
                display: 'block',
              }}>
                Describe the Trade Offer *
              </label>
              <textarea
                value={specificTradeOffer}
                onChange={(e) => setSpecificTradeOffer(e.target.value)}
                placeholder="e.g., 'Their Christian McCaffrey for my Justin Jefferson and Joe Mixon'"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#0C0A07',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
                marginTop: '8px',
                marginBottom: 0,
              }}>
                Be specific about who gives what. This helps the expert focus their analysis.
              </p>
            </div>
          )}

          {/* Screenshot Upload */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              Upload Screenshots *
            </label>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '16px',
            }}>
              {requestType === 'trade_finder'
                ? 'Upload your roster and all team rosters in your league (we need to see all teams to find realistic trade partners)'
                : 'Upload your roster and the opponent\'s roster (both teams involved in the trade)'}
            </p>
            <div
              {...getRootProps()}
              style={{
                border: isDragActive ? '2px solid #C9A84C' : '2px dashed #2a261e',
                padding: '60px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#1a1710' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <input {...getInputProps()} />
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#C9A84C',
                marginBottom: '8px',
                fontSize: '1.125rem',
              }}>
                {isDragActive ? 'Drop files here' : 'Drag & drop screenshots here'}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                or click to browse (PNG, JPG, WEBP - Max 10MB each)
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                {files.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      border: '1px solid #2a261e',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                    }}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b6457',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* League Settings */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              League Platform *
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
              }}
            >
              <option value="">Select platform</option>
              <option value="espn">ESPN</option>
              <option value="yahoo">Yahoo</option>
              <option value="sleeper">Sleeper</option>
              <option value="nfl">NFL.com</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              Scoring Type *
            </label>
            <select
              value={scoringType}
              onChange={(e) => setScoringType(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
              }}
            >
              <option value="">Select scoring</option>
              <option value="ppr">PPR (Point Per Reception)</option>
              <option value="half-ppr">Half PPR</option>
              <option value="standard">Standard</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              Roster Size
            </label>
            <input
              type="text"
              value={rosterSize}
              onChange={(e) => setRosterSize(e.target.value)}
              placeholder="e.g., 10 teams, 15 roster spots"
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              Additional Notes
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={
                requestType === 'trade_finder'
                  ? "What positions are you looking to upgrade? Are you rebuilding or competing? Any players you won't trade?"
                  : "Any context about your team's needs, playoff outlook, or concerns about this specific trade?"
              }
              rows={6}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || files.length === 0}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              width: '100%',
              padding: '20px',
              backgroundColor: uploading || files.length === 0 ? '#2a261e' : '#C9A84C',
              color: uploading || files.length === 0 ? '#6b6457' : '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '1rem',
              border: 'none',
              cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Submitting...' : 'Submit Trade Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
