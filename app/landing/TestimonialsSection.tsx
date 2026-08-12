type Testimonial = {
  quote: string
  name: string
  league_type: string
  service?: string
}

type TestimonialsContent = {
  testimonials: Testimonial[]
}

export default function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  // If no testimonials, render nothing
  if (!content.testimonials || content.testimonials.length === 0) {
    return null
  }

  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {content.testimonials.map((testimonial, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #2a261e',
                padding: '32px 24px',
                backgroundColor: '#1a1710',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#F2EDE4',
                lineHeight: 1.6,
                marginBottom: '24px',
                fontStyle: 'italic',
              }}>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#C9A84C',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}>
                  {testimonial.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.75rem',
                  color: '#6b6457',
                }}>
                  {testimonial.league_type}
                  {testimonial.service && ` · ${testimonial.service}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
