'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

type LeagueProfile = {
  id: string
  league_name: string
  platform: string
  scoring_format: string
  num_teams: number
  league_type: string
}

type SubmissionFile = {
  file: File
  label: string
  isOwnRoster: boolean
}

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()

  // User state
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // League profile state
  const [leagueProfiles, setLeagueProfiles] = useState<LeagueProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [showNewProfileForm, setShowNewProfileForm] = useState(false)

  // New profile form
  const [leagueName, setLeagueName] = useState('')
  const [platform, setPlatform] = useState('')
  const [scoringFormat, setScoringFormat] = useState('')
  const [numTeams, setNumTeams] = useState<number>(12)
  const [leagueType, setLeagueType] = useState('')

  // Trade details form
  const [offerDirection, setOfferDirection] = useState<'received' | 'proposed'>('received')
  const [rateTier, setRateTier] = useState<'standard' | 'rat_rate'>('standard')
  const [receivePlayers, setReceivePlayers] = useState('')
  const [givePlayers, setGivePlayers] = useState('')
  const [receivePicks, setReceivePicks] = useState('')
  const [givePicks, setGivePicks] = useState('')
  const [fabReceive, setFabReceive] = useState('')
  const [fabGive, setFabGive] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  // File upload state
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([])

  // Form state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user and league profiles
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Load league profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('league_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error loading league profiles:', profilesError)
      } else if (profiles) {
        setLeagueProfiles(profiles)
        if (profiles.length === 0) {
          setShowNewProfileForm(true)
        } else {
          setSelectedProfileId(profiles[0].id)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      label: '',
      isOwnRoster: false
    }))
    setSubmissionFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateFileLabel = (index: number, label: string) => {
    setSubmissionFiles(prev => prev.map((f, i) => i === index ? { ...f, label } : f))
  }

  const updateFileIsOwnRoster = (index: number, isOwnRoster: boolean) => {
    setSubmissionFiles(prev => prev.map((f, i) => i === index ? { ...f, isOwnRoster } : f))
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) return

    setError(null)

    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('league_profiles')
        .insert({
          user_id: userId,
          league_name: leagueName,
          platform: platform as any,
          scoring_format: scoringFormat as any,
          num_teams: numTeams,
          league_type: leagueType as any
        })
        .select()
        .single()

      if (insertError) throw insertError

      setLeagueProfiles([newProfile, ...leagueProfiles])
      setSelectedProfileId(newProfile.id)
      setShowNewProfileForm(false)

      // Clear form
      setLeagueName('')
      setPlatform('')
      setScoringFormat('')
      setNumTeams(12)
      setLeagueType('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create league profile')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      router.push('/login')
      return
    }

    if (!selectedProfileId && !showNewProfileForm) {
      setError('Please select or create a league profile')
      return
    }

    if (submissionFiles.length === 0) {
      setError('Please upload at least one screenshot')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      // Step 1: Create submission in draft status
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          league_profile_id: selectedProfileId || null,
          service_type: 'accept_decline',
          offer_direction: offerDirection,
          rate_tier: rateTier,
          status: 'draft',
          receive_players: receivePlayers || null,
          give_players: givePlayers || null,
          receive_picks: receivePicks || null,
          give_picks: givePicks || null,
          fab_receive: fabReceive ? parseFloat(fabReceive) : null,
          fab_give: fabGive ? parseFloat(fabGive) : null,
          additional_context: additionalContext || null
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Step 2: Upload files and create submission_files records
      for (let i = 0; i < submissionFiles.length; i++) {
        const { file, label, isOwnRoster } = submissionFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${submission.id}/${Date.now()}-${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, file)

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        // Store the file path (not URL) in the database
        // Signed URLs will be generated when viewing the file
        const { error: fileRecordError } = await supabase
          .from('submission_files')
          .insert({
            submission_id: submission.id,
            file_url: fileName, // Store path instead of URL
            file_type: file.type,
            label: label || null,
            is_own_roster: isOwnRoster
          })

        if (fileRecordError) {
          throw new Error(`Failed to save file record: ${fileRecordError.message}`)
        }
      }

      // Step 3: Update submission status to 'submitted' - this triggers credit consumption
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'submitted' })
        .eq('id', submission.id)

      if (updateError) {
        // Check for the specific credit error from the trigger
        if (updateError.message.includes('No available credits')) {
          throw new Error('No available credits for this submission. Please purchase a bundle first.')
        }
        throw updateError
      }

      // Success - redirect to confirmation
      router.push(`/submit/success?id=${submission.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm-sans)', color: '#C9A84C' }}>Loading...</div>
      </div>
    )
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
            Submit Trade Evaluation
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            marginTop: '16px',
          }}>
            Get expert analysis on whether to accept or decline your trade offer
          </p>
        </div>

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
            {error.includes('No available credits') && (
              <div style={{ marginTop: '12px' }}>
                <Link href="/pricing" style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                  View Pricing & Purchase Credits
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: League Profile */}
          <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #2a261e' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              1. League Information
            </h2>

            {leagueProfiles.length > 0 && !showNewProfileForm ? (
              <>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '16px',
                  display: 'block',
                }}>
                  Select League *
                </label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#0C0A07',
                    border: '1px solid #2a261e',
                    color: '#F2EDE4',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    marginBottom: '16px',
                  }}
                >
                  {leagueProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.league_name} ({profile.platform} • {profile.scoring_format} • {profile.num_teams} teams)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewProfileForm(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C9A84C',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    textDecoration: 'underline',
                  }}
                >
                  + Create New League Profile
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#F2EDE4',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      League Name *
                    </label>
                    <input
                      type="text"
                      value={leagueName}
                      onChange={(e) => setLeagueName(e.target.value)}
                      required={showNewProfileForm}
                      placeholder="e.g., Main League 2024"
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

                  <div>
                    <label style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#F2EDE4',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      Platform *
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      required={showNewProfileForm}
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
                      <option value="ESPN">ESPN</option>
                      <option value="Sleeper">Sleeper</option>
                      <option value="Yahoo">Yahoo</option>
                      <option value="Fantrax">Fantrax</option>
                      <option value="NFL.com">NFL.com</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#F2EDE4',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      Scoring Format *
                    </label>
                    <select
                      value={scoringFormat}
                      onChange={(e) => setScoringFormat(e.target.value)}
                      required={showNewProfileForm}
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
                      <option value="PPR">PPR</option>
                      <option value="Half-PPR">Half-PPR</option>
                      <option value="Standard">Standard</option>
                      <option value="TE Premium">TE Premium</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#F2EDE4',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      # of Teams *
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="32"
                      value={numTeams}
                      onChange={(e) => setNumTeams(parseInt(e.target.value))}
                      required={showNewProfileForm}
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

                  <div>
                    <label style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#F2EDE4',
                      marginBottom: '8px',
                      display: 'block',
                    }}>
                      League Type *
                    </label>
                    <select
                      value={leagueType}
                      onChange={(e) => setLeagueType(e.target.value)}
                      required={showNewProfileForm}
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
                      <option value="">Select type</option>
                      <option value="Redraft">Redraft</option>
                      <option value="Keeper">Keeper</option>
                      <option value="Dynasty">Dynasty</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {leagueProfiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProfileForm(false)
                      setSelectedProfileId(leagueProfiles[0].id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C9A84C',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      textDecoration: 'underline',
                    }}
                  >
                    ← Use Existing League Profile
                  </button>
                )}

                {showNewProfileForm && (
                  <button
                    type="button"
                    onClick={handleCreateProfile}
                    style={{
                      marginTop: '16px',
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '12px 24px',
                      backgroundColor: '#2a261e',
                      color: '#C9A84C',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Save League Profile
                  </button>
                )}
              </>
            )}
          </div>

          {/* Step 2: Trade Details */}
          <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #2a261e' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              2. Trade Details
            </h2>

            {/* Offer Direction */}
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
                Who Proposed This Trade? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                  onClick={() => setOfferDirection('received')}
                  style={{
                    border: offerDirection === 'received' ? '2px solid #C9A84C' : '2px solid #2a261e',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: offerDirection === 'received' ? '#1a1710' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: offerDirection === 'received' ? '6px solid #C9A84C' : '2px solid #2a261e',
                    marginRight: '12px',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    I received this offer
                  </span>
                </div>

                <div
                  onClick={() => setOfferDirection('proposed')}
                  style={{
                    border: offerDirection === 'proposed' ? '2px solid #C9A84C' : '2px solid #2a261e',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: offerDirection === 'proposed' ? '#1a1710' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: offerDirection === 'proposed' ? '6px solid #C9A84C' : '2px solid #2a261e',
                    marginRight: '12px',
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                  }}>
                    I&apos;m proposing this offer
                  </span>
                </div>
              </div>
            </div>

            {/* Rate Tier */}
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
                Expert Tier *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div
                  onClick={() => setRateTier('standard')}
                  style={{
                    border: rateTier === 'standard' ? '2px solid #C9A84C' : '2px solid #2a261e',
                    padding: '20px',
                    cursor: 'pointer',
                    backgroundColor: rateTier === 'standard' ? '#1a1710' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: rateTier === 'standard' ? '6px solid #C9A84C' : '2px solid #2a261e',
                      marginRight: '12px',
                    }} />
                    <h3 style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#F2EDE4',
                      margin: 0,
                    }}>
                      Standard
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    margin: 0,
                    paddingLeft: '32px',
                  }}>
                    Any available expert
                  </p>
                </div>

                <div
                  onClick={() => setRateTier('rat_rate')}
                  style={{
                    border: rateTier === 'rat_rate' ? '2px solid #C9A84C' : '2px solid #2a261e',
                    padding: '20px',
                    cursor: 'pointer',
                    backgroundColor: rateTier === 'rat_rate' ? '#1a1710' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: rateTier === 'rat_rate' ? '6px solid #C9A84C' : '2px solid #2a261e',
                      marginRight: '12px',
                    }} />
                    <h3 style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#F2EDE4',
                      margin: 0,
                    }}>
                      Rat Rate
                    </h3>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                    margin: 0,
                    paddingLeft: '32px',
                  }}>
                    The Trade Rat (Premium)
                  </p>
                </div>
              </div>
            </div>

            {/* Players */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Receive (Players)
                </label>
                <textarea
                  value={receivePlayers}
                  onChange={(e) => setReceivePlayers(e.target.value)}
                  placeholder="e.g., Christian McCaffrey, Davante Adams"
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
              </div>

              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Give (Players)
                </label>
                <textarea
                  value={givePlayers}
                  onChange={(e) => setGivePlayers(e.target.value)}
                  placeholder="e.g., Justin Jefferson, Joe Mixon"
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
              </div>
            </div>

            {/* Picks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Receive (Picks)
                </label>
                <textarea
                  value={receivePicks}
                  onChange={(e) => setReceivePicks(e.target.value)}
                  placeholder="e.g., 2025 1st Round, 2026 3rd Round"
                  rows={2}
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

              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Give (Picks)
                </label>
                <textarea
                  value={givePicks}
                  onChange={(e) => setGivePicks(e.target.value)}
                  placeholder="e.g., 2025 2nd Round"
                  rows={2}
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
            </div>

            {/* FAAB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Receive (FAAB/Waiver Budget)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fabReceive}
                  onChange={(e) => setFabReceive(e.target.value)}
                  placeholder="$0.00"
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

              <div>
                <label style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F2EDE4',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  You Give (FAAB/Waiver Budget)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fabGive}
                  onChange={(e) => setFabGive(e.target.value)}
                  placeholder="$0.00"
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
            </div>
          </div>

          {/* Step 3: File Upload */}
          <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #2a261e' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              3. Upload Screenshots
            </h2>

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Upload screenshots of your roster and your opponent&apos;s roster. This helps the expert understand your team needs and provide better advice.
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
                marginBottom: '24px',
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
            {submissionFiles.length > 0 && (
              <div>
                {submissionFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      border: '1px solid #2a261e',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                      }}>
                        {file.file.name}
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

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={file.label}
                        onChange={(e) => updateFileLabel(index, e.target.value)}
                        placeholder="Optional label (e.g., 'My Roster', 'Opponent Roster')"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          backgroundColor: '#0C0A07',
                          border: '1px solid #2a261e',
                          color: '#F2EDE4',
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '0.875rem',
                        }}
                      />

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#F2EDE4',
                        whiteSpace: 'nowrap',
                      }}>
                        <input
                          type="checkbox"
                          checked={file.isOwnRoster}
                          onChange={(e) => updateFileIsOwnRoster(index, e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        This is my roster
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Additional Context */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              4. Additional Context
            </h2>

            <label style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F2EDE4',
              marginBottom: '16px',
              display: 'block',
            }}>
              Anything Else the Expert Should Know?
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Tell us about your team's needs, playoff outlook, concerns about this specific trade, or anything else that might help the expert provide better advice."
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || submissionFiles.length === 0 || (!selectedProfileId && !showNewProfileForm)}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              width: '100%',
              padding: '20px',
              backgroundColor: submitting || submissionFiles.length === 0 ? '#2a261e' : '#C9A84C',
              color: submitting || submissionFiles.length === 0 ? '#6b6457' : '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '1rem',
              border: 'none',
              cursor: submitting || submissionFiles.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Trade for Evaluation'}
          </button>
        </form>
      </div>
    </div>
  )
}
