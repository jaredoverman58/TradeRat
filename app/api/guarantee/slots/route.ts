import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client with service role to bypass RLS
// This endpoint is public (no auth required) - just returns marketing info
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch the current counter value
    const { data, error } = await supabase
      .from('guarantee_counter')
      .select('count')
      .eq('id', 1)
      .single()

    if (error || !data) {
      console.error('Error fetching guarantee counter:', error)
      return NextResponse.json(
        { error: 'Failed to fetch guarantee slots' },
        { status: 500 }
      )
    }

    const slotsRemaining = Math.max(0, 100 - data.count)

    // Bucket the remaining slots to nearest 10
    // Examples: 95 → "90+", 54 → "50+", 8 → "under 10", 100 → "100", 0 → "0"
    let bucketedSlots: string
    if (slotsRemaining === 0) {
      bucketedSlots = '0'
    } else if (slotsRemaining < 10) {
      bucketedSlots = 'under 10'
    } else if (slotsRemaining === 100) {
      bucketedSlots = '100'
    } else {
      // Round down to nearest 10
      const rounded = Math.floor(slotsRemaining / 10) * 10
      bucketedSlots = `${rounded}+`
    }

    return NextResponse.json({
      slotsRemaining,
      bucketedSlots,
      isAvailable: slotsRemaining > 0,
    })
  } catch (err) {
    console.error('Exception in guarantee slots endpoint:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
