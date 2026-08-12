import { createAdminClient } from '@/lib/supabase/server'

export default async function UsersTab() {
  const adminClient = createAdminClient()

  // Fetch all users with admin privileges
  const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers()

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  // Get all bundles (using admin client for full access)
  const { data: allBundles, error: bundlesError } = await adminClient
    .from('bundles')
    .select('user_id, bundle_type, credits_remaining')
    .gt('credits_remaining', 0)
    .gt('expires_at', new Date().toISOString())

  if (bundlesError) {
    console.error('Error fetching bundles:', bundlesError)
  }

  // Get all submissions count per user
  const { data: allSubmissions, error: submissionsError } = await adminClient
    .from('submissions')
    .select('user_id')

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  // Get all free evaluations
  const { data: allFreeEvals, error: freeEvalsError } = await adminClient
    .from('free_evaluations')
    .select('user_id, used')

  if (freeEvalsError) {
    console.error('Error fetching free evaluations:', freeEvalsError)
  }

  // Get all league profiles
  const { data: allLeagueProfiles, error: leagueProfilesError } = await adminClient
    .from('league_profiles')
    .select('user_id')

  if (leagueProfilesError) {
    console.error('Error fetching league profiles:', leagueProfilesError)
  }

  // Create user map with aggregated data
  const userDataMap = new Map()

  authUsers?.users.forEach(user => {
    // Count submissions
    const submissionCount = allSubmissions?.filter(s => s.user_id === user.id).length || 0

    // Get bundles
    const userBundles = allBundles?.filter(b => b.user_id === user.id) || []

    // Group bundles by type
    const standardEvalCredits = userBundles
      .filter(b => b.bundle_type === 'standard_3_pack' || b.bundle_type === 'standard_5_pack')
      .reduce((sum, b) => sum + b.credits_remaining, 0)

    const ratRateEvalCredits = userBundles
      .filter(b => b.bundle_type === 'rat_rate_3_pack' || b.bundle_type === 'rat_rate_5_pack')
      .reduce((sum, b) => sum + b.credits_remaining, 0)

    // Get free evaluation status
    const freeEval = allFreeEvals?.find(f => f.user_id === user.id)
    const freeEvalAvailable = freeEval ? !freeEval.used : false

    // Count league profiles
    const leagueProfilesCount = allLeagueProfiles?.filter(l => l.user_id === user.id).length || 0

    userDataMap.set(user.id, {
      email: user.email,
      submissionCount,
      standardEvalCredits,
      ratRateEvalCredits,
      freeEvalAvailable,
      leagueProfilesCount,
    })
  })

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '24px',
      }}>
        Users
      </h2>

      {/* Users Table */}
      <div style={{
        border: '1px solid #2a261e',
        backgroundColor: 'transparent',
        overflowX: 'auto',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid #2a261e',
              backgroundColor: '#1a1710',
            }}>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Submissions</th>
              <th style={tableHeaderStyle}>Standard Credits</th>
              <th style={tableHeaderStyle}>Rat Rate Credits</th>
              <th style={tableHeaderStyle}>Free Eval</th>
              <th style={tableHeaderStyle}>Leagues</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authUsers?.users.map(user => {
              const userData = userDataMap.get(user.id)
              if (!userData) return null

              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid #2a261e',
                  }}
                >
                  <td style={tableCellStyle}>{userData.email}</td>
                  <td style={tableCellStyle}>{userData.submissionCount}</td>
                  <td style={tableCellStyle}>{userData.standardEvalCredits}</td>
                  <td style={tableCellStyle}>{userData.ratRateEvalCredits}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      color: userData.freeEvalAvailable ? '#C9A84C' : '#6b6457',
                      fontWeight: userData.freeEvalAvailable ? 600 : 400,
                    }}>
                      {userData.freeEvalAvailable ? 'Available' : 'Used'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{userData.leagueProfilesCount}</td>
                  <td style={tableCellStyle}>
                    <a
                      href={`mailto:${userData.email}`}
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.875rem',
                        color: '#C9A84C',
                        textDecoration: 'none',
                        padding: '6px 12px',
                        border: '1px solid #C9A84C',
                        display: 'inline-block',
                      }}
                    >
                      Contact
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '24px',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
      }}>
        Total users: {authUsers?.users.length || 0}
      </div>
    </div>
  )
}

const tableHeaderStyle = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#6b6457',
  padding: '16px 12px',
  textAlign: 'left' as const,
  fontWeight: 600,
}

const tableCellStyle = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '0.875rem',
  color: '#F2EDE4',
  padding: '16px 12px',
}
