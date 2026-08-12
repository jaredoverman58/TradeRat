type MeetRatContent = {
  title: string
  credentials: string[]
}

export default function MeetRatSection({ content }: { content: MeetRatContent }) {
  return (
    <section id="meet-rat" style={{
      padding: '80px 24px',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          border: '2px solid #C9A84C',
          padding: 'clamp(32px, 5vw, 64px)',
          backgroundColor: '#1a1710',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontStyle: 'italic',
            color: '#C9A84C',
            marginBottom: '32px',
            fontWeight: 700,
          }}>
            {content.title}
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {content.credentials.map((credential, index) => (
              <p
                key={index}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '1rem',
                  color: '#F2EDE4',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {credential}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
