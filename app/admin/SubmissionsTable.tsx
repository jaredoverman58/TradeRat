'use client'

import { useState } from 'react'
import SubmissionRow from './SubmissionRow'

type Submission = {
  id: string
  service_type: string
  rate_tier: string
  status: string
  expert_id: string | null
  created_at: string
  claimed_at: string | null
  expert: { name: string } | null
  league_profile: {
    league_name: string
    platform: string
  } | null
  offer_direction: string | null
  receive_players: string | null
  give_players: string | null
  receive_picks: string | null
  give_picks: string | null
  fab_receive: number | null
  fab_give: number | null
  additional_context: string | null
}

type Expert = {
  id: string
  name: string
}

export default function SubmissionsTable({
  submissions,
  experts,
}: {
  submissions: Submission[]
  experts: Expert[]
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expertFilter, setExpertFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Apply filters
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesExpert = expertFilter === 'all' ||
      (expertFilter === 'unclaimed' && !sub.expert_id) ||
      (sub.expert_id === expertFilter)
    return matchesStatus && matchesExpert
  })

  const formatServiceType = (serviceType: string) => {
    switch (serviceType) {
      case 'accept_decline': return 'Accept/Decline'
      case 'counter_offer': return 'Counter Offer'
      case 'bundle': return 'Bundle'
      case 'trade_finder': return 'Trade Finder'
      default: return serviceType
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'submitted': return 'Submitted'
      case 'claimed': return 'Claimed'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'passed_off': return 'Passed Off'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const shortenId = (id: string) => {
    return id.slice(0, 8)
  }

  return (
    <div>
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <label style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6b6457',
            display: 'block',
            marginBottom: '8px',
          }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 16px',
              backgroundColor: '#1a1710',
              color: '#F2EDE4',
              border: '1px solid #2a261e',
              fontSize: '0.875rem',
              cursor: 'pointer',
              minWidth: '180px',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="claimed">Claimed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6b6457',
            display: 'block',
            marginBottom: '8px',
          }}>
            Expert
          </label>
          <select
            value={expertFilter}
            onChange={(e) => setExpertFilter(e.target.value)}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 16px',
              backgroundColor: '#1a1710',
              color: '#F2EDE4',
              border: '1px solid #2a261e',
              fontSize: '0.875rem',
              cursor: 'pointer',
              minWidth: '180px',
            }}
          >
            <option value="all">All Experts</option>
            <option value="unclaimed">Unclaimed</option>
            {experts.map(expert => (
              <option key={expert.id} value={expert.id}>
                {expert.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        marginBottom: '16px',
      }}>
        Showing {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      {filteredSubmissions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 150px 120px 120px 150px 160px 160px',
            gap: '16px',
            padding: '16px 24px',
            borderBottom: '1px solid #2a261e',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              ID
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Service Type
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Rate Tier
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Status
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Expert
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Created At
            </div>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
            }}>
              Claimed At
            </div>
          </div>

          {/* Rows */}
          {filteredSubmissions.map(submission => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              isExpanded={expandedId === submission.id}
              onToggle={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
              formatServiceType={formatServiceType}
              formatStatus={formatStatus}
              formatDate={formatDate}
              shortenId={shortenId}
            />
          ))}
        </div>
      ) : (
        <div style={{
          border: '1px solid #2a261e',
          padding: '60px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            color: '#F2EDE4',
            marginBottom: '16px',
          }}>
            No submissions found
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
          }}>
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  )
}
