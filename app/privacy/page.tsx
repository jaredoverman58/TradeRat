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
            Last Updated: September 5, 2026
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
              This Privacy Policy explains how Jared Overman, a sole proprietor doing business as Trade Rat
              (&quot;Trade Rat,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), collects, uses, discloses,
              and retains personal information when you use trade-rat.vercel.app and our fantasy football trade
              advisory service.
            </p>
          </section>

          {/* Geographic Scope */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
              marginBottom: '16px',
            }}>
              Geographic Scope
            </h2>
            <p style={{ marginBottom: '16px' }}>
              This Privacy Policy and our data practices are designed for users located in the United States.
              TradeRat does not intend to target or actively collect personal information from individuals located
              outside the United States, and this Policy is not designed to satisfy the legal requirements of any
              jurisdiction other than the United States, including the EU or UK GDPR.
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
              We collect information: (a) directly from you when you create an account, purchase credits, contact
              us, or submit a request; (b) automatically through cookies and similar technologies; and (c) from
              service providers such as Stripe when they confirm a transaction or refund.
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
                to SMS notifications for trade analysis updates. SMS notifications are not currently active as part
                of the Service. This section will apply once SMS-based communications are enabled, at which point
                separate consent will be obtained.
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
              Stripe collects and processes payment-card information on our behalf. Trade Rat does not directly
              receive or store complete card numbers or card security codes. We receive limited transaction
              information from Stripe, which may include payment status, transaction identifiers, billing contact
              information, card type, expiration information, and the last four digits of the card.
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
                trade analysis is complete. If you opt-in, we also send SMS notifications to your phone number. SMS
                notifications are not currently active as part of the Service. This section will apply once SMS-based
                communications are enabled, at which point separate consent will be obtained.
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
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Security and Fraud Prevention:</strong> Authenticate users,
                detect suspicious activity, protect accounts, and investigate payment disputes
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Legal and Contractual Purposes:</strong> Enforce our Terms,
                maintain required records, comply with legal obligations, and establish or defend legal claims
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Communications:</strong> Send service-related notices, security
                alerts, purchase confirmations, and responses to customer requests
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
            <p style={{ marginBottom: '16px', fontWeight: 600, color: '#C9A84C' }}>
              SMS notifications are not currently active as part of the Service. This section will apply once
              SMS-based communications are enabled, at which point separate consent will be obtained.
            </p>
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
                <strong style={{ color: '#C9A84C' }}>Service Providers:</strong> We disclose personal information
                to service providers that process it on our behalf, including Stripe for payment processing,
                Supabase for authentication and data storage, Vercel for hosting and infrastructure, and other
                vendors used for security, communications, analytics, and customer support. These providers may
                use the information only to provide contracted services or as otherwise permitted by law.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#C9A84C' }}>Legal Compliance:</strong> We may disclose information if
                required by law, court order, or government regulation
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              We may also disclose information:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>
                In connection with a merger, financing, acquisition, reorganization, bankruptcy, or sale of all
                or part of our business or assets
              </li>
              <li style={{ marginBottom: '8px' }}>
                When reasonably necessary to investigate fraud, security incidents, violations of our Terms, or
                threats to users or the Service
              </li>
              <li style={{ marginBottom: '8px' }}>
                With your direction or consent
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
              We use reasonable administrative, technical, and organizational safeguards designed to protect
              personal information, including encrypted transmission, access controls, and secure authentication
              practices where appropriate. No transmission or storage system is completely secure, and we cannot
              guarantee that unauthorized access, loss, or misuse will never occur. You are responsible for
              protecting your account credentials and notifying us promptly of suspected unauthorized access.
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
              We retain personal information only for as long as reasonably necessary for the purposes described
              in this Policy, including providing accounts and purchased services, maintaining transaction and tax
              records, resolving disputes, enforcing agreements, and complying with law.
            </p>
            <p style={{ marginBottom: '16px' }}>
              When an account is deleted, we will delete or de-identify associated personal information within a
              commercially reasonable period unless retention is required or permitted for legal, security,
              fraud-prevention, accounting, backup, or dispute-resolution purposes. Information in routine backups
              will be deleted or overwritten according to our normal backup cycle.
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
              Depending on where you reside, applicable law may provide rights to access, correct, delete, or
              obtain a portable copy of personal information and to appeal our response to a request. We may
              verify your identity before processing a request and may deny or limit a request where permitted
              by law. We will not unlawfully discriminate against you for exercising a privacy right.
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
                at any time. SMS notifications are not currently active as part of the Service. This section will
                apply once SMS-based communications are enabled, at which point separate consent will be obtained.
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              Trade Rat does not sell personal information or share it for cross-context behavioral advertising.
              Accordingly, we do not presently offer a sale or targeted-advertising opt-out. If our practices
              change, we will update this Policy and provide any legally required opt-out method.
            </p>
            <p style={{ marginBottom: '16px' }}>
              To submit a request, email{' '}
              <a
                href="mailto:privacy@traderat.com"
                style={{ color: '#C9A84C', textDecoration: 'underline' }}
              >
                privacy@traderat.com
              </a>
              {' '}and provide sufficient information to identify your account and describe the request. We will
              use personal information submitted with the request only to verify identity and process the request.
              Where required by law, an authorized agent may submit a request after providing proof of authorization.
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
