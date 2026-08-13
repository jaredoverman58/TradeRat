import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import SubmissionsTable from './SubmissionsTable'

export default async function SubmissionsTab() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Fetch all submissions with expert and league profile data
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      expert:experts(name),
      league_profile:league_profiles(
        league_name,
        platform
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch all experts for the filter dropdown
  const { data: experts } = await supabase
    .from('experts')
    .select('id, name')
    .order('name')

  // Fetch user emails for CSV export
  const { data: authUsers } = await adminClient.auth.admin.listUsers()
  const userEmailMap = new Map(
    authUsers?.users.map(user => [user.id, user.email || 'Unknown'])
  )

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '24px',
      }}>
        All Submissions ({submissions?.length || 0})
      </h2>

      <SubmissionsTable
        submissions={submissions || []}
        experts={experts || []}
        userEmailMap={Object.fromEntries(userEmailMap)}
      />
    </div>
  )
}
