import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roles || roles.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse request body
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Fetch submission details before deletion (for audit/logging)
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, user_id, service_type, status, expert_id')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Delete submission (CASCADE will handle submission_files, responses, ratings)
    const { error: deleteError } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      console.error('Error deleting submission:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete submission: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Log deletion to audit_log (submission_id will be NULL since submission was deleted)
    await supabase
      .from('audit_log')
      .insert({
        submission_id: null,
        user_id: user.id,
        action: 'submission_deleted',
        details: {
          deleted_submission_id: submissionId,
          deleted_by_admin: user.id,
          submission_user_id: submission.user_id,
          service_type: submission.service_type,
          status: submission.status,
          expert_id: submission.expert_id,
        },
      })

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
      deletedId: submissionId,
    })
  } catch (error) {
    console.error('Unexpected error deleting submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
