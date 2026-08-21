import Link from 'next/link'

type HeroContent = {
  headline: string
  subtext: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  disclaimer: string
}

export default function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 24px 80px',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 900,
          color: '#F2EDE4',
          marginBottom: '32px',
          lineHeight: 1.1,
        }}>
          {content.headline}
        </h1>

        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#6b6457',
          marginBottom: '48px',
          lineHeight: 1.6,
          maxWidth: '700px',
          margin: '0 auto 48px',
        }}>
          {content.subtext}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <Link
            href={content.primary_button_link}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
            }}
          >
            {content.primary_button_text}
          </Link>

          <a
            href={content.secondary_button_link}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              color: '#C9A84C',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: '1px solid #C9A84C',
            }}
          >
            {content.secondary_button_text}
          </a>
        </div>

        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginBottom: '16px',
        }}>
          {content.disclaimer}
        </p>

        <Link
          href="/pricing"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#8B7D6B',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          View full pricing →
        </Link>
      </div>
    </section>
  )
}
