import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #2a261e',
      padding: '48px 24px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {/* Top row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
            }}>
              The Trade Rat™ · Fantasy Trade Intelligence
            </div>

            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
            }}>
              Human logic. Real experience. No bots.
            </div>
          </div>

          {/* Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '32px',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/contact"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                textDecoration: 'none',
              }}
            >
              Contact Us
            </Link>
            <Link
              href="/terms"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                textDecoration: 'none',
              }}
            >
              Terms and Conditions
            </Link>
            <Link
              href="/faq"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                textDecoration: 'none',
              }}
            >
              FAQ
            </Link>
            <Link
              href="/privacy"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                textDecoration: 'none',
              }}
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
