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
    const { confirmDelete } = await request.json()

    // Step 1: Query ONLY submissions matching test markers
    const { data: testSubmissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, additional_context, user_id, service_type, status')
      .or('additional_context.ilike.%Created via bulk seeder%,additional_context.ilike.%Created via admin dev tools%')

    if (fetchError) {
      console.error('Error fetching test submissions:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch test submissions: ${fetchError.message}` },
        { status: 500 }
      )
    }

    // Step 2: Triple-verify every single row before deletion
    const safeToDelete = (testSubmissions || []).filter(sub => {
      const context = sub.additional_context || ''
      return context.includes('Created via bulk seeder') ||
             context.includes('Created via admin dev tools')
    })

    const deleteCount = safeToDelete.length

    // If confirmDelete is false, just return the count (preview mode)
    if (!confirmDelete) {
      return NextResponse.json({
        preview: true,
        count: deleteCount,
      })
    }

    // Step 3: ONLY delete IDs from safeToDelete array (never a blanket DELETE)
    if (deleteCount === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No test submissions found to delete',
      })
    }

    const deleteIds = safeToDelete.map(s => s.id)

    const { error: deleteError } = await supabase
      .from('submissions')
      .delete()
      .in('id', deleteIds)

    if (deleteError) {
      console.error('Error deleting test submissions:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete test submissions: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Log bulk deletion to audit_log
    await supabase
      .from('audit_log')
      .insert({
        submission_id: null,
        user_id: user.id,
        action: 'test_submissions_bulk_deleted',
        details: {
          deleted_by_admin: user.id,
          deleted_count: deleteCount,
          deleted_ids: deleteIds,
        },
      })

    return NextResponse.json({
      success: true,
      deletedCount: deleteCount,
      message: `Successfully deleted ${deleteCount} test submission${deleteCount !== 1 ? 's' : ''}`,
    })
  } catch (error) {
    console.error('Unexpected error deleting test submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
