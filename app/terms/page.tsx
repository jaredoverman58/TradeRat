import Link from 'next/link'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
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
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#F2EDE4',
            marginBottom: '16px',
          }}>
            Terms of Service
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '0.875rem',
          }}>
            Last Updated: September 5, 2026
          </p>
        </div>

        {/* Content */}
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          color: '#F2EDE4',
          lineHeight: 1.8,
        }}>
          {/* Section 1 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              By accessing and using Trade Rat, you accept and agree to be bound by these Terms of Service.
              By creating an account, clicking &quot;I Agree,&quot; purchasing a package, or using the Services,
              you acknowledge that you have read and agree to these Terms and the Privacy Policy. If you do not
              agree, you may not use the Services.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              2. Age and Eligibility
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You must be at least 18 years old and legally capable of entering into a binding contract to
              create an account, purchase a package, or use the Services.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              3. Service Description
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Trade Rat provides fantasy football trade analysis and recommendations through our expert analyst system.
              We offer two types of services:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Trade Evaluation:</strong> Expert review of specific trade offers
                you&apos;ve received, with accept/decline/counter recommendations
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Trade Finder:</strong> Comprehensive league analysis with custom
                trade suggestions created by our experts
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              4. The Expert System
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Our analysis is provided by a team of fantasy football experts operating under three tiers:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>The Trade Rat:</strong> Premium tier analyst with guaranteed assignment
                for premium packages
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>The Badger:</strong> Mid-tier expert analyst
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>The Monkey:</strong> Entry-level expert analyst
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              Standard packages will be assigned to any available expert based on capacity and queue status.
              Premium packages guarantee assignment to The Trade Rat.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Analyst tiers reflect Trade Rat&apos;s internal service levels and assignment process only. They do
              not represent professional certifications or guarantee any particular accuracy, result, or
              fantasy-sports outcome.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              5. Payment Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              All payments are processed securely through Stripe. By purchasing a package, you agree to the following:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Packages are purchased with a specific number of credits for trade analysis requests
              </li>
              <li style={{ marginBottom: '8px' }}>
                Credits can be used at any time during the fantasy football season
              </li>
              <li style={{ marginBottom: '8px' }}>
                Paid credits expire on the specific expiration date displayed at checkout and in the purchase
                confirmation. Promotional or complimentary credits may be subject to different expiration terms
                disclosed when issued.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Credits are non-transferable and non-refundable except as specified in our refund policy
              </li>
              <li style={{ marginBottom: '8px' }}>
                Prices are subject to change, but purchases are honored at the price paid at time of transaction
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              Payments are processed by Stripe, a third-party payment processor, and may be subject to
              Stripe&apos;s applicable terms and privacy policy. Trade Rat does not directly store complete
              payment-card numbers or security codes. By submitting payment information, you authorize Trade Rat
              and Stripe to charge the displayed purchase price and applicable taxes to your selected payment method.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              6. Turnaround Time and Refund Policy
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We strive to deliver all trade analysis within 24-48 hours of submission. Our refund policy:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                If analysis is delivered beyond 48 hours from submission, a full refund will be issued
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Exception:</strong> If you submit a request within 48 hours of your league{"'"}s trade deadline,
                no refund will be issued for late delivery due to insufficient time buffer
              </li>
              <li style={{ marginBottom: '8px' }}>
                You are responsible for knowing your league{"'"}s trade deadline dates
              </li>
              <li style={{ marginBottom: '8px' }}>
                Refunds are processed to the original payment method within 5-10 business days
              </li>
              <li style={{ marginBottom: '8px' }}>
                Free evaluations are not subject to the guaranteed turnaround times or refund policy above — we aim to respond as quickly as possible, but no specific timeframe or refund applies to free evaluations.
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              The 48-hour period begins when Trade Rat receives a complete submission containing all information
              reasonably necessary to conduct the analysis. Analysis is considered delivered when it is made
              available through the user&apos;s account or sent to the user&apos;s registered email address. All
              deadlines are calculated using Eastern Time.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              7. Disclaimers and Limitations
            </h2>
            <div style={{
              border: '2px solid #C9A84C',
              padding: '24px',
              marginBottom: '16px',
              backgroundColor: 'rgba(201, 168, 76, 0.05)',
            }}>
              <p style={{ marginBottom: '16px', fontWeight: 600 }}>
                IMPORTANT: Trade advice provided by Trade Rat experts is not guaranteed to result in successful
                fantasy outcomes.
              </p>
              <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  All analysis is based on expert opinion and available information at the time of review
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Fantasy football involves inherent unpredictability including injuries, performance variance, and
                  unforeseen events
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Trade Rat is not responsible for any losses, missed playoff opportunities, or championship defeats
                  resulting from following our advice
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Final trade decisions rest solely with you, the fantasy manager
                </li>
              </ul>
              <p style={{ fontWeight: 700 }}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES AND ANALYSIS ARE PROVIDED &quot;AS IS&quot;
                AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND. TRADE RAT DOES NOT WARRANT THAT ANY
                ANALYSIS WILL BE ACCURATE, COMPLETE, ERROR-FREE, OR SUCCESSFUL. TRADE RAT WILL NOT BE LIABLE FOR
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. TRADE RAT&apos;S TOTAL LIABILITY
                WILL NOT EXCEED THE AMOUNT PAID FOR THE PACKAGE GIVING RISE TO THE CLAIM.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              8. User Responsibilities
            </h2>
            <p style={{ marginBottom: '16px' }}>
              When using Trade Rat, you agree to:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Provide accurate and complete information about your league settings and roster details
              </li>
              <li style={{ marginBottom: '8px' }}>
                Upload clear, legible screenshots of team rosters
              </li>
              <li style={{ marginBottom: '8px' }}>
                Use the service only for personal fantasy football advice
              </li>
              <li style={{ marginBottom: '8px' }}>
                Not resell, redistribute, or commercially exploit our expert analysis
              </li>
              <li style={{ marginBottom: '8px' }}>
                Maintain the confidentiality of your account credentials
              </li>
            </ul>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              9. Intellectual Property
            </h2>
            <p style={{ marginBottom: '16px' }}>
              All trade analysis, expert commentary, audio content, and written recommendations provided through
              Trade Rat remain our intellectual property. You may use this advice for your personal fantasy leagues
              but may not reproduce, distribute, or commercially exploit our content.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              10. User Submissions
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You retain ownership of materials you submit. You grant Trade Rat a limited, nonexclusive license
              to host, copy, process, and use those materials solely to provide, secure, support, and improve
              the Services. You represent that you have the right to submit the materials and that they do not
              violate another person&apos;s privacy, confidentiality, or intellectual-property rights.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              11. Termination
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We reserve the right to suspend or terminate accounts that violate these terms, abuse the service,
              or engage in fraudulent activity. If an account is terminated for fraud, unlawful activity, payment
              disputes, or a material breach of these Terms, unused credits may be forfeited to the extent
              permitted by law. If Trade Rat terminates an account for convenience or discontinues the Services,
              Trade Rat will refund the prorated value of unused paid credits.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              12. Changes to Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We may update these Terms of Service from time to time. Continued use of Trade Rat after changes
              are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              13. Governing Law and Disputes
            </h2>
            <p style={{ marginBottom: '16px' }}>
              These Terms are governed by the laws of the State of Wyoming. Any legal proceeding relating to
              these Terms or the Services must be brought in the state or federal courts located in Campbell
              County, Wyoming, and each party consents to their jurisdiction and venue.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              14. General Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              These Terms and the Privacy Policy constitute the entire agreement concerning the Services. If any
              provision is found unenforceable, the remaining provisions remain effective. Failure to enforce a
              provision is not a waiver. Users may not assign these Terms without Trade Rat&apos;s written consent.
              Trade Rat may assign these Terms in connection with a merger, reorganization, financing, or sale of
              its business.
            </p>
          </section>

          {/* Contact */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              Contact Us
            </h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a
                href="mailto:support@traderat.com"
                style={{ color: '#C9A84C', textDecoration: 'underline' }}
              >
                support@traderat.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
