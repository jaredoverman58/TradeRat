import { checkCapacity } from '@/lib/capacity'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const capacity = await checkCapacity()
    return NextResponse.json(capacity)
  } catch (error) {
    console.error('Error checking capacity:', error)
    return NextResponse.json(
      { error: 'Failed to check capacity' },
      { status: 500 }
    )
  }
}
