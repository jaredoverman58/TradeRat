import { createAdminClient } from '@/lib/supabase/server'

type Bundle = {
  id: string
  user_id: string
  bundle_type: string
  credits_purchased: number
  credits_remaining: number
  purchased_at: string
  expires_at: string
}

// Bundle type to price mapping based on pricing page
const BUNDLE_PRICES: Record<string, number> = {
  'standard_3_pack': 12.99,
  'standard_5_pack': 19.99,
  'rat_rate_3_pack': 14.99,
  'rat_rate_5_pack': 24.99,
}

// Bundle type to total credits mapping
const BUNDLE_CREDITS: Record<string, number> = {
  'standard_3_pack': 3,
  'standard_5_pack': 5,
  'rat_rate_3_pack': 3,
  'rat_rate_5_pack': 5,
}

// Convert bundle_type to display name
const getBundleDisplayName = (bundleType: string): string => {
  const mapping: Record<string, string> = {
    'standard_3_pack': '3-Pack Standard',
    'standard_5_pack': '5-Pack Standard',
    'rat_rate_3_pack': '3-Pack Rat Rate',
    'rat_rate_5_pack': '5-Pack Rat Rate',
  }
  return mapping[bundleType] || bundleType
}

// Calculate bundle status
const getBundleStatus = (expiresAt: string, creditsRemaining: number): { status: string; color: string } => {
  const now = new Date()
  const expiry = new Date(expiresAt)

  if (creditsRemaining === 0) {
    return { status: 'Fully Used', color: '#6b6457' }
  }

  if (expiry < now) {
    return { status: 'Expired', color: '#8B0000' }
  }

  return { status: 'Active', color: '#C9A84C' }
}

export default async function PaymentsTab() {
  const adminClient = createAdminClient()

  // Fetch all bundles with user emails
  const { data: bundles, error: bundlesError } = await adminClient
    .from('bundles')
    .select('*')
    .order('purchased_at', { ascending: false })

  if (bundlesError) {
    console.error('Error fetching bundles:', bundlesError)
  }

  // Get user emails
  const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers()

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }
  const userEmailMap = new Map(
    authUsers?.users.map(user => [user.id, user.email || 'Unknown'])
  )

  // Calculate total revenue
  const totalRevenue = bundles?.reduce((sum, bundle) => {
    return sum + (BUNDLE_PRICES[bundle.bundle_type] || 0)
  }, 0) || 0

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          margin: 0,
        }}>
          Payments & Bundles
        </h2>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          color: '#6b6457',
        }}>
          Total Revenue: <span style={{ color: '#C9A84C', fontWeight: 700 }}>${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Payments Table */}
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
              <th style={tableHeaderStyle}>Purchase Date</th>
              <th style={tableHeaderStyle}>User Email</th>
              <th style={tableHeaderStyle}>Bundle Type</th>
              <th style={tableHeaderStyle}>Amount</th>
              <th style={tableHeaderStyle}>Credits (Used/Total)</th>
              <th style={tableHeaderStyle}>Expires</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bundles?.map(bundle => {
              const userEmail = userEmailMap.get(bundle.user_id) || 'Unknown'
              const purchaseDate = new Date(bundle.purchased_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              const expiryDate = new Date(bundle.expires_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              const price = BUNDLE_PRICES[bundle.bundle_type] || 0
              const totalCredits = BUNDLE_CREDITS[bundle.bundle_type] || 0
              const creditsUsed = totalCredits - bundle.credits_remaining
              const { status, color } = getBundleStatus(bundle.expires_at, bundle.credits_remaining)

              return (
                <tr
                  key={bundle.id}
                  style={{
                    borderBottom: '1px solid #2a261e',
                  }}
                >
                  <td style={tableCellStyle}>{purchaseDate}</td>
                  <td style={tableCellStyle}>{userEmail}</td>
                  <td style={tableCellStyle}>{getBundleDisplayName(bundle.bundle_type)}</td>
                  <td style={{...tableCellStyle, color: '#C9A84C', fontWeight: 600}}>
                    ${price.toFixed(2)}
                  </td>
                  <td style={tableCellStyle}>
                    {creditsUsed}/{totalCredits}
                  </td>
                  <td style={tableCellStyle}>{expiryDate}</td>
                  <td style={{...tableCellStyle, color, fontWeight: 600}}>
                    {status}
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
        Total transactions: {bundles?.length || 0}
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
