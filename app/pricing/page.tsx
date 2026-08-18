import Link from 'next/link'

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '24px',
          }}>
            Pricing & Packages
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1.125rem',
            color: '#6b6457',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Expert fantasy football trade analysis from The Rat, The Badger, and The Monkey
          </p>
        </div>

        {/* Standard vs Rat Rate Comparison */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F2EDE4',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            Standard vs Rat Rate
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {/* Standard Tier */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '16px',
              }}>
                Standard
              </h3>
              <ul style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                lineHeight: 1.8,
                listStyle: 'none',
                padding: 0,
              }}>
                <li style={{ marginBottom: '8px' }}>✓ Analysis by The Badger or The Monkey</li>
                <li style={{ marginBottom: '8px' }}>✓ 24-48 hour turnaround</li>
                <li style={{ marginBottom: '8px' }}>✓ Written analysis</li>
                <li style={{ marginBottom: '8px' }}>✓ Roster impact assessment</li>
                <li style={{ marginBottom: '8px' }}>✓ Best value pricing</li>
              </ul>
            </div>

            {/* Rat Rate Tier */}
            <div style={{
              border: '2px solid #C9A84C',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
              }}>
                Premium
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '16px',
              }}>
                Rat Rate
              </h3>
              <ul style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                lineHeight: 1.8,
                listStyle: 'none',
                padding: 0,
              }}>
                <li style={{ marginBottom: '8px' }}>✓ <strong>The Rat guaranteed</strong></li>
                <li style={{ marginBottom: '8px' }}>✓ Priority 24-hour turnaround</li>
                <li style={{ marginBottom: '8px' }}>✓ In-depth written analysis</li>
                <li style={{ marginBottom: '8px' }}>✓ Comprehensive roster impact</li>
                <li style={{ marginBottom: '8px' }}>✓ Premium expert insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Individual Services */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F2EDE4',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            Individual Services
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {/* Accept/Decline */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                Accept/Decline
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Get a clear accept or decline recommendation, backed by real analysis of the trade — why it works or doesn&apos;t for your specific team and league. Not just a yes or no.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                <span style={{ color: '#6b6457' }}>Standard:</span> <strong style={{ color: '#C9A84C' }}>$3.99</strong>
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                <span style={{ color: '#6b6457' }}>Rat Rate:</span> <strong style={{ color: '#C9A84C' }}>$4.99</strong>
              </div>
            </div>

            {/* Counter Offer */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                Counter Offer
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Get a custom counter-offer suggestion based on both rosters. Requires opponent roster upload for accurate analysis.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                <span style={{ color: '#6b6457' }}>Standard:</span> <strong style={{ color: '#C9A84C' }}>$5.99</strong>
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                <span style={{ color: '#6b6457' }}>Rat Rate:</span> <strong style={{ color: '#C9A84C' }}>$6.99</strong>
              </div>
            </div>

            {/* Accept/Decline + Bonus (Most Popular) */}
            <div style={{
              border: '2px solid #C9A84C',
              padding: '32px',
              backgroundColor: '#1a1710',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#C9A84C',
                color: '#0C0A07',
                padding: '4px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}>
                Most Popular
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                Accept/Decline + Bonus
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Get your accept or decline recommendation, plus a bonus every time: if we say decline, you&apos;ll get a ready-to-send counter offer; if we say accept, you&apos;ll get expert tips on negotiating even more value and/or additional insight into making your next move. You always get the full package, no matter what we recommend.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                <span style={{ color: '#6b6457' }}>Standard:</span> <strong style={{ color: '#C9A84C' }}>$8.99</strong> <span style={{ fontSize: '0.75rem', color: '#6b6457' }}>(save $1)</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                <span style={{ color: '#6b6457' }}>Rat Rate:</span> <strong style={{ color: '#C9A84C' }}>$10.99</strong> <span style={{ fontSize: '0.75rem', color: '#6b6457' }}>(save $1)</span>
              </div>
            </div>

            {/* Full League Trade Finder */}
            <div style={{
              border: '1px solid #C9A84C',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                Full League Trade Finder
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Our most comprehensive service. Upload all league rosters, and our expert analyzes the entire league to find your best trade opportunity.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                marginBottom: '8px',
              }}>
                <span style={{ color: '#6b6457' }}>Standard:</span> <strong style={{ color: '#C9A84C' }}>$14.99</strong>
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
              }}>
                <span style={{ color: '#6b6457' }}>Rat Rate:</span> <strong style={{ color: '#C9A84C' }}>$19.99</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Finder Deep Dive */}
        <div style={{
          marginBottom: '80px',
          border: '2px solid #C9A84C',
          padding: '48px',
          backgroundColor: '#1a1710',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#C9A84C',
            marginBottom: '24px',
          }}>
            How Full League Trade Finder Works
          </h2>
          <div style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#F2EDE4',
            lineHeight: 1.8,
          }}>
            <p style={{ marginBottom: '16px' }}>
              The Full League Trade Finder is our most comprehensive analysis service, designed for managers who want to find the absolute best trade opportunity available in their league.
            </p>
            <h3 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              What You Provide:
            </h3>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>Screenshots of every team roster in your league (typically 8-12 teams)</li>
              <li style={{ marginBottom: '8px' }}>League settings (PPR, roster positions, scoring format)</li>
              <li style={{ marginBottom: '8px' }}>Your team goals (win now, rebuild, specific position needs)</li>
              <li style={{ marginBottom: '8px' }}>Any untouchable players or trade restrictions</li>
            </ul>

            <h3 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              What Our Expert Does:
            </h3>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Analyzes all team rosters</strong> to understand league-wide strengths, weaknesses, and surpluses</li>
              <li style={{ marginBottom: '8px' }}><strong>Identifies realistic trade partners</strong> based on complementary needs (teams that have what you need and need what you have)</li>
              <li style={{ marginBottom: '8px' }}><strong>Evaluates trade fairness</strong> to ensure proposals will actually be accepted</li>
              <li style={{ marginBottom: '8px' }}><strong>Considers team contexts</strong> like playoff positioning, rebuild vs win-now mode, and manager tendencies</li>
            </ul>

            <h3 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              What You Receive:
            </h3>
            <ul style={{ paddingLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}><strong>1-3 specific trade recommendations</strong> with target teams and exact players to offer/request</li>
              <li style={{ marginBottom: '8px' }}><strong>Detailed analysis</strong> of why each trade works for both sides</li>
              <li style={{ marginBottom: '8px' }}><strong>Roster impact breakdown</strong> showing how your team improves</li>
              <li style={{ marginBottom: '8px' }}><strong>Alternative targets</strong> if your first choice declines</li>
              <li style={{ marginBottom: '8px' }}><strong>Negotiation strategy</strong> to maximize your chances of acceptance</li>
            </ul>

            <p style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#0C0A07',
              border: '1px solid #2a261e',
              fontStyle: 'italic',
              color: '#6b6457',
            }}>
              This service typically takes 45-60 minutes of expert analysis time, compared to 20-30 minutes for standard evaluations. It&apos;s ideal when you know you want to make a move but aren&apos;t sure who to target or what to offer.
            </p>
          </div>
        </div>

        {/* Multi-Packs */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F2EDE4',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            Multi-Packs & Bundles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {/* 3-pack Standard Evaluations */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                3-Pack Standard Evaluations
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three trade evaluations from The Badger or The Monkey. Use throughout the season.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $12.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $2 vs individual
              </div>
            </div>

            {/* 3-pack Rat Rate Evaluations */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                3-Pack Rat Rate Evaluations
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three premium evaluations guaranteed from The Rat. Priority analysis all season.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $14.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $3 vs individual
              </div>
            </div>

            {/* 5-pack Standard */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                5-Pack Standard Evaluations
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Five trade evaluations. Best value for active traders who make multiple moves per season.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $19.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $5 vs individual
              </div>
            </div>

            {/* 5-pack Rat Rate */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                5-Pack Rat Rate Evaluations
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Five premium evaluations from The Rat. Maximum value for serious competitors.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $24.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $5 vs individual
              </div>
            </div>

            {/* 3-pack Standard Finder */}
            <div style={{
              border: '1px solid #C9A84C',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                3-Pack Standard Trade Finder
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three full league analyses. Perfect for early season, mid-season, and playoff push.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $39.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $5 vs individual
              </div>
            </div>

            {/* 3-pack Rat Rate Finder */}
            <div style={{
              border: '1px solid #C9A84C',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                3-Pack Rat Rate Trade Finder
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three premium full league analyses from The Rat. The ultimate competitive edge.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $49.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $10 vs individual
              </div>
            </div>

            {/* Mixed Standard */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                Mixed: 3 Evals + 1 Finder (Standard)
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three trade evaluations plus one full league analysis. Great all-season package.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $24.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $5 vs individual
              </div>
            </div>

            {/* Mixed Rat Rate */}
            <div style={{
              border: '1px solid #2a261e',
              padding: '32px',
              backgroundColor: '#1a1710',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '12px',
              }}>
                Mixed: 3 Evals + 1 Finder (Rat Rate)
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}>
                Three premium evaluations plus one full league analysis from The Rat. Elite package.
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                $32.99
              </div>
              <div style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
              }}>
                Save $6 vs individual
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px',
        }}>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '16px 48px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0C0A07',
              backgroundColor: '#C9A84C',
              border: 'none',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            Get Started
          </Link>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            marginTop: '16px',
          }}>
            No credit card required to sign up
          </p>
        </div>

        {/* Platform Disclaimer */}
        <div style={{
          borderTop: '1px solid #2a261e',
          paddingTop: '32px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
            lineHeight: 1.6,
          }}>
            The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform.
          </p>
        </div>
      </div>
    </div>
  )
}
