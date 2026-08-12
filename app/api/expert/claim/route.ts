import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get form data
  const formData = await request.formData()
  const submissionId = formData.get('submission_id') as string
  const expertId = formData.get('expert_id') as string

  if (!submissionId || !expertId) {
    return NextResponse.json(
      { error: 'Missing submission_id or expert_id' },
      { status: 400 }
    )
  }

  // Verify the expert_id belongs to the logged-in user
  const { data: expert, error: expertError } = await supabase
    .from('experts')
    .select('id')
    .eq('id', expertId)
    .eq('user_id', user.id)
    .single()

  if (expertError || !expert) {
    return NextResponse.json(
      { error: 'Unauthorized: expert does not match user' },
      { status: 403 }
    )
  }

  // Claim the submission
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      expert_id: expertId,
      claimed_at: new Date().toISOString(),
      status: 'claimed'
    })
    .eq('id', submissionId)
    .eq('status', 'submitted')
    .is('expert_id', null)

  if (updateError) {
    console.error('Error claiming submission:', updateError)
    return NextResponse.json(
      { error: 'Failed to claim submission' },
      { status: 500 }
    )
  }

  // Redirect to the submission detail page
  return NextResponse.redirect(new URL(`/expert/submissions/${submissionId}`, request.url))
}
