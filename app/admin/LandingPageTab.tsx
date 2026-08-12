import { createClient } from '@/lib/supabase/server'
import SectionManager from './SectionManager'

export default async function LandingPageTab() {
  const supabase = await createClient()

  // Fetch all sections (active and inactive) ordered by sort_order
  const { data: sections } = await supabase
    .from('landing_page_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#F2EDE4',
        marginBottom: '16px',
      }}>
        Landing Page Manager
      </h2>

      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.875rem',
        color: '#6b6457',
        marginBottom: '32px',
        lineHeight: 1.6,
      }}>
        Toggle sections on/off, reorder them, and edit their content. Changes take effect immediately on the live landing page.
      </p>

      <SectionManager sections={sections || []} />
    </div>
  )
}
