'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import WaitlistScreen from './WaitlistScreen'
import CreditSummary from './CreditSummary'
import BuyConfirmationModal from '@/components/BuyConfirmationModal'
import FreeEvaluationConfirmationModal from '@/components/FreeEvaluationConfirmationModal'
import { BUNDLES } from '@/lib/bundles'

type LeagueProfile = {
  id: string
  league_name: string
  platform: string
  scoring_format: string
  num_teams: number
  league_type: string
}

type SubmissionFile = {
  id: string              // Unique ID for tracking
  file: File
  label: string
  isOwnRoster: boolean
  filePath?: string       // Storage path once uploaded
  uploading?: boolean     // True while upload in progress
  uploadError?: string    // Error message if upload failed
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

  // Credit state (lifted from CreditSummary)
  interface CreditsByServiceType {
    accept_decline: number
    counter_offer: number
    bundle: number
    trade_finder: number
  }
  const [credits, setCredits] = useState<CreditsByServiceType | null>(null)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [hasFreeEval, setHasFreeEval] = useState(false)
  const [usingFreeEval, setUsingFreeEval] = useState(false)

  // Buy modal state
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showFreeEvalModal, setShowFreeEvalModal] = useState(false)
  const [pendingBundle, setPendingBundle] = useState<{
    serviceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
    tier: 'standard' | 'rat'
    price: number
    name: string
  } | null>(null)

  // Trade details form
  const [serviceType, setServiceType] = useState<'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'>('accept_decline')
  const [offerDirection, setOfferDirection] = useState<'received' | 'proposed'>('received')
  const [rateTier, setRateTier] = useState<'standard' | 'rat_rate'>('standard')
  const [receivePlayers, setReceivePlayers] = useState('')
  const [givePlayers, setGivePlayers] = useState('')
  const [receivePicks, setReceivePicks] = useState('')
  const [givePicks, setGivePicks] = useState('')
  const [fabReceive, setFabReceive] = useState('')
  const [fabGive, setFabGive] = useState('')
  const [tradeFinderContext, setTradeFinderContext] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [showPicks, setShowPicks] = useState(false)
  const [showFaab, setShowFaab] = useState(false)

  // SMS notification opt-in state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [smsOptIn, setSmsOptIn] = useState(false)

  // File upload state
  const [draftId] = useState(() => crypto.randomUUID()) // Stable draft ID for storage paths
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([])
  const [showRosterLabels, setShowRosterLabels] = useState(false)

  // Form state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [skipCreditCheckOnce, setSkipCreditCheckOnce] = useState(false)

  // Capacity and waitlist state
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [capacityStatus, setCapacityStatus] = useState<{
    ratRateAvailable: boolean
    standardAvailable: boolean
  } | null>(null)

  // Guard against double auto-submit
  const hasAutoSubmittedRef = useRef(false)

  // Load user and league profiles
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      // Allow viewing the form without login (for Twilio A2P approval - reviewers need to see opt-in consent)
      // Login will be required when actually submitting
      if (!user) {
        setLoading(false)
        setCreditsLoading(false)
        return
      }

      setUserId(user.id)

      // Fetch credits for this user
      const { data: bundles, error: bundlesError } = await supabase
        .from('bundles')
        .select('service_type, credits_remaining')
        .eq('user_id', user.id)
        .gt('credits_remaining', 0)
        .gt('expires_at', new Date().toISOString())

      if (bundlesError) {
        console.error('Error fetching credits:', bundlesError)
      } else {
        // Aggregate credits by service type
        const creditsByType: CreditsByServiceType = {
          accept_decline: 0,
          counter_offer: 0,
          bundle: 0,
          trade_finder: 0,
        }

        bundles?.forEach(bundle => {
          if (bundle.service_type in creditsByType) {
            creditsByType[bundle.service_type as keyof CreditsByServiceType] += bundle.credits_remaining
          }
        })

        setCredits(creditsByType)
      }

      // Fetch free evaluation status
      const { data: freeEval, error: freeEvalError } = await supabase
        .from('free_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (freeEvalError) {
        console.error('Error fetching free evaluation:', freeEvalError)
      } else {
        // Check if free eval is available (not used and not expired)
        const isFreeEvalAvailable = freeEval && !freeEval.used && (!freeEval.expires_at || new Date(freeEval.expires_at) > new Date())
        setHasFreeEval(isFreeEvalAvailable)
      }

      setCreditsLoading(false)

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

  // Auto-submit with credit check and retry logic
  const checkCreditsAndSubmit = async (attemptNumber = 1, maxAttempts = 3): Promise<void> => {
    try {
      // Re-fetch credits to confirm payment processed
      const { data: bundles, error: bundlesError } = await supabase
        .from('bundles')
        .select('service_type, credits_remaining')
        .eq('user_id', userId)
        .gt('credits_remaining', 0)
        .gt('expires_at', new Date().toISOString())

      if (bundlesError) throw bundlesError

      // Aggregate credits by type
      const creditsByType: CreditsByServiceType = {
        accept_decline: 0,
        counter_offer: 0,
        bundle: 0,
        trade_finder: 0,
      }

      bundles?.forEach(bundle => {
        if (bundle.service_type in creditsByType) {
          creditsByType[bundle.service_type as keyof CreditsByServiceType] += bundle.credits_remaining
        }
      })

      // Check if credit exists for the purchased service type
      const hasCredit = creditsByType[serviceType] > 0

      if (hasCredit) {
        // SUCCESS: Credit found, proceed with submission
        setSuccessMessage('Payment successful — submitting your trade evaluation...')
        setError(null)

        // Update local credits state
        setCredits(creditsByType)

        // Auto-submit
        await proceedWithSubmission()

        // Clear sessionStorage on successful submission
        sessionStorage.removeItem('pendingSubmission')

      } else if (attemptNumber < maxAttempts) {
        // RETRY: Credit not found yet, wait and try again
        setSuccessMessage(`Payment successful! Waiting for confirmation... (${attemptNumber}/${maxAttempts})`)

        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

        return checkCreditsAndSubmit(attemptNumber + 1, maxAttempts)

      } else {
        // GIVE UP: Max attempts reached, webhook likely delayed
        // Allow one manual retry without credit check since payment already succeeded
        setSkipCreditCheckOnce(true)
        setSuccessMessage('Payment received — your form is saved right here. Please wait a few seconds, then click Submit below to finish.')
        setSubmitting(false)
      }

    } catch (error) {
      console.error('Error during auto-submit:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  // Restore form data from sessionStorage (after login or checkout redirect)
  useEffect(() => {
    // Wait until initial data load is complete
    if (loading || creditsLoading) return

    const saved = sessionStorage.getItem('pendingSubmission')
    if (!saved) return

    // Guard against double-run
    if (hasAutoSubmittedRef.current) return

    try {
      const data = JSON.parse(saved)

      // Restore scalar fields
      if (data.selectedProfileId) setSelectedProfileId(data.selectedProfileId)
      if (data.serviceType) setServiceType(data.serviceType)
      if (data.offerDirection) setOfferDirection(data.offerDirection)
      if (data.rateTier) setRateTier(data.rateTier)
      setReceivePlayers(data.receivePlayers || '')
      setGivePlayers(data.givePlayers || '')
      setReceivePicks(data.receivePicks || '')
      setGivePicks(data.givePicks || '')
      setFabReceive(data.fabReceive || '')
      setFabGive(data.fabGive || '')
      setTradeFinderContext(data.tradeFinderContext || '')
      setAdditionalContext(data.additionalContext || '')
      setSmsOptIn(data.smsOptIn || false)
      setPhoneNumber(data.phoneNumber || '')

      // Restore files (create placeholder File objects with saved metadata)
      if (data.files && data.files.length > 0) {
        const restoredFiles = data.files
          .filter((f: any) => f.filePath) // Only restore successfully uploaded files
          .map((f: any) => ({
            id: f.id,
            file: new File([], f.fileName, { type: f.fileType || 'image/jpeg' }),
            label: f.label,
            isOwnRoster: f.isOwnRoster,
            filePath: f.filePath,
            uploading: false,
          }))
        setSubmissionFiles(restoredFiles)
      }

      // Check if coming from checkout or login redirect
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('purchase') === 'success') {
        // Mark as handled to prevent re-runs
        hasAutoSubmittedRef.current = true

        // Set initial success message
        setSuccessMessage('Payment successful! Processing your submission...')
        setError(null)
        setSubmitting(true)

        // Start auto-submit with retry logic
        checkCreditsAndSubmit()

      } else {
        // For login-redirect case (no auto-submit), clear immediately
        sessionStorage.removeItem('pendingSubmission')
      }
    } catch (error) {
      console.error('Failed to restore submission data:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, creditsLoading])

  // Handle URL parameters (free_eval=true or service=X&tier=Y)
  useEffect(() => {
    // Only apply URL params after credits have loaded
    if (creditsLoading) return

    // Read URL parameters from window.location
    const urlParams = new URLSearchParams(window.location.search)
    const freeEvalParam = urlParams.get('free_eval')
    const serviceParam = urlParams.get('service')
    const tierParam = urlParams.get('tier')

    // Handle free_eval=true parameter
    if (freeEvalParam === 'true' && hasFreeEval) {
      setUsingFreeEval(true)
      setServiceType('accept_decline')
    }
    // Handle service=X&tier=Y parameters from paid credit buttons
    else if (serviceParam && tierParam) {
      const validServiceTypes = ['accept_decline', 'counter_offer', 'bundle', 'trade_finder']
      const validTiers = ['standard', 'rat_rate']

      if (validServiceTypes.includes(serviceParam) && validTiers.includes(tierParam)) {
        const service = serviceParam as 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
        const tier = tierParam as 'standard' | 'rat_rate'

        // Only apply if user has credits for this service type
        if (credits && credits[service] > 0) {
          setServiceType(service)
          setRateTier(tier)
        }
      }
    }
  }, [creditsLoading, hasFreeEval, credits])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userId) {
      setError('Please sign in before uploading files')
      return
    }

    // Create entries with unique IDs and uploading status
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      label: '',
      isOwnRoster: false,
      uploading: true,
    }))

    setSubmissionFiles(prev => [...prev, ...newFiles])

    // Upload each file independently
    newFiles.forEach(async (fileEntry, i) => {
      try {
        const fileExt = fileEntry.file.name.split('.').pop()
        const fileName = `${userId}/${draftId}/${Date.now()}-${i}.${fileExt}`

        const { error } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, fileEntry.file)

        if (error) throw error

        // Success: update with filePath
        setSubmissionFiles(prev => prev.map(f =>
          f.id === fileEntry.id
            ? { ...f, uploading: false, filePath: fileName }
            : f
        ))
      } catch (error) {
        // Failure: update with error message
        setSubmissionFiles(prev => prev.map(f =>
          f.id === fileEntry.id
            ? { ...f, uploading: false, uploadError: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ))
      }
    })
  }, [userId, draftId, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (id: string) => {
    setSubmissionFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileLabel = (id: string, label: string) => {
    setSubmissionFiles(prev => prev.map(f => f.id === id ? { ...f, label } : f))
  }

  const updateFileIsOwnRoster = (id: string, isOwnRoster: boolean) => {
    setSubmissionFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, isOwnRoster }
      } else if (isOwnRoster) {
        // If checking this file, uncheck all others (radio button behavior)
        return { ...f, isOwnRoster: false }
      } else {
        // If unchecking, don't affect other files
        return f
      }
    }))
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) return

    // Validate required fields
    if (!leagueName.trim() || !platform || !scoringFormat || !leagueType) {
      setError('Please fill in all required league fields')
      return
    }

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

  // Check capacity before submission
  const checkCapacityBeforeSubmit = async () => {
    try {
      const response = await fetch('/api/capacity/check')
      if (!response.ok) throw new Error('Failed to check capacity')

      const capacity = await response.json()
      setCapacityStatus(capacity)

      // Check if selected tier is at capacity
      if (rateTier === 'rat_rate' && !capacity.ratRateAvailable) {
        setShowWaitlist(true)
        setSubmitting(false)
        return false
      }

      if (rateTier === 'standard' && !capacity.standardAvailable) {
        setShowWaitlist(true)
        setSubmitting(false)
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking capacity:', error)
      // If capacity check fails, allow submission to proceed
      return true
    }
  }

  const handleJoinWaitlist = async () => {
    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: rateTier,
          service_type: serviceType,
          draft_data: {
            selectedProfileId,
            offerDirection,
            receivePlayers,
            givePlayers,
            receivePicks,
            givePicks,
            fabReceive,
            fabGive,
            additionalContext,
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join waitlist')
      }

      // Redirect to success page
      router.push('/submit/success?waitlist=true')
    } catch (error) {
      throw error
    }
  }

  const handleSwitchToStandard = () => {
    setRateTier('standard')
    setShowWaitlist(false)
  }

  const handleCancelWaitlist = () => {
    setShowWaitlist(false)
    setSubmitting(false)
  }

  const proceedWithSubmission = async () => {
    try {
      // Step 0: Update user's phone number if SMS opt-in is enabled
      if (phoneNumber && smsOptIn) {
        const { error: phoneUpdateError } = await supabase
          .from('user_roles')
          .update({ phone_number: phoneNumber })
          .eq('user_id', userId)

        if (phoneUpdateError) {
          console.warn('Failed to update phone number:', phoneUpdateError)
        }
      }

      // Step 1: Create submission in draft status
      // For trade_finder, use tradeFinderContext; for all other service types, use additionalContext
      const contextValue = serviceType === 'trade_finder'
        ? (tradeFinderContext || null)
        : (additionalContext || null)

      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          league_profile_id: selectedProfileId || null,
          service_type: serviceType,
          offer_direction: serviceType === 'trade_finder' ? null : offerDirection,
          rate_tier: rateTier,
          status: 'draft',
          receive_players: receivePlayers || null,
          give_players: givePlayers || null,
          receive_picks: receivePicks || null,
          give_picks: givePicks || null,
          fab_receive: fabReceive ? parseFloat(fabReceive) : null,
          fab_give: fabGive ? parseFloat(fabGive) : null,
          additional_context: contextValue
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Step 2: Create submission_files records (files already uploaded on drop)
      for (const fileEntry of submissionFiles) {
        // Verify file was uploaded successfully
        if (!fileEntry.filePath) {
          throw new Error(`File ${fileEntry.file.name} was not uploaded successfully`)
        }

        const { error: fileRecordError } = await supabase
          .from('submission_files')
          .insert({
            submission_id: submission.id,
            file_url: fileEntry.filePath,  // Use pre-uploaded path
            file_type: fileEntry.file.type,
            label: fileEntry.label || null,
            is_own_roster: fileEntry.isOwnRoster
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
        if (updateError.message.includes('No available credits')) {
          throw new Error('No available credits for this submission. Please purchase a bundle first.')
        }
        throw updateError
      }

      // Success - clear any saved form data and redirect to confirmation
      sessionStorage.removeItem('pendingSubmission')
      router.push(`/submit/success?id=${submission.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  const handleFreeEvalConfirm = async () => {
    setShowFreeEvalModal(false)
    setError(null)
    setSubmitting(true)

    // Check capacity before proceeding
    const capacityOk = await checkCapacityBeforeSubmit()
    if (!capacityOk) {
      return
    }

    // Proceed with submission (database trigger will handle marking free_evaluations.used = true)
    await proceedWithSubmission()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Require login for actual submission
    if (!userId) {
      sessionStorage.setItem('pendingSubmission', JSON.stringify({
        selectedProfileId,
        serviceType,
        offerDirection,
        rateTier,
        receivePlayers,
        givePlayers,
        receivePicks,
        givePicks,
        fabReceive,
        fabGive,
        tradeFinderContext,
        additionalContext,
        smsOptIn,
        phoneNumber,
        files: submissionFiles.map(f => ({
          id: f.id,
          filePath: f.filePath || '',
          fileName: f.file.name,
          fileType: f.file.type,
          label: f.label,
          isOwnRoster: f.isOwnRoster
        }))
      }))
      router.push('/login?redirect=/submit')
      return
    }

    // FREE EVALUATION CHECK - handle before paid credit check
    if (usingFreeEval) {
      setShowFreeEvalModal(true)
      return
    }

    // PRE-SUBMISSION CREDIT CHECK
    // Skip credit check if user just completed payment and webhook is delayed
    if (skipCreditCheckOnce) {
      // Reset flag immediately - only bypass once
      setSkipCreditCheckOnce(false)
      // Proceed to submission - database-level check will catch if still no credit
    } else if (!credits || credits[serviceType] === 0) {
      // User doesn't have credits for this service type - show purchase modal
      const bundleInfo = getSingleBundleForServiceType(serviceType, rateTier)
      setPendingBundle(bundleInfo)
      setShowBuyModal(true)
      return
    }

    setError(null)

    // User HAS credits (or skipped check due to delayed webhook) - proceed with submission
    setSubmitting(true)

    // Check capacity before proceeding
    const capacityOk = await checkCapacityBeforeSubmit()
    if (!capacityOk) {
      return
    }

    await proceedWithSubmission()
  }

  // Helper: Map service type + rate tier to single-purchase bundle info
  function getSingleBundleForServiceType(
    svcType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder',
    tier: 'standard' | 'rat_rate'
  ) {
    const tierKey = tier === 'rat_rate' ? 'rat' : 'standard'

    // Map to BUNDLES constants
    if (svcType === 'accept_decline') {
      const bundle = tier === 'rat_rate' ? BUNDLES.ACCEPT_DECLINE_RAT_RATE : BUNDLES.ACCEPT_DECLINE_STANDARD
      return {
        serviceType: svcType,
        tier: tierKey as 'standard' | 'rat',
        price: bundle.price,
        name: bundle.name,
        bundleType: bundle.bundleType,
        credits: bundle.credits,
        description: bundle.description,
      }
    }

    if (svcType === 'counter_offer') {
      const bundle = tier === 'rat_rate' ? BUNDLES.COUNTER_OFFER_RAT_RATE : BUNDLES.COUNTER_OFFER_STANDARD
      return {
        serviceType: svcType,
        tier: tierKey as 'standard' | 'rat',
        price: bundle.price,
        name: bundle.name,
        bundleType: bundle.bundleType,
        credits: bundle.credits,
        description: bundle.description,
      }
    }

    if (svcType === 'bundle') {
      const bundle = tier === 'rat_rate' ? BUNDLES.ACCEPT_DECLINE_BONUS_RAT_RATE : BUNDLES.ACCEPT_DECLINE_BONUS_STANDARD
      return {
        serviceType: svcType,
        tier: tierKey as 'standard' | 'rat',
        price: bundle.price,
        name: bundle.name,
        bundleType: bundle.bundleType,
        credits: bundle.credits,
        description: bundle.description,
      }
    }

    // trade_finder
    if (svcType === 'trade_finder') {
      const bundle = tier === 'rat_rate' ? BUNDLES.TRADE_FINDER_RAT_RATE : BUNDLES.TRADE_FINDER_STANDARD
      return {
        serviceType: svcType,
        tier: tierKey as 'standard' | 'rat',
        price: bundle.price,
        name: bundle.name,
        bundleType: bundle.bundleType,
        credits: bundle.credits,
        description: bundle.description,
      }
    }

    // Fallback
    return {
      serviceType: svcType,
      tier: tierKey as 'standard' | 'rat',
      price: 4.99,
      name: 'Single Purchase',
      bundleType: 'standard_3_pack' as const,
      credits: 1,
      description: 'Single trade evaluation',
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm-sans)', color: '#C9A84C' }}>Loading...</div>
      </div>
    )
  }

  // Show waitlist screen if at capacity
  if (showWaitlist && capacityStatus) {
    return (
      <WaitlistScreen
        tier={rateTier}
        serviceType={serviceType}
        standardAvailable={capacityStatus.standardAvailable}
        onJoinWaitlist={handleJoinWaitlist}
        onSubmitWithStandard={rateTier === 'rat_rate' ? handleSwitchToStandard : undefined}
        onCancel={handleCancelWaitlist}
        standardPrice="$3.99"
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href={userId ? "/dashboard" : "/"}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to {userId ? 'Dashboard' : 'Home'}
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

        {!userId && (
          <div style={{
            backgroundColor: '#1a1710',
            border: '2px solid #C9A84C',
            padding: '20px',
            marginBottom: '32px',
            fontFamily: 'var(--font-dm-sans)',
          }}>
            <p style={{
              color: '#F2EDE4',
              fontSize: '0.875rem',
              marginBottom: '12px',
            }}>
              You can view this form to see how it works, but you&apos;ll need to{' '}
              <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                sign in
              </Link>
              {' '}or{' '}
              <Link href="/signup" style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                create an account
              </Link>
              {' '}to submit a trade evaluation request.
            </p>
          </div>
        )}

        {successMessage && (
          <div style={{
            backgroundColor: '#0a2a0a',
            border: '1px solid #44ff44',
            color: '#66ff66',
            padding: '16px',
            marginBottom: '32px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
          }}>
            {successMessage}
          </div>
        )}

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
          {/* Credit Summary - MUST BE FIRST */}
          <CreditSummary
            userId={userId}
            credits={credits}
            creditsLoading={creditsLoading}
            selectedServiceType={serviceType}
            onServiceTypeChange={setServiceType}
            hasFreeEval={hasFreeEval}
            usingFreeEval={usingFreeEval}
            onUsingFreeEvalChange={setUsingFreeEval}
          />

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
                  Select League * (Required)
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
                      League Name * (Required)
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

            {/* Offer Direction - hidden for Trade Finder */}
            {serviceType !== 'trade_finder' && (
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
            )}

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

            {/* Intro Text - only for non-Trade Finder services */}
            {serviceType !== 'trade_finder' && (
              <div style={{
                marginBottom: '32px',
                paddingTop: '32px',
                borderTop: '1px solid #2a261e',
              }}>
                <div style={{
                  backgroundColor: '#1a1710',
                  border: '1px solid #C9A84C',
                  padding: '20px',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#C9A84C',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    Every trade needs at least one item on each side — players, picks, or FAAB. Fill in what applies; leave the rest blank.
                  </p>
                </div>
              </div>
            )}

            {/* Trade Finder Context - only for Trade Finder, required */}
            {serviceType === 'trade_finder' && (
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
                  Tell Your Expert About Your Situation * (Required)
                </label>
                <textarea
                  value={tradeFinderContext}
                  onChange={(e) => setTradeFinderContext(e.target.value)}
                  placeholder="Include your team's needs — are you competing or rebuilding, which positions you're looking to upgrade — plus anything else that could help your expert find the best possible trade: previous trade discussions (and with whom), untouchable players on either side, or specific managers' trade tendencies."
                  rows={6}
                  required
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
            )}

            {/* Players - hidden for Trade Finder */}
            {serviceType !== 'trade_finder' && (
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
                      {serviceType === 'counter_offer' || serviceType === 'bundle'
                        ? "What They're Offering You (Players)"
                        : "You Receive (Players)"}
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
                      {serviceType === 'counter_offer' || serviceType === 'bundle'
                        ? "What They Want in Return (Players)"
                        : "You Give (Players)"}
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

                {/* Toggle Links */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  {!showPicks ? (
                    <button
                      type="button"
                      onClick={() => setShowPicks(true)}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#C9A84C',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      + Add Draft Picks
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPicks(false)
                        setReceivePicks('')
                        setGivePicks('')
                      }}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#C9A84C',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      − Remove Draft Picks
                    </button>
                  )}

                  {!showFaab ? (
                    <button
                      type="button"
                      onClick={() => setShowFaab(true)}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#C9A84C',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      + Add FAAB / Waiver Budget
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowFaab(false)
                        setFabReceive('')
                        setFabGive('')
                      }}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#C9A84C',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      − Remove FAAB / Waiver Budget
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Picks - conditional on showPicks, hidden for Trade Finder */}
            {serviceType !== 'trade_finder' && showPicks && (
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
                    {serviceType === 'counter_offer' || serviceType === 'bundle'
                      ? "What They're Offering You (Picks)"
                      : "You Receive (Picks)"}
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
                    {serviceType === 'counter_offer' || serviceType === 'bundle'
                      ? "What They Want in Return (Picks)"
                      : "You Give (Picks)"}
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
            )}

            {/* FAAB - conditional on showFaab, hidden for Trade Finder */}
            {serviceType !== 'trade_finder' && showFaab && (
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
                    {serviceType === 'counter_offer' || serviceType === 'bundle'
                      ? "What They're Offering You (FAAB/Waiver Budget)"
                      : "You Receive (FAAB/Waiver Budget)"}
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
                    {serviceType === 'counter_offer' || serviceType === 'bundle'
                      ? "What They Want in Return (FAAB/Waiver Budget)"
                      : "You Give (FAAB/Waiver Budget)"}
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
            )}
          </div>

          {/* Step 3: File Upload */}
          <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #2a261e' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '8px',
            }}>
              3. Upload Screenshots{' '}
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 400,
                color: serviceType === 'accept_decline' ? '#6b6457' : '#C9A84C',
              }}>
                {serviceType === 'accept_decline' ? '(Optional)' : '(Required)'}
              </span>
            </h2>
            <div style={{ marginBottom: '24px' }} />

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              {serviceType === 'trade_finder'
                ? "Upload a screenshot of every roster in your league, including your own. If team names aren't clearly shown in the screenshots, label each one so your expert knows which team is which."
                : "Upload screenshots of your roster and your opponent's roster. This helps the expert understand your team needs and provide better advice."}
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
                {/* Toggle for Trade Finder roster labels */}
                {serviceType === 'trade_finder' && !showRosterLabels && (
                  <button
                    type="button"
                    onClick={() => setShowRosterLabels(true)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: '#1a1710',
                      border: '2px solid #C9A84C',
                      color: '#C9A84C',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      marginBottom: '16px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2a261e'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a1710'
                    }}
                  >
                    Team names aren&apos;t clearly visible in my screenshots — let me label them
                  </button>
                )}

                {submissionFiles.map((fileEntry) => (
                  <div
                    key={fileEntry.id}
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
                      marginBottom: serviceType !== 'trade_finder' || showRosterLabels ? '12px' : '0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '0.875rem',
                          color: '#F2EDE4',
                        }}>
                          {fileEntry.file.name}
                        </span>
                        {fileEntry.uploading && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.75rem',
                            color: '#C9A84C',
                          }}>
                            Uploading...
                          </span>
                        )}
                        {fileEntry.uploadError && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.75rem',
                            color: '#ff6666',
                          }}>
                            {fileEntry.uploadError}
                          </span>
                        )}
                        {fileEntry.filePath && !fileEntry.uploading && (
                          <span style={{
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.75rem',
                            color: '#6b6457',
                          }}>
                            ✓ Uploaded
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileEntry.id)}
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

                    {/* Label input and checkbox - label hidden by default for Trade Finder */}
                    {(serviceType !== 'trade_finder' || showRosterLabels) ? (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={fileEntry.label}
                          onChange={(e) => updateFileLabel(fileEntry.id, e.target.value)}
                          placeholder={serviceType === 'trade_finder'
                            ? "e.g., 'Team Name' or 'Manager Name'"
                            : "Optional label (e.g., 'My Roster', 'Opponent Roster')"}
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

                        {(serviceType === 'trade_finder' || serviceType === 'counter_offer' || serviceType === 'bundle') && (
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
                              checked={fileEntry.isOwnRoster || false}
                              onChange={(e) => updateFileIsOwnRoster(fileEntry.id, e.target.checked)}
                              style={{ marginRight: '8px' }}
                            />
                            This is my roster
                          </label>
                        )}
                      </div>
                    ) : (
                      /* Trade Finder: show only checkbox when labels are hidden */
                      serviceType === 'trade_finder' && (
                        <div style={{ marginTop: '12px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-dm-sans)',
                            fontSize: '0.875rem',
                            color: '#F2EDE4',
                          }}>
                            <input
                              type="checkbox"
                              checked={fileEntry.isOwnRoster || false}
                              onChange={(e) => updateFileIsOwnRoster(fileEntry.id, e.target.checked)}
                              style={{ marginRight: '8px' }}
                            />
                            This is my roster
                          </label>
                        </div>
                      )
                    )}
                  </div>
                ))}

                {/* Progress indicator for Trade Finder */}
                {serviceType === 'trade_finder' && (() => {
                  // Use live form state if creating new profile, otherwise use selected saved profile's num_teams
                  const actualNumTeams = showNewProfileForm
                    ? numTeams
                    : (leagueProfiles.find(p => p.id === selectedProfileId)?.num_teams || 12)
                  return (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      backgroundColor: '#1a1710',
                      border: '1px solid #2a261e',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.875rem',
                      color: '#F2EDE4',
                    }}>
                      <strong>{submissionFiles.length} of {actualNumTeams} rosters uploaded</strong>
                      {submissionFiles.length < actualNumTeams && (
                        <span style={{ color: '#6b6457', marginLeft: '8px' }}>
                          ({actualNumTeams - submissionFiles.length} remaining)
                        </span>
                      )}
                    </div>
                  )
                })()}

              </div>
            )}
          </div>

          {/* Step 4: SMS Notifications (Optional) */}
          <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #2a261e' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginBottom: '24px',
            }}>
              4. SMS Notifications (Optional)
            </h2>

            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Get text message notifications when your trade analysis is ready. This is completely optional - you&apos;ll always receive email notifications.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '8px',
                display: 'block',
              }}>
                Phone Number {smsOptIn ? '*' : '(Optional)'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890 (include country code)"
                required={smsOptIn}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#0C0A07',
                  border: smsOptIn && !phoneNumber ? '1px solid #C9A84C' : '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                }}
              />
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                color: '#6b6457',
                marginTop: '8px',
              }}>
                Must include country code (e.g., +1 for US/Canada)
              </p>
            </div>

            <div style={{
              backgroundColor: '#1a1710',
              border: '1px solid #2a261e',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                <input
                  type="checkbox"
                  checked={smsOptIn || false}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  style={{
                    marginRight: '12px',
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <span style={{ lineHeight: '1.6' }}>
                  I agree to receive SMS notifications from Trade Rat about my trade analysis status. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. See our{' '}
                  <Link href="/privacy" target="_blank" style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/terms" target="_blank" style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>
            </div>
          </div>

          {/* Step 5: Additional Context - hidden for Trade Finder */}
          {serviceType !== 'trade_finder' && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '24px',
              }}>
                5. Additional Context
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
                Additional Context (Optional)
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
          )}

          {/* Turnaround Message */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            We know your trade window won&apos;t wait — we always aim to respond as quickly as possible.
          </p>

          {/* Submit Button */}
          {(() => {
            // Calculate actual team count for Trade Finder validation
            const actualNumTeams = showNewProfileForm
              ? numTeams
              : (leagueProfiles.find(p => p.id === selectedProfileId)?.num_teams || 12)

            // File upload validation
            const hasUploadingFiles = submissionFiles.some(f => f.uploading)
            const hasUploadErrors = submissionFiles.some(f => f.uploadError)
            const hasOwnRosterMarked = submissionFiles.some(f => f.isOwnRoster)

            // Trade details validation for non-Trade Finder services
            const hasReceiveItem = receivePlayers.trim() || receivePicks.trim() || (fabReceive && fabReceive.trim())
            const hasGiveItem = givePlayers.trim() || givePicks.trim() || (fabGive && fabGive.trim())
            const tradeDetailsInvalid = (serviceType !== 'trade_finder') && (!hasReceiveItem || !hasGiveItem)

            // Check if "This is my roster" is required but not marked
            const needsOwnRosterMarked = (serviceType === 'trade_finder' || serviceType === 'counter_offer' || serviceType === 'bundle') &&
                                         submissionFiles.length > 0 &&
                                         !hasOwnRosterMarked

            const isDisabled = Boolean(
              submitting ||
              hasUploadingFiles ||
              hasUploadErrors ||
              (userId && !selectedProfileId && !showNewProfileForm) ||
              (serviceType !== 'accept_decline' && submissionFiles.length === 0) ||
              (serviceType === 'trade_finder' && submissionFiles.length !== actualNumTeams) ||
              ((serviceType === 'trade_finder' || serviceType === 'counter_offer' || serviceType === 'bundle') && !hasOwnRosterMarked) ||
              (serviceType === 'trade_finder' && !tradeFinderContext.trim()) ||
              (smsOptIn && !phoneNumber) ||
              tradeDetailsInvalid
            )

            return (
              <>
                {/* Inline Validation Warning */}
                {needsOwnRosterMarked && (
                  <div style={{
                    backgroundColor: '#2a1a0a',
                    border: '1px solid #C9A84C',
                    color: '#C9A84C',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}>
                    Please mark which roster is yours before submitting
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    width: '100%',
                    padding: '20px',
                    backgroundColor: isDisabled ? '#2a261e' : '#C9A84C',
                    color: isDisabled ? '#6b6457' : '#0C0A07',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : !userId ? 'Sign In to Submit' : 'Submit Trade for Evaluation'}
                </button>
              </>
            )
          })()}
        </form>

        {/* Buy Confirmation Modal */}
        {showBuyModal && pendingBundle && (
          <BuyConfirmationModal
            variant="pricing"
            serviceType={pendingBundle.serviceType}
            tier={pendingBundle.tier}
            price={pendingBundle.price}
            credits={1}
            name={pendingBundle.name}
            onConfirm={async () => {
              setShowBuyModal(false)
              setSubmitting(true)
              setError(null)

              // Save form state before redirect to checkout
              sessionStorage.setItem('pendingSubmission', JSON.stringify({
                selectedProfileId,
                serviceType,
                offerDirection,
                rateTier,
                receivePlayers,
                givePlayers,
                receivePicks,
                givePicks,
                fabReceive,
                fabGive,
                tradeFinderContext,
                additionalContext,
                smsOptIn,
                phoneNumber,
                files: submissionFiles.map(f => ({
                  id: f.id,
                  filePath: f.filePath || '',
                  fileName: f.file.name,
                  fileType: f.file.type,
                  label: f.label,
                  isOwnRoster: f.isOwnRoster
                }))
              }))

              try {
                // Get full bundle info including bundleType, credits, description
                const bundleInfo = getSingleBundleForServiceType(pendingBundle.serviceType, pendingBundle.tier === 'rat' ? 'rat_rate' : 'standard')

                const response = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    bundle_type: bundleInfo.bundleType,
                    service_type: bundleInfo.serviceType,
                    credits: bundleInfo.credits,
                    price: Math.round(bundleInfo.price * 100), // Convert dollars to cents
                    name: bundleInfo.name,
                    description: bundleInfo.description,
                    return_to: 'submit',
                  }),
                })

                const data = await response.json()

                if (data.url) {
                  window.location.href = data.url
                } else {
                  setError('Failed to start checkout. Please try again.')
                  setSubmitting(false)
                }
              } catch (error) {
                console.error('Error starting checkout:', error)
                setError('Failed to start checkout. Please try again.')
                setSubmitting(false)
              }
            }}
            onCancel={() => setShowBuyModal(false)}
          />
        )}

        {/* Free Evaluation Confirmation Modal */}
        {showFreeEvalModal && (
          <FreeEvaluationConfirmationModal
            onConfirm={handleFreeEvalConfirm}
            onCancel={() => setShowFreeEvalModal(false)}
          />
        )}
      </div>
    </div>
  )
}
