import { createAdminClient } from '@/lib/supabase/server'
import AnalyticsExportButton from './AnalyticsExportButton'

export default async function AnalyticsTab() {
  const adminClient = createAdminClient()

  // Fetch all submissions
  const { data: submissions, error: submissionsError } = await adminClient
    .from('submissions')
    .select('service_type, created_at, delivered_at, status')

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  // Fetch all bundles
  const { data: bundles, error: bundlesError } = await adminClient
    .from('bundles')
    .select('bundle_type, purchased_at, credits_remaining')
    .order('purchased_at', { ascending: true })

  if (bundlesError) {
    console.error('Error fetching bundles:', bundlesError)
  }

  // Fetch all ratings
  const { data: ratings, error: ratingsError } = await adminClient
    .from('ratings')
    .select('thumbs_up, created_at')

  if (ratingsError) {
    console.error('Error fetching ratings:', ratingsError)
  }

  // Calculate daily submission counts by service type
  const dailySubmissions = submissions?.reduce((acc, sub) => {
    const date = new Date(sub.created_at).toLocaleDateString('en-US')
    if (!acc[date]) {
      acc[date] = { accept_decline: 0, counter_offer: 0, bundle: 0, trade_finder: 0 }
    }
    acc[date][sub.service_type] = (acc[date][sub.service_type] || 0) + 1
    return acc
  }, {} as Record<string, Record<string, number>>)

  // Calculate revenue over time
  const BUNDLE_PRICES: Record<string, number> = {
    'standard_3_pack': 12.99,
    'standard_5_pack': 19.99,
    'rat_rate_3_pack': 14.99,
    'rat_rate_5_pack': 24.99,
  }

  const revenueOverTime = bundles?.reduce((acc, bundle) => {
    const date = new Date(bundle.purchased_at).toLocaleDateString('en-US')
    const revenue = BUNDLE_PRICES[bundle.bundle_type] || 0
    acc[date] = (acc[date] || 0) + revenue
    return acc
  }, {} as Record<string, number>)

  // Calculate cumulative revenue
  let cumulativeRevenue = 0
  const cumulativeRevenueData = Object.entries(revenueOverTime || {})
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, revenue]) => {
      cumulativeRevenue += revenue
      return { date, revenue: cumulativeRevenue }
    })

  const totalRevenue = cumulativeRevenue

  // Calculate average response time (in hours)
  const completedSubmissions = submissions?.filter(sub => sub.delivered_at && sub.created_at) || []
  const responseTimes = completedSubmissions.map(sub => {
    const created = new Date(sub.created_at).getTime()
    const delivered = new Date(sub.delivered_at!).getTime()
    return (delivered - created) / (1000 * 60 * 60) // Convert to hours
  })
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0

  // Calculate rating trends
  const totalRatings = ratings?.length || 0
  const thumbsUpCount = ratings?.filter(r => r.thumbs_up).length || 0
  const thumbsUpPercentage = totalRatings > 0 ? (thumbsUpCount / totalRatings) * 100 : 0

  // Recent ratings trend (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentRatings = ratings?.filter(r => new Date(r.created_at) >= thirtyDaysAgo) || []
  const recentThumbsUp = recentRatings.filter(r => r.thumbs_up).length
  const recentThumbsUpPercentage = recentRatings.length > 0
    ? (recentThumbsUp / recentRatings.length) * 100
    : 0

  // Prepare data for CSV export
  const exportData = {
    ratings: ratings || [],
    responseTimes: completedSubmissions.map((sub, idx) => ({
      service_type: sub.service_type,
      created_at: sub.created_at,
      delivered_at: sub.delivered_at,
      response_time_hours: responseTimes[idx],
    })),
    averageResponseTime,
    thumbsUpPercentage,
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          margin: 0,
        }}>
          Analytics Dashboard
        </h2>
        <AnalyticsExportButton data={exportData} />
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          subtitle="All time"
          color="#C9A84C"
        />
        <StatCard
          title="Avg Response Time"
          value={`${averageResponseTime.toFixed(1)}h`}
          subtitle={`${completedSubmissions.length} completed`}
          color="#C9A84C"
        />
        <StatCard
          title="Thumbs Up Rate"
          value={`${thumbsUpPercentage.toFixed(1)}%`}
          subtitle={`${thumbsUpCount}/${totalRatings} ratings`}
          color="#C9A84C"
        />
        <StatCard
          title="Recent Satisfaction"
          value={`${recentThumbsUpPercentage.toFixed(1)}%`}
          subtitle="Last 30 days"
          color="#C9A84C"
        />
      </div>

      {/* Cumulative Revenue */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          Cumulative Revenue Over Time
        </h3>
        <div style={{
          border: '1px solid #2a261e',
          padding: '24px',
          backgroundColor: '#1a1710',
        }}>
          {cumulativeRevenueData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              {cumulativeRevenueData.slice(-10).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: idx < cumulativeRevenueData.slice(-10).length - 1 ? '1px solid #2a261e' : 'none',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#6b6457',
                  }}>
                    {item.date}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#C9A84C',
                  }}>
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#6b6457',
              textAlign: 'center',
            }}>
              No revenue data yet
            </p>
          )}
        </div>
      </div>

      {/* Daily Submissions by Service Type */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          Daily Submissions by Service Type
        </h3>
        <div style={{
          border: '1px solid #2a261e',
          backgroundColor: '#1a1710',
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a261e' }}>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Accept/Decline</th>
                <th style={tableHeaderStyle}>Counter Offer</th>
                <th style={tableHeaderStyle}>Bundle</th>
                <th style={tableHeaderStyle}>Trade Finder</th>
                <th style={tableHeaderStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailySubmissions || {})
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 10)
                .map(([date, counts]) => {
                  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
                  return (
                    <tr key={date} style={{ borderBottom: '1px solid #2a261e' }}>
                      <td style={tableCellStyle}>{date}</td>
                      <td style={tableCellStyle}>{counts.accept_decline || 0}</td>
                      <td style={tableCellStyle}>{counts.counter_offer || 0}</td>
                      <td style={tableCellStyle}>{counts.bundle || 0}</td>
                      <td style={tableCellStyle}>{counts.trade_finder || 0}</td>
                      <td style={{ ...tableCellStyle, fontWeight: 600, color: '#C9A84C' }}>{total}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          {(!dailySubmissions || Object.keys(dailySubmissions).length === 0) && (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#6b6457',
              }}>
                No submission data yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Breakdown */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '16px',
        }}>
          Rating Breakdown
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          <StatCard
            title="Total Ratings"
            value={totalRatings.toString()}
            subtitle="All time"
            color="#F2EDE4"
          />
          <StatCard
            title="Thumbs Up"
            value={thumbsUpCount.toString()}
            subtitle={`${thumbsUpPercentage.toFixed(1)}% positive`}
            color="#4a9f4a"
          />
          <StatCard
            title="Thumbs Down"
            value={(totalRatings - thumbsUpCount).toString()}
            subtitle={`${(100 - thumbsUpPercentage).toFixed(1)}% negative`}
            color="#8B0000"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string
  subtitle: string
  color: string
}) {
  return (
    <div style={{
      border: '1px solid #2a261e',
      padding: '32px 24px',
      backgroundColor: '#1a1710',
    }}>
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#6b6457',
        marginBottom: '12px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '2.5rem',
        fontWeight: 900,
        color: color,
        marginBottom: '8px',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
      }}>
        {subtitle}
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
