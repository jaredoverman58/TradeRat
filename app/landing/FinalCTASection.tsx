import Link from 'next/link'

type FinalCTAContent = {
  headline: string
  subtext: string
  button_text: string
  button_link: string
}

export default function FinalCTASection({ content }: { content: FinalCTAContent }) {
  return (
    <section style={{
      padding: '120px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          color: '#F2EDE4',
          marginBottom: '24px',
          lineHeight: 1.2,
        }}>
          {content.headline}
        </h2>

        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#6b6457',
          marginBottom: '48px',
          lineHeight: 1.6,
        }}>
          {content.subtext}
        </p>

        <Link
          href={content.button_link}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '16px 40px',
            minHeight: '44px',
            display: 'inline-flex',
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
          {content.button_text}
        </Link>
      </div>
    </section>
  )
}
