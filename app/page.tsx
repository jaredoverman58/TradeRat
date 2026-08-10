import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Grid background pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'linear-gradient(to right, #1e1a12 1px, transparent 1px), linear-gradient(to bottom, #1e1a12 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(4rem, 15vw, 12rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '32px',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            TRADE <span style={{ color: '#C9A84C' }}>RAT</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#C9A84C',
            fontStyle: 'italic',
            marginBottom: '64px',
          }}>
            The trap is set.
          </p>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#6b6457',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}>
            Expert fantasy football trade advice from named analysts.<br />
            Not AI. Not generic. Just ruthless precision.
          </p>

          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#C9A84C',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: 500,
          }}>
            ✓ First trade evaluation FREE
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Link
              href="/signup"
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
              GET STARTED FREE
            </Link>
            <Link
              href="/login"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                padding: '16px 40px',
                backgroundColor: 'transparent',
                color: '#C9A84C',
                fontWeight: 600,
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                border: '1px solid #C9A84C',
                display: 'inline-block',
              }}
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        position: 'relative',
        padding: '128px 24px',
        borderTop: '1px solid #2a261e',
        borderBottom: '1px solid #2a261e',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '80px',
            color: '#F2EDE4',
          }}>
            Why Trade Rat
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
            backgroundColor: '#2a261e',
          }}>
            <div style={{
              backgroundColor: '#0C0A07',
              padding: '48px',
              textAlign: 'center',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '16px',
                color: '#C9A84C',
              }}>
                Expert Analysis
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#6b6457',
                lineHeight: 1.6,
              }}>
                Human expertise from named analysts, not AI-generated advice
              </p>
            </div>

            <div style={{
              backgroundColor: '#0C0A07',
              padding: '48px',
              textAlign: 'center',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '16px',
                color: '#C9A84C',
              }}>
                Trade Creation
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#6b6457',
                lineHeight: 1.6,
              }}>
                We analyze your entire league and build custom trade proposals from scratch
              </p>
            </div>

            <div style={{
              backgroundColor: '#0C0A07',
              padding: '48px',
              textAlign: 'center',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '16px',
                color: '#C9A84C',
              }}>
                Flexible Pricing
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                color: '#6b6457',
                lineHeight: 1.6,
              }}>
                Free tier, pay-per-trade, and discounted packages available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        position: 'relative',
        padding: '128px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '24px',
            color: '#F2EDE4',
          }}>
            Popular Packages
          </h2>

          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1.125rem',
            textAlign: 'center',
            marginBottom: '64px',
            color: '#6b6457',
            maxWidth: '800px',
            margin: '0 auto 64px',
            lineHeight: 1.6,
          }}>
            <span style={{ color: '#C9A84C' }}>Trade Evaluation</span> - evaluate a specific offer • <span style={{ color: '#C9A84C' }}>Trade Finder</span> - we create custom suggestions for you
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
          }}>
            {/* Single Trade Evaluation */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#6b6457',
                marginBottom: '24px',
              }}>
                Trade Evaluation
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#F2EDE4',
              }}>
                Single
              </h3>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                marginBottom: '40px',
                color: '#C9A84C',
              }}>
                $4.99
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 48px 0',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                <li style={{ marginBottom: '12px' }}>Evaluate 1 specific offer</li>
                <li style={{ marginBottom: '12px' }}>Accept/Decline/Counter</li>
                <li style={{ marginBottom: '12px' }}>20-30 min analysis</li>
                <li>Any available expert</li>
              </ul>
              <Link
                href="/signup"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  display: 'block',
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  border: '1px solid #C9A84C',
                  textAlign: 'center',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                }}
              >
                GET STARTED
              </Link>
            </div>

            {/* Evaluation Gold Package */}
            <div style={{
              border: '2px solid #C9A84C',
              padding: '40px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#C9A84C',
              }} />
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#C9A84C',
                marginBottom: '24px',
              }}>
                Best Value
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#F2EDE4',
              }}>
                Evaluation Gold
              </h3>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                marginBottom: '40px',
                color: '#C9A84C',
              }}>
                $14.99
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 48px 0',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                <li style={{ marginBottom: '12px' }}>3 evaluations</li>
                <li style={{ marginBottom: '12px' }}>The Rat guaranteed</li>
                <li style={{ marginBottom: '12px' }}>Premium analysis</li>
                <li>Priority turnaround</li>
              </ul>
              <Link
                href="/signup"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  display: 'block',
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: '#C9A84C',
                  color: '#0C0A07',
                  textAlign: 'center',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                BUY NOW
              </Link>
            </div>

            {/* Finder Single */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#6b6457',
                marginBottom: '24px',
              }}>
                Trade Finder
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#F2EDE4',
              }}>
                Finder
              </h3>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                marginBottom: '40px',
                color: '#C9A84C',
              }}>
                $8.99
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 48px 0',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                <li style={{ marginBottom: '12px' }}>1 custom suggestion</li>
                <li style={{ marginBottom: '12px' }}>Entire league analysis</li>
                <li style={{ marginBottom: '12px' }}>45-60 min deep dive</li>
                <li>Any available expert</li>
              </ul>
              <Link
                href="/signup"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  display: 'block',
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  border: '1px solid #C9A84C',
                  textAlign: 'center',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                }}
              >
                GET STARTED
              </Link>
            </div>

            {/* Finder Gold */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '40px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#6b6457',
                marginBottom: '24px',
              }}>
                Trade Finder Premium
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '8px',
                color: '#F2EDE4',
              }}>
                Finder Gold
              </h3>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '3rem',
                fontWeight: 700,
                marginBottom: '40px',
                color: '#C9A84C',
              }}>
                $26.99
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 48px 0',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                <li style={{ marginBottom: '12px' }}>3 custom suggestions</li>
                <li style={{ marginBottom: '12px' }}>The Rat guaranteed</li>
                <li style={{ marginBottom: '12px' }}>Premium analysis</li>
                <li>Priority turnaround</li>
              </ul>
              <Link
                href="/signup"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  display: 'block',
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b6457',
                  border: '1px solid #C9A84C',
                  textAlign: 'center',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                }}
              >
                GET STARTED
              </Link>
            </div>
          </div>

          {/* View All Pricing Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '64px',
          }}>
            <Link
              href="/pricing"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#C9A84C',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                borderBottom: '1px solid #C9A84C',
                paddingBottom: '4px',
              }}
            >
              View All Pricing Options →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        borderTop: '1px solid #2a261e',
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#6b6457',
          }}>
            Trade Rat &copy; 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
