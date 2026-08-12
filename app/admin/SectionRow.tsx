'use client'

type Section = {
  id: string
  section_key: string
  is_active: boolean
  sort_order: number
  content: any
}

export default function SectionRow({
  section,
  index,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  onEdit,
}: {
  section: Section
  index: number
  isFirst: boolean
  isLast: boolean
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
}) {
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 150px 120px',
      gap: '16px',
      padding: '20px 24px',
      borderBottom: '1px solid #2a261e',
      backgroundColor: section.is_active ? 'transparent' : '#1a1710',
    }}>
      <div style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#F2EDE4',
        display: 'flex',
        alignItems: 'center',
      }}>
        {formatSectionName(section.section_key)}
      </div>

      <div style={{
        fontFamily: 'var(--font-dm-mono)',
        fontSize: '0.75rem',
        color: '#6b6457',
        display: 'flex',
        alignItems: 'center',
      }}>
        {section.section_key}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <button
          onClick={onToggle}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '8px 16px',
            backgroundColor: section.is_active ? '#C9A84C' : 'transparent',
            color: section.is_active ? '#0C0A07' : '#6b6457',
            border: section.is_active ? 'none' : '1px solid #2a261e',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {section.is_active ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: isFirst ? '#2a261e' : '#6b6457',
            border: '1px solid #2a261e',
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}
          title="Move up"
        >
          ↑
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: isLast ? '#2a261e' : '#6b6457',
            border: '1px solid #2a261e',
            cursor: isLast ? 'not-allowed' : 'pointer',
          }}
          title="Move down"
        >
          ↓
        </button>
        <button
          onClick={onEdit}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#C9A84C',
            border: '1px solid #C9A84C',
            cursor: 'pointer',
          }}
          title="Edit content"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
