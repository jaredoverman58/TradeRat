'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Stat = {
  id: string
  stat_number: string
  stat_label: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export default function StatsTab() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Form state
  const [formNumber, setFormNumber] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('Error loading stats:', error)
    } else {
      setStats(data || [])
    }
    setLoading(false)
  }

  const handleAdd = () => {
    setAdding(true)
    setEditing(null)
    setFormNumber('')
    setFormLabel('')
    setError(null)
  }

  const handleEdit = (stat: Stat) => {
    setEditing(stat.id)
    setAdding(false)
    setFormNumber(stat.stat_number)
    setFormLabel(stat.stat_label)
    setError(null)
  }

  const handleCancel = () => {
    setAdding(false)
    setEditing(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!formNumber.trim() || !formLabel.trim()) {
      setError('Both stat number and label are required')
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      if (adding) {
        // Get max sort_order and add 1
        const maxOrder = stats.length > 0
          ? Math.max(...stats.map(s => s.sort_order))
          : 0

        const { error } = await supabase
          .from('stats')
          .insert({
            stat_number: formNumber.trim(),
            stat_label: formLabel.trim(),
            sort_order: maxOrder + 1,
          })

        if (error) throw error
      } else if (editing) {
        const { error } = await supabase
          .from('stats')
          .update({
            stat_number: formNumber.trim(),
            stat_label: formLabel.trim(),
          })
          .eq('id', editing)

        if (error) throw error
      }

      await loadStats()
      handleCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('stats')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (error) {
      console.error('Error toggling active:', error)
    } else {
      await loadStats()
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const supabase = createClient()

    const current = stats[index]
    const above = stats[index - 1]

    await supabase
      .from('stats')
      .update({ sort_order: above.sort_order })
      .eq('id', current.id)

    await supabase
      .from('stats')
      .update({ sort_order: current.sort_order })
      .eq('id', above.id)

    await loadStats()
  }

  const handleMoveDown = async (index: number) => {
    if (index === stats.length - 1) return
    const supabase = createClient()

    const current = stats[index]
    const below = stats[index + 1]

    await supabase
      .from('stats')
      .update({ sort_order: below.sort_order })
      .eq('id', current.id)

    await supabase
      .from('stats')
      .update({ sort_order: current.sort_order })
      .eq('id', below.id)

    await loadStats()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stat? This cannot be undone.')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('stats')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting:', error)
    } else {
      await loadStats()
    }
  }

  const activeCount = stats.filter(s => s.is_active).length

  if (loading) {
    return (
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        padding: '40px',
        textAlign: 'center',
      }}>
        Loading stats...
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Stats
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            Manage statistics displayed on the landing page (max 4 shown publicly, currently {activeCount} active)
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || editing !== null}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '12px 24px',
            backgroundColor: adding || editing !== null ? '#2a261e' : '#C9A84C',
            color: adding || editing !== null ? '#6b6457' : '#0C0A07',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
            border: 'none',
            cursor: adding || editing !== null ? 'not-allowed' : 'pointer',
          }}
        >
          + Add Stat
        </button>
      </div>

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <div style={{
          border: '2px solid #C9A84C',
          padding: '32px',
          marginBottom: '32px',
          backgroundColor: '#1a1710',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            {adding ? 'Add New Stat' : 'Edit Stat'}
          </h3>

          {error && (
            <div style={{
              backgroundColor: '#2a0a0a',
              border: '1px solid #ff4444',
              color: '#ff6666',
              padding: '12px 16px',
              marginBottom: '24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stat Number */}
            <div>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '8px',
                display: 'block',
              }}>
                Stat Number *
              </label>
              <input
                type="text"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="1000+ or 95% or 24-48hr"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0C0A07',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Stat Label */}
            <div>
              <label style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#F2EDE4',
                marginBottom: '8px',
                display: 'block',
              }}>
                Stat Label *
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="Trades Analyzed"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0C0A07',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 32px',
                  backgroundColor: saving ? '#2a261e' : '#C9A84C',
                  color: saving ? '#6b6457' : '#0C0A07',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  padding: '12px 32px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  border: '1px solid #2a261e',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats List */}
      {stats.length === 0 ? (
        <div style={{
          border: '1px solid #2a261e',
          padding: '60px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#6b6457',
            marginBottom: '8px',
          }}>
            No stats yet
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            Click "Add Stat" to create your first one
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              style={{
                border: stat.is_active ? '1px solid #C9A84C' : '1px solid #2a261e',
                padding: '24px',
                backgroundColor: stat.is_active ? 'transparent' : '#1a1710',
                opacity: stat.is_active ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Order Controls */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      color: index === 0 ? '#2a261e' : '#C9A84C',
                      border: '1px solid #2a261e',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === stats.length - 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      color: index === stats.length - 1 ? '#2a261e' : '#C9A84C',
                      border: '1px solid #2a261e',
                      cursor: index === stats.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ↓
                  </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#C9A84C',
                    marginBottom: '4px',
                  }}>
                    {stat.stat_number}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                  }}>
                    {stat.stat_label}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={() => handleToggleActive(stat.id, stat.is_active)}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: stat.is_active ? '#C9A84C' : '#6b6457',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      border: '1px solid #2a261e',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stat.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(stat)}
                    disabled={adding || editing !== null}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: adding || editing !== null ? '#2a261e' : '#F2EDE4',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      border: '1px solid #2a261e',
                      cursor: adding || editing !== null ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(stat.id)}
                    disabled={adding || editing !== null}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: adding || editing !== null ? '#2a261e' : '#ff6666',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      border: '1px solid #2a261e',
                      cursor: adding || editing !== null ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
