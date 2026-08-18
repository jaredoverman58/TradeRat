'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import SubmissionsTable from './SubmissionsTable'

export default function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [experts, setExperts] = useState<any[]>([])
  const [userEmailMap, setUserEmailMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch all submissions with expert and league profile data
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select(`
        *,
        expert:experts(id, name),
        league_profile:league_profiles(
          league_name,
          platform
        )
      `)
      .order('created_at', { ascending: false })

    // Fetch all experts for the filter dropdown
    const { data: expertsData } = await supabase
      .from('experts')
      .select('id, name')
      .order('name')

    // Fetch user emails via API endpoint (admin access required)
    const userIds = submissionsData?.map(s => s.user_id) || []
    const uniqueUserIds = [...new Set(userIds)]

    const emailMap: Record<string, string> = {}

    // Fetch emails from API
    if (uniqueUserIds.length > 0) {
      try {
        const response = await fetch('/api/admin/user-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds: uniqueUserIds }),
        })

        if (response.ok) {
          const data = await response.json()
          Object.assign(emailMap, data.emails || {})
        }
      } catch (error) {
        console.error('Error fetching user emails:', error)
      }
    }

    setSubmissions(submissionsData || [])
    setExperts(expertsData || [])
    setUserEmailMap(emailMap)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '1rem',
        color: '#6b6457',
        textAlign: 'center',
        padding: '60px',
      }}>
        Loading submissions...
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '24px',
      }}>
        All Submissions ({submissions.length})
      </h2>

      <SubmissionsTable
        submissions={submissions}
        experts={experts}
        userEmailMap={userEmailMap}
        onRefresh={loadData}
      />
    </div>
  )
}
