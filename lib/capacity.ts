import { createClient } from '@/lib/supabase/server'

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
  const supabase = await createClient()

  // Get The Rat expert (premium tier)
  const { data: ratExpert } = await supabase
    .from('experts')
    .select('id, is_available')
    .eq('tier', 'premium')
    .single()

  // Count active Rat Rate submissions
  let ratRateCount = 0
  if (ratExpert) {
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', ratExpert.id)
      .eq('rate_tier', 'rat_rate')
      .in('status', ['claimed', 'in_progress'])

    ratRateCount = count || 0
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
