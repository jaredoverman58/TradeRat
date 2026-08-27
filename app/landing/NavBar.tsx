import Link from 'next/link'

export default function NavBar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: '#0C0A07',
      borderBottom: '1px solid #2a261e',
      padding: '16px 24px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontStyle: 'italic',
            color: '#C9A84C',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          TRADE RAT
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              color: '#d4af37',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '12px 24px',
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
            Claim Your Free Analysis
          </Link>
        </div>
      </div>
    </nav>
  )
}
