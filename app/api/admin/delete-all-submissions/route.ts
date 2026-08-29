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
    const { mode } = await request.json()

    // Preview mode: just return the count
    if (mode === 'preview') {
      const { count, error: countError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error fetching submissions count:', countError)
        return NextResponse.json(
          { error: `Failed to fetch count: ${countError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        preview: true,
        count: count || 0,
      })
    }

    // Confirm mode: actually delete all submissions
    if (mode === 'confirm') {
      // Fetch all submission IDs (explicit list, not blanket DELETE)
      const { data: allSubmissions, error: fetchError } = await supabase
        .from('submissions')
        .select('id')

      if (fetchError) {
        console.error('Error fetching submissions:', fetchError)
        return NextResponse.json(
          { error: `Failed to fetch submissions: ${fetchError.message}` },
          { status: 500 }
        )
      }

      const deleteCount = allSubmissions?.length || 0

      if (deleteCount === 0) {
        return NextResponse.json({
          success: true,
          deletedCount: 0,
          message: 'No submissions found to delete',
        })
      }

      const deleteIds = allSubmissions.map(s => s.id)

      // Delete using explicit ID list
      const { error: deleteError } = await supabase
        .from('submissions')
        .delete()
        .in('id', deleteIds)

      if (deleteError) {
        console.error('Error deleting all submissions:', deleteError)
        return NextResponse.json(
          { error: `Failed to delete submissions: ${deleteError.message}` },
          { status: 500 }
        )
      }

      // Log to audit_log
      await supabase
        .from('audit_log')
        .insert({
          submission_id: null,
          user_id: user.id,
          action: 'all_submissions_deleted',
          details: {
            deleted_by_admin: user.id,
            deleted_count: deleteCount,
            deleted_at: new Date().toISOString(),
          },
        })

      return NextResponse.json({
        success: true,
        deletedCount: deleteCount,
        message: `Successfully deleted ${deleteCount} submission${deleteCount !== 1 ? 's' : ''}`,
      })
    }

    return NextResponse.json({ error: 'Invalid mode parameter' }, { status: 400 })
  } catch (error) {
    console.error('Unexpected error in delete-all-submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
