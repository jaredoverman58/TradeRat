'use client'

import Link from 'next/link'
import BundlePurchaseButton from '@/app/dashboard/BundlePurchaseButton'

export default function TradeFinderSection() {
  return (
    <section id="trade-finder" style={{
      padding: '80px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Section Label */}
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#C9A84C',
          marginBottom: '48px',
        }}>
          TRADE FINDER
        </div>

        <div style={{
          border: '2px solid #C9A84C',
          padding: '48px',
          backgroundColor: '#0C0A07',
        }}>
          {/* Headline */}
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '32px',
            lineHeight: 1.3,
          }}>
            Most trade advice starts with the trade on the table. Ours starts with your entire league.
          </h2>

          {/* Explanation */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#F2EDE4',
            lineHeight: 1.7,
            marginBottom: '32px',
          }}>
            You tell us the platform. You upload every roster. We do the rest. Our expert combs through every team in your league — their strengths, their weaknesses, their bye week exposure, and all the other variables your opponents are sleeping on — and identifies the single best trade opportunity available to you right now. Not a grade on a trade someone else proposed. A specific target. A specific offer. And exactly why it works.
          </p>

          {/* Checkmarks */}
          <div style={{
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              lineHeight: 1.8,
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: '#C9A84C', marginRight: '12px', flexShrink: 0 }}>✓</span>
                <span>The player you should be targeting — and why</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: '#C9A84C', marginRight: '12px', flexShrink: 0 }}>✓</span>
                <span>What to offer that gives you the best chance of getting it done</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: '#C9A84C', marginRight: '12px', flexShrink: 0 }}>✓</span>
                <span>A full breakdown of how the trade improves your roster</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ color: '#C9A84C', marginRight: '12px', flexShrink: 0 }}>✓</span>
                <span>Additional insight: your opponent&apos;s likely motivation, what you should do next, and any other helpful suggestions our experts can conjure up</span>
              </div>
            </div>
          </div>

          {/* Trade Finder Value Proposition */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '1rem',
            color: '#F2EDE4',
            lineHeight: 1.7,
            marginBottom: '32px',
          }}>
            Every Trade Finder analysis comes with more than one answer. You&apos;ll get your expert&apos;s top recommendation — plus up to 2 backup options in case your first target says no — along with the reasoning behind it, so you have what you need to help pitch and close the deal.
          </p>

          {/* Free Credit Banner */}
          <div style={{
            border: '2px solid #C9A84C',
            padding: '16px 24px',
            backgroundColor: '#1a1710',
            marginBottom: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#C9A84C',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '8px',
            }}>
              BONUS
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#C9A84C',
              textAlign: 'center',
              margin: 0,
            }}>
              Free Accept/Decline credit included with every Trade Finder purchase — save it for whenever you need it.
            </p>
          </div>

          {/* Buy Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <BundlePurchaseButton
              bundleType="standard_3_pack"
              serviceType="trade_finder"
              credits={1}
              price={16.99}
              name="Trade Finder Standard"
              description="Full league analysis by standard analyst"
              buttonText="Buy Standard — $16.99"
            />
            <BundlePurchaseButton
              bundleType="rat_rate_3_pack"
              serviceType="trade_finder"
              credits={1}
              price={19.99}
              name="Trade Finder Rat Rate"
              description="Full league analysis by The Rat"
              buttonText="Buy Rat Rate — $19.99"
            />
          </div>

          {/* Rat Rate Note */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: '#6b6457',
            fontStyle: 'italic',
            marginBottom: '24px',
          }}>
            Rat Rate submissions are reviewed personally by The Rat.
          </p>

          {/* Article Link */}
          <Link
            href="/article/why-the-rat-sees-what-algorithms-miss"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#C9A84C',
              textDecoration: 'none',
              display: 'inline-block',
              padding: '12px 24px',
              border: '1px solid #C9A84C',
              transition: 'all 0.2s ease',
            }}
          >
            Read: Why The Rat Sees What Algorithms Miss →
          </Link>
        </div>
      </div>
    </section>
  )
}
