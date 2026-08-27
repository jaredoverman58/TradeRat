import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0C0A07',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 900,
          color: '#C9A84C',
          marginBottom: '24px',
          lineHeight: 1,
        }}>
          404
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1.25rem',
          color: '#F2EDE4',
          marginBottom: '40px',
        }}>
          Wrong page. The Rat&apos;s not impressed.
        </p>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            padding: '16px 40px',
            backgroundColor: '#C9A84C',
            color: '#0C0A07',
            fontWeight: 600,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
            display: 'inline-block',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
