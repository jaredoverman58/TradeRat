import Link from 'next/link'

export default function WhyTheRatSeesWhatAlgorithmsMissPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '60px' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block',
            }}
          >
            ← Back to Home
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}>
            Why The Rat Sees What Algorithms Miss
          </h1>
        </div>

        {/* Article Body */}
        <article style={{
          fontFamily: 'var(--font-dm-sans)',
          color: '#F2EDE4',
          lineHeight: 1.8,
          fontSize: '1.0625rem',
        }}>
          <p style={{ marginBottom: '24px' }}>
            Every algorithm in fantasy football is built on the same assumption: that value is static.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Plug in a player&apos;s stats, run the numbers, spit out a grade. Accept if the score is positive. Decline if it isn&apos;t. Clean. Simple. Wrong.
          </p>

          <p style={{ marginBottom: '24px' }}>
            I&apos;ve watched The Rat work for a long time. Long enough to know that what he does isn&apos;t analysis in the traditional sense. It&apos;s something closer to instinct — sharpened over years of obsessive study into something that looks, from the outside, almost like a sixth sense.
          </p>

          <p style={{ marginBottom: '24px' }}>
            I&apos;ve seen him take a roster that looked cooked by Week 4 — the kind of draft-day disaster that sends most managers into rebuild mode — and turn it into a legitimate title contender by November. More than once. Not by luck. Not by waiver wire fortune. By identifying the exact moment another manager&apos;s confidence cracked, and making the trade that nobody else saw coming.
          </p>

          <p style={{ marginBottom: '24px' }}>
            That&apos;s what separates The Rat from every algorithm you&apos;ve ever used.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Algorithms are built on historical data. They tell you what a player is worth based on what he&apos;s done. The Rat tells you what a player is worth to the specific person you&apos;re negotiating with, right now. That&apos;s a completely different question — and it&apos;s the one that actually wins trades.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Here&apos;s what the algorithm doesn&apos;t know. It doesn&apos;t know that the manager rostering Ja&apos;Marr Chase is three games into a four-game losing streak and quietly panicking. It doesn&apos;t know the guy rostering James Cook is about to hit his bye week with two injuries on his roster and needs more depth than he needs upside. It doesn&apos;t realize that desperation has a price — The Rat senses when someone is paying it.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Where most analysts see a fair exchange, The Rat finds the soft spot. The offer that looks balanced on paper but tilts heavily in your favor once you understand the psychology behind it.
          </p>

          <p style={{ marginBottom: '24px' }}>
            Fantasy football trades aren&apos;t just about players — they&apos;re about people. People who are competitive, emotional, and almost always playing from a place of either confidence or fear. The best trade isn&apos;t the one with the highest projected points return. It&apos;s the one that exploits the gap between what your opponent thinks their roster is worth and what it actually is — given their record, their desperation, their blind spots, and their ego.
          </p>

          <p style={{ marginBottom: '24px' }}>
            That gap is where The Rat lives.
          </p>

          <p style={{ marginBottom: '40px' }}>
            When you submit a trade to The Rat, you&apos;re not getting a grade. You&apos;re getting the honest read of someone who has spent years learning exactly how fantasy managers think.
          </p>

          {/* Call to Action */}
          <div style={{
            marginTop: '60px',
            paddingTop: '40px',
            borderTop: '1px solid #2a261e',
            textAlign: 'center',
          }}>
            <Link
              href="/pricing"
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
              Get Started
            </Link>
            <p style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              marginTop: '24px',
            }}>
              Your first evaluation is free
            </p>
          </div>
        </article>

        {/* Bottom Back Link */}
        <div style={{
          marginTop: '80px',
          paddingTop: '40px',
          borderTop: '1px solid #2a261e',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#6b6457',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
