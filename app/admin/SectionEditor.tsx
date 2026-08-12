'use client'

import { useState } from 'react'

type Section = {
  id: string
  section_key: string
  is_active: boolean
  sort_order: number
  content: any
}

export default function SectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: Section
  onSave: (content: any) => void
  onCancel: () => void
}) {
  const [content, setContent] = useState(JSON.stringify(section.content, null, 2))
  const [error, setError] = useState('')

  const handleSave = () => {
    try {
      const parsed = JSON.parse(content)
      setError('')
      onSave(parsed)
    } catch (e) {
      setError('Invalid JSON. Please fix the syntax errors.')
    }
  }

  const formatSectionName = (key: string) => {
    switch (key) {
      case 'hero': return 'Hero'
      case 'why_rat': return 'Why The Rat'
      case 'meet_rat': return 'Meet The Rat'
      case 'stats': return 'Stats'
      case 'services': return 'Services'
      case 'testimonials': return 'Testimonials'
      case 'pricing_table': return 'Pricing Table'
      case 'final_cta': return 'Final CTA'
      default: return key
    }
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}>
            Edit {formatSectionName(section.section_key)}
          </h3>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
          }}>
            Section key: <span style={{ fontFamily: 'var(--font-dm-mono)', color: '#C9A84C' }}>{section.section_key}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={onCancel}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#6b6457',
              border: '1px solid #2a261e',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#3a1010',
          border: '1px solid #6a2020',
          marginBottom: '24px',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#ff6b6b',
            margin: 0,
          }}>
            {error}
          </p>
        </div>
      )}

      <div style={{
        border: '1px solid #2a261e',
        padding: '24px',
        backgroundColor: '#1a1710',
      }}>
        <label style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b6457',
          display: 'block',
          marginBottom: '12px',
        }}>
          Content (JSON)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: '400px',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '0.875rem',
            backgroundColor: '#0C0A07',
            color: '#F2EDE4',
            border: '1px solid #2a261e',
            padding: '16px',
            resize: 'vertical',
          }}
          spellCheck={false}
        />
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          color: '#6b6457',
          marginTop: '12px',
          lineHeight: 1.6,
        }}>
          Edit the JSON content above. Make sure to maintain valid JSON syntax. Changes will be reflected on the landing page immediately after saving.
        </p>
      </div>
    </div>
  )
}
