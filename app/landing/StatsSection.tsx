type Stat = {
  number: string
  label: string
}

type StatsContent = {
  stats: Stat[]
}

export default function StatsSection({ content }: { content: StatsContent }) {
  // If no stats, render nothing
  if (!content.stats || content.stats.length === 0) {
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
        }}>
          {content.stats.slice(0, 4).map((stat, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #2a261e',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                {stat.number}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6457',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
