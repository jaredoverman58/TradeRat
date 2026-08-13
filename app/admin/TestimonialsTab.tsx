'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Testimonial = {
  id: string
  quote: string
  name: string
  league_type: string | null
  service_used: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Form state
  const [formQuote, setFormQuote] = useState('')
  const [formName, setFormName] = useState('')
  const [formLeagueType, setFormLeagueType] = useState('')
  const [formService, setFormService] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('Error loading testimonials:', error)
    } else {
      setTestimonials(data || [])
    }
    setLoading(false)
  }

  const handleAdd = () => {
    setAdding(true)
    setEditing(null)
    setFormQuote('')
    setFormName('')
    setFormLeagueType('')
    setFormService('')
    setError(null)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditing(testimonial.id)
    setAdding(false)
    setFormQuote(testimonial.quote)
    setFormName(testimonial.name)
    setFormLeagueType(testimonial.league_type || '')
    setFormService(testimonial.service_used || '')
    setError(null)
  }

  const handleCancel = () => {
    setAdding(false)
    setEditing(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!formQuote.trim() || !formName.trim()) {
      setError('Quote and name are required')
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      if (adding) {
        // Get max sort_order and add 1
        const maxOrder = testimonials.length > 0
          ? Math.max(...testimonials.map(t => t.sort_order))
          : 0

        const { error } = await supabase
          .from('testimonials')
          .insert({
            quote: formQuote.trim(),
            name: formName.trim(),
            league_type: formLeagueType.trim() || null,
            service_used: formService.trim() || null,
            sort_order: maxOrder + 1,
          })

        if (error) throw error
      } else if (editing) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            quote: formQuote.trim(),
            name: formName.trim(),
            league_type: formLeagueType.trim() || null,
            service_used: formService.trim() || null,
          })
          .eq('id', editing)

        if (error) throw error
      }

      await loadTestimonials()
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
      .from('testimonials')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (error) {
      console.error('Error toggling active:', error)
    } else {
      await loadTestimonials()
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const supabase = createClient()

    const current = testimonials[index]
    const above = testimonials[index - 1]

    await supabase
      .from('testimonials')
      .update({ sort_order: above.sort_order })
      .eq('id', current.id)

    await supabase
      .from('testimonials')
      .update({ sort_order: current.sort_order })
      .eq('id', above.id)

    await loadTestimonials()
  }

  const handleMoveDown = async (index: number) => {
    if (index === testimonials.length - 1) return
    const supabase = createClient()

    const current = testimonials[index]
    const below = testimonials[index + 1]

    await supabase
      .from('testimonials')
      .update({ sort_order: below.sort_order })
      .eq('id', current.id)

    await supabase
      .from('testimonials')
      .update({ sort_order: current.sort_order })
      .eq('id', below.id)

    await loadTestimonials()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting:', error)
    } else {
      await loadTestimonials()
    }
  }

  if (loading) {
    return (
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        padding: '40px',
        textAlign: 'center',
      }}>
        Loading testimonials...
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
            Testimonials
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            Manage customer testimonials displayed on the landing page
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
          + Add Testimonial
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
            {adding ? 'Add New Testimonial' : 'Edit Testimonial'}
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
            {/* Quote */}
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
                Quote *
              </label>
              <textarea
                value={formQuote}
                onChange={(e) => setFormQuote(e.target.value)}
                rows={4}
                placeholder="The Rat saw a move I never would have considered..."
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0C0A07',
                  border: '1px solid #2a261e',
                  color: '#F2EDE4',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Name */}
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
                Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Marcus"
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

            {/* League Type */}
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
                League Type (Optional)
              </label>
              <input
                type="text"
                value={formLeagueType}
                onChange={(e) => setFormLeagueType(e.target.value)}
                placeholder="12-team Dynasty"
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

            {/* Service Used */}
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
                Service Used (Optional)
              </label>
              <input
                type="text"
                value={formService}
                onChange={(e) => setFormService(e.target.value)}
                placeholder="Trade Finder"
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

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
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
            No testimonials yet
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            Click &quot;Add Testimonial&quot; to create your first one
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              style={{
                border: testimonial.is_active ? '1px solid #C9A84C' : '1px solid #2a261e',
                padding: '24px',
                backgroundColor: testimonial.is_active ? 'transparent' : '#1a1710',
                opacity: testimonial.is_active ? 1 : 0.6,
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
                    disabled={index === testimonials.length - 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      color: index === testimonials.length - 1 ? '#2a261e' : '#C9A84C',
                      border: '1px solid #2a261e',
                      cursor: index === testimonials.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ↓
                  </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '1rem',
                    color: '#F2EDE4',
                    marginBottom: '12px',
                    fontStyle: 'italic',
                  }}>
                    &quot;{testimonial.quote}&quot;
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem',
                    color: '#C9A84C',
                    marginBottom: '4px',
                  }}>
                    {testimonial.name}
                  </div>
                  {(testimonial.league_type || testimonial.service_used) && (
                    <div style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      color: '#6b6457',
                    }}>
                      {testimonial.league_type}
                      {testimonial.league_type && testimonial.service_used && ' · '}
                      {testimonial.service_used}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  justifyContent: 'center',
                }}>
                  <button
                    onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: testimonial.is_active ? '#C9A84C' : '#6b6457',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.75rem',
                      border: '1px solid #2a261e',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {testimonial.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
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
                    onClick={() => handleDelete(testimonial.id)}
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
