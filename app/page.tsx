import { createClient } from '@/lib/supabase/server'
import NavBar from './landing/NavBar'
import HeroSection from './landing/HeroSection'
import WhyRatSection from './landing/WhyRatSection'
import MeetRatSection from './landing/MeetRatSection'
import StatsSection from './landing/StatsSection'
import ServicesSection from './landing/ServicesSection'
import TestimonialsSection from './landing/TestimonialsSection'
import PricingTableSection from './landing/PricingTableSection'
import FinalCTASection from './landing/FinalCTASection'
import Footer from './landing/Footer'

export default async function LandingPage() {
  const supabase = await createClient()

  // Fetch all active sections ordered by sort_order
  const { data: sections } = await supabase
    .from('landing_page_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Create a map of sections by key for easy lookup
  const sectionMap = new Map(
    sections?.map(section => [section.section_key, section.content]) || []
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07' }}>
      <NavBar />

      <main>
        {sections?.map((section) => {
          switch (section.section_key) {
            case 'hero':
              return <HeroSection key={section.id} content={section.content} />
            case 'why_rat':
              return <WhyRatSection key={section.id} content={section.content} />
            case 'meet_rat':
              return <MeetRatSection key={section.id} content={section.content} />
            case 'stats':
              return <StatsSection key={section.id} content={section.content} />
            case 'services':
              return <ServicesSection key={section.id} content={section.content} />
            case 'testimonials':
              return <TestimonialsSection key={section.id} content={section.content} />
            case 'pricing_table':
              return <PricingTableSection key={section.id} content={section.content} />
            case 'final_cta':
              return <FinalCTASection key={section.id} content={section.content} />
            default:
              return null
          }
        })}
      </main>

      <Footer />
    </div>
  )
}
