'use client'

import { useState } from 'react'
import SubmissionRow from './SubmissionRow'
import { arrayToCSV, downloadCSV, getDateString } from '@/lib/csvExport'

type Submission = {
  id: string
  user_id: string
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
  audio_transcript?: string | null // Future: Whisper transcription
}

type Expert = {
  id: string
  name: string
}

export default function SubmissionsTable({
  submissions,
  experts,
  userEmailMap,
}: {
  submissions: Submission[]
  experts: Expert[]
  userEmailMap: Record<string, string>
}) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expertFilter, setExpertFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Format helper functions (defined before use)
  function formatServiceType(serviceType: string) {
    switch (serviceType) {
      case 'accept_decline': return 'Accept/Decline'
      case 'counter_offer': return 'Counter Offer'
      case 'bundle': return 'Bundle'
      case 'trade_finder': return 'Trade Finder'
      default: return serviceType
    }
  }

  function formatStatus(status: string) {
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

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function shortenId(id: string) {
    return id.slice(0, 8)
  }

  // Helper function to check if a submission matches the search term
  const matchesSearch = (submission: Submission): boolean => {
    if (!searchTerm.trim()) return true

    const term = searchTerm.toLowerCase()
    const userEmail = (userEmailMap[submission.user_id] || '').toLowerCase()
    const expertName = (submission.expert?.name || '').toLowerCase()
    const serviceType = formatServiceType(submission.service_type).toLowerCase()

    // Current searchable fields
    const searchableText = [
      userEmail,
      expertName,
      serviceType,
      submission.id.toLowerCase(),
    ].join(' ')

    // Future: Add audio transcript search when available
    // if (submission.audio_transcript) {
    //   searchableText += ' ' + submission.audio_transcript.toLowerCase()
    // }

    return searchableText.includes(term)
  }

  // Helper function to check if a submission is within date range
  const matchesDateRange = (submission: Submission): boolean => {
    // Convert UTC timestamp to local date-only (strip time component)
    const createdDate = new Date(submission.created_at)
    const createdDateOnly = new Date(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      createdDate.getDate()
    )

    if (dateFrom) {
      // Parse date input as local date (YYYY-MM-DD string from input)
      const [year, month, day] = dateFrom.split('-').map(Number)
      const fromDate = new Date(year, month - 1, day) // month is 0-indexed
      if (createdDateOnly < fromDate) return false
    }

    if (dateTo) {
      // Parse date input as local date (YYYY-MM-DD string from input)
      const [year, month, day] = dateTo.split('-').map(Number)
      const toDate = new Date(year, month - 1, day) // month is 0-indexed
      if (createdDateOnly > toDate) return false
    }

    return true
  }

  // Apply all filters
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesExpert = expertFilter === 'all' ||
      (expertFilter === 'unclaimed' && !sub.expert_id) ||
      (sub.expert_id === expertFilter)

    return matchesSearch(sub) && matchesDateRange(sub) && matchesStatus && matchesExpert
  })

  const handleExportCSV = () => {
    const csvData = filteredSubmissions.map(submission => ({
      'Submission ID': submission.id,
      'User Email': userEmailMap[submission.user_id] || 'Unknown',
      'Service Type': formatServiceType(submission.service_type),
      'Rate Tier': submission.rate_tier,
      'Status': formatStatus(submission.status),
      'Created Date': formatDate(submission.created_at),
      'Expert Name': submission.expert?.name || 'Unassigned',
    }))

    const csvContent = arrayToCSV(csvData)
    const filename = `submissions-export-${getDateString()}.csv`
    downloadCSV(csvContent, filename)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('all')
    setExpertFilter('all')
  }

  const hasActiveFilters = searchTerm || dateFrom || dateTo || statusFilter !== 'all' || expertFilter !== 'all'

  return (
    <div>
      {/* Prominent Search Bar */}
      <div style={{
        backgroundColor: '#1a1710',
        border: '2px solid #C9A84C',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user email, expert name, service type, or submission ID..."
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
              }}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '14px 20px',
                backgroundColor: 'transparent',
                color: '#6b6457',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.75rem',
                border: '1px solid #2a261e',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Date Range Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
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
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 16px',
                backgroundColor: '#0C0A07',
                color: '#F2EDE4',
                border: '1px solid #2a261e',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            />
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
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 16px',
                backgroundColor: '#0C0A07',
                color: '#F2EDE4',
                border: '1px solid #2a261e',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            />
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
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 16px',
                backgroundColor: '#0C0A07',
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
                backgroundColor: '#0C0A07',
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
      </div>

      {/* Results and Export */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
        }}>
          Showing {filteredSubmissions.length} of {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredSubmissions.length === 0}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '12px 24px',
            backgroundColor: filteredSubmissions.length === 0 ? '#2a261e' : '#C9A84C',
            color: filteredSubmissions.length === 0 ? '#6b6457' : '#0C0A07',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
            border: 'none',
            cursor: filteredSubmissions.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      {filteredSubmissions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 200px 150px 120px 120px 150px 160px 160px',
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
              User Email
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
              userEmail={userEmailMap[submission.user_id] || 'Unknown'}
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
            {hasActiveFilters ? 'Try adjusting your search or filters' : 'No submissions yet'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 24px',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                marginTop: '16px',
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
