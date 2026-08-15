import Link from 'next/link'

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            color: '#6b6457',
            fontSize: '0.875rem',
          }}>
            Last Updated: August 10, 2026
          </p>
        </div>

        {/* Content */}
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          color: '#F2EDE4',
          lineHeight: 1.8,
        }}>
          {/* Introduction */}
          <section style={{ marginBottom: '40px' }}>
            <p style={{ marginBottom: '16px' }}>
              Trade Rat is committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, and safeguard your personal information when you use our fantasy football trade analysis service.
            </p>
          </section>

          {/* Section 1 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We collect the following types of information to provide and improve our service:
            </p>

            <h3 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              Personal Information
            </h3>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Name:</strong> Used to personalize your account and communications
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Email Address:</strong> Used for account creation, login,
                notifications, and customer support
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Phone Number:</strong> Optional, collected only if you opt-in
                to SMS notifications for trade analysis updates
              </li>
            </ul>

            <h3 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              Fantasy League Information
            </h3>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Team roster screenshots and league settings you submit for analysis
              </li>
              <li style={{ marginBottom: '8px' }}>
                League platform (ESPN, Yahoo, Sleeper, NFL.com, etc.)
              </li>
              <li style={{ marginBottom: '8px' }}>
                Scoring format (PPR, half-PPR, standard)
              </li>
              <li style={{ marginBottom: '8px' }}>
                Roster size and league configuration details
              </li>
              <li style={{ marginBottom: '8px' }}>
                Trade details and strategy notes you provide
              </li>
            </ul>

            <h3 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              Payment Information
            </h3>
            <p style={{ marginBottom: '16px' }}>
              Payment details are processed securely through Stripe. We do not store your credit card information
              on our servers. We receive only transaction confirmation and payment identifiers from Stripe.
            </p>

            <h3 style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#F2EDE4',
              marginTop: '24px',
              marginBottom: '12px',
            }}>
              Usage Data
            </h3>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                IP address, browser type, and device information
              </li>
              <li style={{ marginBottom: '8px' }}>
                Pages visited and features used within Trade Rat
              </li>
              <li style={{ marginBottom: '8px' }}>
                Timestamps of requests and analysis deliveries
              </li>
            </ul>
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
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We use the information we collect for the following purposes:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Provide Trade Analysis:</strong> Your league information and
                roster screenshots are reviewed by our expert analysts to deliver personalized trade recommendations
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Account Management:</strong> Email is used for login
                authentication and account security
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Notifications:</strong> We send email notifications when your
                trade analysis is complete. If you opt-in, we also send SMS notifications to your phone number
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Customer Support:</strong> Your contact information helps us
                respond to inquiries and resolve issues
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Payment Processing:</strong> Transaction data is used to manage
                package purchases, credits, and refunds
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Service Improvement:</strong> Usage data helps us understand
                how users interact with Trade Rat and identify areas for improvement
              </li>
            </ul>
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
              3. SMS Notifications
            </h2>
            <p style={{ marginBottom: '16px' }}>
              If you provide your phone number and opt-in to SMS notifications:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                We will send text messages when your trade analysis is ready
              </li>
              <li style={{ marginBottom: '8px' }}>
                You may receive occasional service updates related to your active requests
              </li>
              <li style={{ marginBottom: '8px' }}>
                Standard messaging rates from your carrier may apply
              </li>
              <li style={{ marginBottom: '8px' }}>
                You can opt-out of SMS notifications at any time by updating your account preferences or replying
                STOP to any message
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              <strong>SMS notifications are completely optional.</strong> You can use Trade Rat with email
              notifications only.
            </p>
            <p style={{ marginBottom: '16px' }}>
              Your mobile phone number is never shared, sold, or rented to third parties for marketing or advertising purposes. We only share your phone number with our SMS delivery provider (Twilio) solely to send you the text messages you have opted in to receive.
            </p>
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
              4. Data Sharing and Third Parties
            </h2>
            <div style={{
              border: '2px solid #C9A84C',
              padding: '24px',
              marginBottom: '16px',
              backgroundColor: 'rgba(201, 168, 76, 0.05)',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '12px' }}>
                We do not sell your personal data to third parties.
              </p>
              <p>
                Your information is never sold, rented, or shared with advertisers or marketing companies.
              </p>
            </div>

            <p style={{ marginBottom: '16px' }}>
              We share data only in the following limited circumstances:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Expert Analysts:</strong> Your submitted league information
                and screenshots are shared with our internal expert team solely for providing trade analysis
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Service Providers:</strong> We use trusted third-party services:
                <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
                  <li style={{ marginBottom: '4px' }}>Stripe for payment processing</li>
                  <li style={{ marginBottom: '4px' }}>Supabase for secure data storage and authentication</li>
                  <li style={{ marginBottom: '4px' }}>Vercel for hosting</li>
                  <li style={{ marginBottom: '4px' }}>SMS gateway providers (if you opt-in to text notifications)</li>
                </ul>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Legal Compliance:</strong> We may disclose information if
                required by law, court order, or government regulation
              </li>
            </ul>
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
              5. Data Security
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                All data is encrypted in transit using HTTPS/TLS
              </li>
              <li style={{ marginBottom: '8px' }}>
                Passwords are hashed and securely stored
              </li>
              <li style={{ marginBottom: '8px' }}>
                Database access is restricted to authorized personnel only
              </li>
              <li style={{ marginBottom: '8px' }}>
                Regular security audits and updates
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              While we take reasonable precautions, no online service can guarantee 100% security. You are
              responsible for maintaining the confidentiality of your account credentials.
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
              6. Data Retention
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We retain your information for the following periods:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Account information is retained while your account is active
              </li>
              <li style={{ marginBottom: '8px' }}>
                Trade analysis history is retained to allow you to access past recommendations
              </li>
              <li style={{ marginBottom: '8px' }}>
                Payment records are retained for tax and accounting purposes (typically 7 years)
              </li>
              <li style={{ marginBottom: '8px' }}>
                If you delete your account, personal data is removed within 30 days (except as required for legal compliance)
              </li>
            </ul>
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
              7. Your Privacy Rights
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You have the following rights regarding your personal data:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Access:</strong> Request a copy of the personal data we hold about you
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Correction:</strong> Update or correct inaccurate information
                through your account settings
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Deletion:</strong> Request deletion of your account and
                associated data (subject to legal retention requirements)
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Opt-Out:</strong> Unsubscribe from email or SMS notifications
                at any time
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              To exercise these rights, contact us at{' '}
              <a
                href="mailto:privacy@traderat.com"
                style={{ color: '#C9A84C', textDecoration: 'underline' }}
              >
                privacy@traderat.com
              </a>
            </p>
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
              8. Cookies and Tracking
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Trade Rat uses essential cookies to:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                Maintain your login session
              </li>
              <li style={{ marginBottom: '8px' }}>
                Remember your preferences
              </li>
              <li style={{ marginBottom: '8px' }}>
                Analyze site usage (anonymized)
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              You can disable cookies in your browser settings, but this may affect site functionality.
            </p>
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
              9. Children&apos;s Privacy
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Trade Rat is not intended for users under 18 years of age. We do not knowingly collect personal
              information from children. If we discover that a child has provided us with personal data, we will
              delete it promptly.
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
              10. Changes to This Policy
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated &quot;Last Updated&quot; date. Continued use of Trade Rat after changes are posted constitutes
              acceptance of the updated policy.
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
            <p style={{ marginBottom: '8px' }}>
              Questions or concerns about your privacy? Contact us:
            </p>
            <p style={{ marginBottom: '4px' }}>
              Email:{' '}
              <a
                href="mailto:privacy@traderat.com"
                style={{ color: '#C9A84C', textDecoration: 'underline' }}
              >
                privacy@traderat.com
              </a>
            </p>
            <p>
              General Support:{' '}
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
