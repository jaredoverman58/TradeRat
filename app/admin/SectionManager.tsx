'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SectionRow from './SectionRow'
import SectionEditor from './SectionEditor'

type Section = {
  id: string
  section_key: string
  is_active: boolean
  sort_order: number
  content: any
}

export default function SectionManager({ sections: initialSections }: { sections: Section[] }) {
  const [sections, setSections] = useState(initialSections)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const supabase = createClient()

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('landing_page_sections')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (!error) {
      setSections(sections.map(s =>
        s.id === id ? { ...s, is_active: !currentActive } : s
      ))
    }
  }

  const moveUp = async (index: number) => {
    if (index === 0) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp

    // Update sort orders
    await Promise.all([
      supabase
        .from('landing_page_sections')
        .update({ sort_order: index })
        .eq('id', newSections[index].id),
      supabase
        .from('landing_page_sections')
        .update({ sort_order: index + 1 })
        .eq('id', newSections[index - 1].id)
    ])

    // Update local state with new sort orders
    newSections[index] = { ...newSections[index], sort_order: index + 1 }
    newSections[index - 1] = { ...newSections[index - 1], sort_order: index }

    setSections(newSections)
  }

  const moveDown = async (index: number) => {
    if (index === sections.length - 1) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp

    // Update sort orders
    await Promise.all([
      supabase
        .from('landing_page_sections')
        .update({ sort_order: index + 2 })
        .eq('id', newSections[index].id),
      supabase
        .from('landing_page_sections')
        .update({ sort_order: index + 1 })
        .eq('id', newSections[index + 1].id)
    ])

    // Update local state with new sort orders
    newSections[index] = { ...newSections[index], sort_order: index + 1 }
    newSections[index + 1] = { ...newSections[index + 1], sort_order: index + 2 }

    setSections(newSections)
  }

  const handleSave = async (updatedContent: any) => {
    if (!editingSection) return

    const { error } = await supabase
      .from('landing_page_sections')
      .update({ content: updatedContent })
      .eq('id', editingSection.id)

    if (!error) {
      setSections(sections.map(s =>
        s.id === editingSection.id ? { ...s, content: updatedContent } : s
      ))
      setEditingSection(null)
    }
  }

  if (editingSection) {
    return (
      <SectionEditor
        section={editingSection}
        onSave={handleSave}
        onCancel={() => setEditingSection(null)}
      />
    )
  }

  return (
    <div style={{
      border: '1px solid #2a261e',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 150px 120px',
        gap: '16px',
        padding: '16px 24px',
        borderBottom: '1px solid #2a261e',
        backgroundColor: '#1a1710',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b6457',
          fontWeight: 600,
        }}>
          Section
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b6457',
          fontWeight: 600,
        }}>
          Key
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b6457',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          Status
        </div>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b6457',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          Actions
        </div>
      </div>

      {/* Rows */}
      {sections.map((section, index) => (
        <SectionRow
          key={section.id}
          section={section}
          index={index}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
          onToggle={() => toggleActive(section.id, section.is_active)}
          onMoveUp={() => moveUp(index)}
          onMoveDown={() => moveDown(index)}
          onEdit={() => setEditingSection(section)}
        />
      ))}
    </div>
  )
}
