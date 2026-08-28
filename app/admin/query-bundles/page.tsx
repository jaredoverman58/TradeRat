import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function QueryBundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!userRole || userRole.role !== 'admin') {
    redirect('/dashboard')
  }

  // Determine which user to query: URL param or current user
  const targetUserId = params.userId || user.id

  // Get target user's email if querying someone else
  let targetUserEmail = user.email
  if (params.userId && params.userId !== user.id) {
    const adminClient = createAdminClient()
    const { data: targetUser } = await adminClient.auth.admin.getUserById(params.userId)
    targetUserEmail = targetUser?.user?.email || 'Unknown'
  }

  // Query bundles for the target user
  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', targetUserId)
    .order('purchased_at', { ascending: false })
    .limit(3)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2rem',
          fontWeight: 900,
          color: '#F2EDE4',
          marginBottom: '24px',
        }}>
          Bundles Query
        </h1>

        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginBottom: '32px',
        }}>
          <p><strong>Querying User ID:</strong> {targetUserId}</p>
          <p><strong>Email:</strong> {targetUserEmail}</p>
          <p><strong>Bundles Shown (limit 3):</strong> {bundles?.length || 0}</p>
          {params.userId && params.userId !== user.id && (
            <p style={{ color: '#C9A84C', marginTop: '8px' }}>
              ℹ️ Viewing another user&apos;s bundles (not your own)
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#2a0a0a',
            border: '1px solid #ff4444',
            color: '#ff6666',
            padding: '16px',
            marginBottom: '24px',
          }}>
            Error: {error.message}
          </div>
        )}

        {bundles && bundles.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1710', borderBottom: '2px solid #2a261e' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>Bundle Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>Service Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>Credits</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>Purchased At</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#C9A84C' }}>Expires At</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle: any, idx: number) => (
                  <tr
                    key={bundle.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#0C0A07' : '#1a1710',
                      borderBottom: '1px solid #2a261e',
                    }}
                  >
                    <td style={{ padding: '12px', color: '#F2EDE4', fontSize: '0.7rem' }}>
                      {bundle.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '12px', color: '#F2EDE4' }}>{bundle.bundle_type}</td>
                    <td style={{ padding: '12px', color: '#F2EDE4' }}>{bundle.service_type}</td>
                    <td style={{ padding: '12px', color: '#F2EDE4', fontWeight: 600 }}>
                      {bundle.credits_remaining}
                    </td>
                    <td style={{ padding: '12px', color: '#6b6457', fontSize: '0.7rem' }}>
                      {new Date(bundle.purchased_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: '#6b6457', fontSize: '0.7rem' }}>
                      {new Date(bundle.expires_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bundles && bundles.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b6457',
            fontFamily: 'var(--font-dm-sans)',
          }}>
            No bundles found for this user.
          </div>
        )}

        <div style={{ marginTop: '32px' }}>
          <a
            href="/admin?tab=dev-tools"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              display: 'inline-block',
            }}
          >
            ← Back to Dev Tools
          </a>
        </div>
      </div>
    </div>
  )
}
