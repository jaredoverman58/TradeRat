import { createClient } from '@supabase/supabase-js'
import { processExpiredSpots } from './waitlist-notify'

export type CapacityStatus = {
  ratRateAvailable: boolean
  standardAvailable: boolean
  ratRateCount: number
  standardCount: number
}

/**
 * Check current expert capacity
 *
 * Rat Rate is at capacity when The Rat has 8+ active (claimed/in_progress) Rat Rate submissions
 * Standard is at capacity when:
 *   - All standard experts combined have 8+ active (claimed/in_progress) standard submissions, OR
 *   - All standard experts have toggled themselves unavailable
 */
export async function checkCapacity(): Promise<CapacityStatus> {
  // Process expired waitlist spots first
  try {
    await processExpiredSpots()
  } catch (error) {
    console.error('Error processing expired spots:', error)
    // Continue with capacity check even if this fails
  }

  // Use service role client to bypass RLS (capacity check needs to count all submissions)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Get The Rat expert (premium tier)
  const { data: ratExpert, error: ratExpertError } = await supabase
    .from('experts')
    .select('id, is_available')
    .eq('tier', 'premium')
    .single()

  if (ratExpertError) {
    console.error('Error fetching Rat expert:', ratExpertError)
  }

  // Count active Rat Rate submissions
  let ratRateCount = 0
  if (ratExpert) {
    console.log('Counting Rat Rate submissions for expert ID:', ratExpert.id)
    const { count, error: countError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', ratExpert.id)
      .eq('rate_tier', 'rat_rate')
      .in('status', ['claimed', 'in_progress'])

    if (countError) {
      console.error('Error counting Rat Rate submissions:', countError)
    }

    ratRateCount = count || 0
    console.log('Rat Rate count:', ratRateCount)
  } else {
    console.log('No Rat expert found')
  }

  // Rat Rate is available if count < 8
  const ratRateAvailable = ratRateCount < 8

  // Get all standard tier experts
  const { data: standardExperts } = await supabase
    .from('experts')
    .select('id, is_available')
    .eq('tier', 'standard')

  // Check if ALL standard experts are unavailable
  const allStandardUnavailable = standardExperts?.every(e => !e.is_available) ?? true

  // Count active standard submissions across all standard experts
  let standardCount = 0
  if (standardExperts && standardExperts.length > 0) {
    const expertIds = standardExperts.map(e => e.id)

    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('expert_id', expertIds)
      .eq('rate_tier', 'standard')
      .in('status', ['claimed', 'in_progress'])

    standardCount = count || 0
  }

  // Standard is available if count < 8 AND not all experts unavailable
  const standardAvailable = standardCount < 8 && !allStandardUnavailable

  return {
    ratRateAvailable,
    standardAvailable,
    ratRateCount,
    standardCount
  }
}
