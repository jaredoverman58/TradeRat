import { createClient } from '@/lib/supabase/server'

type SubmissionData = {
  status: string
  rate_tier: string
  expert_id: string | null
}

export default async function OverviewTab() {
  const supabase = await createClient()

  // Fetch submission counts by status
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('status, rate_tier, expert_id')
    .returns<SubmissionData[]>()

  // Calculate counts
  const totalSubmitted = allSubmissions?.filter(
    s => s.status === 'submitted'
  ).length || 0

  const totalClaimed = allSubmissions?.filter(
    s => s.status === 'claimed' || s.status === 'in_progress'
  ).length || 0

  const totalCompleted = allSubmissions?.filter(
    s => s.status === 'completed'
  ).length || 0

  const totalCancelled = allSubmissions?.filter(
    s => s.status === 'cancelled'
  ).length || 0

  // Break down submitted by rate_tier
  const submittedStandard = allSubmissions?.filter(
    s => s.status === 'submitted' && s.rate_tier === 'standard'
  ).length || 0

  const submittedRatRate = allSubmissions?.filter(
    s => s.status === 'submitted' && s.rate_tier === 'rat_rate'
  ).length || 0

  // Get active queue counts (claimed + in_progress)
  const activeRatRate = allSubmissions?.filter(
    s => (s.status === 'claimed' || s.status === 'in_progress') && s.rate_tier === 'rat_rate'
  ).length || 0

  const activeStandard = allSubmissions?.filter(
    s => (s.status === 'claimed' || s.status === 'in_progress') && s.rate_tier === 'standard'
  ).length || 0

  // Get waitlist counts (active waitlist entries)
  const { count: waitlistRatRate } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'rat_rate')
    .is('notified_at', null)
    .is('converted_at', null)
    .is('cancelled_at', null)

  const { count: waitlistStandard } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'standard')
    .is('notified_at', null)
    .is('converted_at', null)
    .is('cancelled_at', null)

  return (
    <div>
      {/* Main Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        <StatCard
          title="Total Submitted"
          value={totalSubmitted}
          subtitle="Unclaimed submissions"
          color="#C9A84C"
        />
        <StatCard
          title="Total Claimed"
          value={totalClaimed}
          subtitle="Claimed or in progress"
          color="#6b6457"
        />
        <StatCard
          title="Total Completed"
          value={totalCompleted}
          subtitle="Delivered to users"
          color="#6b6457"
        />
        <StatCard
          title="Total Cancelled"
          value={totalCancelled}
          subtitle="Cancelled submissions"
          color="#6b6457"
        />
      </div>

      {/* Waitlist & Queue Status */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '24px',
        }}>
          Waitlist &amp; Queue Status
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          <StatCard
            title="Rat Rate Queue"
            value={activeRatRate}
            subtitle={`${activeRatRate}/8 active submissions`}
            color="#C9A84C"
          />
          <StatCard
            title="Rat Rate Waitlist"
            value={waitlistRatRate || 0}
            subtitle="People waiting for Rat Rate"
            color="#F2EDE4"
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <StatCard
            title="Standard Queue"
            value={activeStandard}
            subtitle={`${activeStandard}/8 active submissions`}
            color="#C9A84C"
          />
          <StatCard
            title="Standard Waitlist"
            value={waitlistStandard || 0}
            subtitle="People waiting for Standard"
            color="#F2EDE4"
          />
        </div>
      </div>

      {/* Submitted Breakdown by Rate Tier */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#F2EDE4',
          marginBottom: '24px',
        }}>
          Submitted Queue Breakdown
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <StatCard
            title="Standard Rate"
            value={submittedStandard}
            subtitle="Standard tier submissions"
            color="#F2EDE4"
          />
          <StatCard
            title="Rat Rate"
            value={submittedRatRate}
            subtitle="Rat guaranteed submissions"
            color="#F2EDE4"
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
  value: number
  subtitle: string
  color: string
}) {
  return (
    <div style={{
      border: '1px solid #2a261e',
      padding: '32px 24px',
      backgroundColor: 'transparent',
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
        fontSize: '3rem',
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
