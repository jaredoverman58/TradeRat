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
  expert: { id: string; name: string } | null
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
  onRefresh,
}: {
  submissions: Submission[]
  experts: Expert[]
  userEmailMap: Record<string, string>
  onRefresh: () => void
}) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expertFilter, setExpertFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Bulk delete states
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [testSubmissionsCount, setTestSubmissionsCount] = useState<number>(0)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkDeleteMessage, setBulkDeleteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Delete ALL submissions states (nuclear option - pre-launch only)
  const [deleteAllStep, setDeleteAllStep] = useState(0) // 0=hidden, 1=warning, 2=checkbox, 3=typed
  const [totalSubmissionsCount, setTotalSubmissionsCount] = useState(0)
  const [deleteAllCheckboxConfirmed, setDeleteAllCheckboxConfirmed] = useState(false)
  const [deleteAllTypedText, setDeleteAllTypedText] = useState('')
  const [deletingAll, setDeletingAll] = useState(false)
  const [deleteAllMessage, setDeleteAllMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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

  const handlePreviewBulkDelete = async () => {
    setBulkDeleteMessage(null)
    try {
      const response = await fetch('/api/admin/delete-test-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDelete: false }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setBulkDeleteMessage({
          type: 'error',
          text: `Failed to fetch test submissions: ${errorData.error || 'Unknown error'}`
        })
        return
      }

      const result = await response.json()
      setTestSubmissionsCount(result.count)
      setShowBulkDeleteConfirm(true)
    } catch (error) {
      console.error('Error fetching test submissions count:', error)
      setBulkDeleteMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
    }
  }

  const handleConfirmBulkDelete = async () => {
    setBulkDeleting(true)
    setBulkDeleteMessage(null)
    try {
      const response = await fetch('/api/admin/delete-test-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDelete: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setBulkDeleteMessage({
          type: 'error',
          text: `Failed to delete: ${errorData.error || 'Unknown error'}`
        })
        return
      }

      const result = await response.json()
      setBulkDeleteMessage({
        type: 'success',
        text: result.message
      })
      setShowBulkDeleteConfirm(false)

      // Refresh the list after a moment
      setTimeout(() => {
        onRefresh()
        setBulkDeleteMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error deleting test submissions:', error)
      setBulkDeleteMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
    } finally {
      setBulkDeleting(false)
    }
  }

  // Delete ALL submissions handlers (nuclear option - pre-launch only)
  const handleDeleteAllStep1 = async () => {
    setDeleteAllMessage(null)
    try {
      const response = await fetch('/api/admin/delete-all-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setDeleteAllMessage({
          type: 'error',
          text: `Failed to fetch count: ${errorData.error || 'Unknown error'}`
        })
        return
      }

      const result = await response.json()
      setTotalSubmissionsCount(result.count)
      setDeleteAllStep(1)
    } catch (error) {
      console.error('Error fetching total submissions count:', error)
      setDeleteAllMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
    }
  }

  const handleDeleteAllStep2 = () => {
    setDeleteAllStep(2)
  }

  const handleDeleteAllStep3 = () => {
    setDeleteAllStep(3)
  }

  const handleConfirmDeleteAll = async () => {
    setDeletingAll(true)
    setDeleteAllMessage(null)
    try {
      const response = await fetch('/api/admin/delete-all-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'confirm' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setDeleteAllMessage({
          type: 'error',
          text: `Failed to delete: ${errorData.error || 'Unknown error'}`
        })
        return
      }

      const result = await response.json()
      setDeleteAllMessage({
        type: 'success',
        text: result.message
      })

      // Reset all state
      setDeleteAllStep(0)
      setDeleteAllCheckboxConfirmed(false)
      setDeleteAllTypedText('')

      // Refresh the list after a moment
      setTimeout(() => {
        onRefresh()
        setDeleteAllMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error deleting all submissions:', error)
      setDeleteAllMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
    } finally {
      setDeletingAll(false)
    }
  }

  const handleCancelDeleteAll = () => {
    setDeleteAllStep(0)
    setDeleteAllCheckboxConfirmed(false)
    setDeleteAllTypedText('')
    setDeleteAllMessage(null)
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

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePreviewBulkDelete}
            disabled={bulkDeleting}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: bulkDeleting ? '#2a261e' : 'transparent',
              color: bulkDeleting ? '#6b6457' : '#ff6666',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: '1px solid #ff4444',
              cursor: bulkDeleting ? 'not-allowed' : 'pointer',
            }}
          >
            Clear Test Submissions
          </button>

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
      </div>

      {/* Bulk Delete Confirmation */}
      {showBulkDeleteConfirm && (
        <div style={{
          border: '2px solid #ff4444',
          padding: '24px',
          marginBottom: '16px',
          backgroundColor: '#1a0a0a',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.25rem',
            color: '#ff6666',
            marginBottom: '12px',
          }}>
            Confirm Bulk Delete
          </h3>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#F2EDE4',
            marginBottom: '16px',
          }}>
            Delete <strong>{testSubmissionsCount}</strong> test submission{testSubmissionsCount !== 1 ? 's' : ''}?
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
            marginBottom: '16px',
          }}>
            Only affects submissions marked &quot;Created via bulk seeder&quot; or &quot;Created via admin dev tools&quot;. Real user submissions will not be touched.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleConfirmBulkDelete}
              disabled={bulkDeleting || testSubmissionsCount === 0}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 20px',
                backgroundColor: bulkDeleting || testSubmissionsCount === 0 ? '#2a261e' : '#ff4444',
                color: bulkDeleting || testSubmissionsCount === 0 ? '#6b6457' : '#0C0A07',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: 'none',
                cursor: bulkDeleting || testSubmissionsCount === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {bulkDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => {
                setShowBulkDeleteConfirm(false)
                setTestSubmissionsCount(0)
              }}
              disabled={bulkDeleting}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: bulkDeleting ? '#6b6457' : '#F2EDE4',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: '1px solid #2a261e',
                cursor: bulkDeleting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Message */}
      {bulkDeleteMessage && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: bulkDeleteMessage.type === 'success' ? '#1a2e1a' : '#2a0a0a',
          border: `1px solid ${bulkDeleteMessage.type === 'success' ? '#4a7c59' : '#ff4444'}`,
          color: bulkDeleteMessage.type === 'success' ? '#88cc88' : '#ff6666',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
        }}>
          {bulkDeleteMessage.text}
        </div>
      )}

      {/* Delete ALL Submissions Section (Nuclear Option - Pre-Launch Only) */}
      <div style={{
        marginTop: '40px',
        marginBottom: '24px',
        padding: '24px',
        border: '2px solid #ff4444',
        backgroundColor: '#1a0a0a',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem',
          color: '#ff6666',
          marginBottom: '8px',
        }}>
          ⚠ Pre-Launch Only: Nuclear Delete
        </h3>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          color: '#6b6457',
          marginBottom: '16px',
        }}>
          Deletes ALL submissions regardless of test markers. Remove this before going live.
        </p>

        {deleteAllStep === 0 && (
          <button
            onClick={handleDeleteAllStep1}
            disabled={deletingAll}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: deletingAll ? '#2a261e' : '#ff4444',
              color: deletingAll ? '#6b6457' : '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: 'none',
              cursor: deletingAll ? 'not-allowed' : 'pointer',
            }}
          >
            ⚠ Delete ALL Submissions (Pre-Launch Only)
          </button>
        )}

        {/* Step 1: Initial Warning */}
        {deleteAllStep === 1 && (
          <div>
            <h4 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              ⚠ Warning: Nuclear Delete
            </h4>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              marginBottom: '16px',
              lineHeight: '1.6',
            }}>
              This will permanently delete ALL <strong style={{ color: '#ff6666' }}>{totalSubmissionsCount}</strong> submissions, including any you may have created manually through the real submit form. This is NOT restricted to test data. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDeleteAllStep2}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: '#C9A84C',
                  color: '#0C0A07',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                I Understand, Continue
              </button>
              <button
                onClick={handleCancelDeleteAll}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: '#F2EDE4',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: '1px solid #2a261e',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Checkbox Confirmation */}
        {deleteAllStep === 2 && (
          <div>
            <h4 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              Final Confirmation Required
            </h4>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              You are about to delete <strong style={{ color: '#ff6666' }}>{totalSubmissionsCount}</strong> submissions.
            </p>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              marginBottom: '20px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={deleteAllCheckboxConfirmed}
                onChange={(e) => setDeleteAllCheckboxConfirmed(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              I confirm I want to delete ALL submissions, not just test data
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDeleteAllStep3}
                disabled={!deleteAllCheckboxConfirmed || deletingAll}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: deleteAllCheckboxConfirmed && !deletingAll ? '#ff4444' : '#2a261e',
                  color: deleteAllCheckboxConfirmed && !deletingAll ? '#0C0A07' : '#6b6457',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: deleteAllCheckboxConfirmed && !deletingAll ? 'pointer' : 'not-allowed',
                }}
              >
                Proceed to Final Confirmation
              </button>
              <button
                onClick={handleCancelDeleteAll}
                disabled={deletingAll}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: deletingAll ? '#6b6457' : '#F2EDE4',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: '1px solid #2a261e',
                  cursor: deletingAll ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Typed Confirmation */}
        {deleteAllStep === 3 && (
          <div>
            <h4 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              Type to Confirm Deletion
            </h4>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              marginBottom: '16px',
            }}>
              About to permanently delete <strong style={{ color: '#ff6666' }}>{totalSubmissionsCount}</strong> submissions.
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              color: '#ff6666',
              marginBottom: '8px',
            }}>
              Type <strong>DELETE ALL</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteAllTypedText}
              onChange={(e) => setDeleteAllTypedText(e.target.value)}
              placeholder="DELETE ALL"
              style={{
                width: '250px',
                padding: '8px 12px',
                backgroundColor: '#0C0A07',
                border: '1px solid #2a261e',
                color: '#F2EDE4',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleConfirmDeleteAll}
                disabled={deleteAllTypedText !== 'DELETE ALL' || deletingAll}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: deleteAllTypedText === 'DELETE ALL' && !deletingAll ? '#ff4444' : '#2a261e',
                  color: deleteAllTypedText === 'DELETE ALL' && !deletingAll ? '#0C0A07' : '#6b6457',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: deleteAllTypedText === 'DELETE ALL' && !deletingAll ? 'pointer' : 'not-allowed',
                }}
              >
                {deletingAll ? 'Deleting...' : 'Permanently Delete Everything'}
              </button>
              <button
                onClick={handleCancelDeleteAll}
                disabled={deletingAll}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: deletingAll ? '#6b6457' : '#F2EDE4',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: '1px solid #2a261e',
                  cursor: deletingAll ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete All Message */}
        {deleteAllMessage && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: deleteAllMessage.type === 'success' ? '#1a2e1a' : '#2a0a0a',
            border: `1px solid ${deleteAllMessage.type === 'success' ? '#4a7c59' : '#ff4444'}`,
            color: deleteAllMessage.type === 'success' ? '#88cc88' : '#ff6666',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
          }}>
            {deleteAllMessage.text}
          </div>
        )}
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
              experts={experts}
              onReassign={onRefresh}
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
