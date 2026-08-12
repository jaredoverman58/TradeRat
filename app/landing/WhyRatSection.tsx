type WhyRatContent = {
  label: string
  points: string[]
  quote: string
}

export default function WhyRatSection({ content }: { content: WhyRatContent }) {
  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#C9A84C',
          marginBottom: '48px',
        }}>
          {content.label}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          marginBottom: '64px',
        }}>
          {content.points.map((point, index) => (
            <div
              key={index}
              style={{
                paddingLeft: '24px',
                borderLeft: '2px solid #C9A84C',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1rem',
                color: '#F2EDE4',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {point}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '64px',
          borderTop: '1px solid #2a261e',
        }}>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontStyle: 'italic',
            color: '#C9A84C',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {content.quote}
          </p>
        </div>
      </div>
    </section>
  )
}
