'use client'

import BundlePurchaseButton from './BundlePurchaseButton'
import { BUNDLES } from '@/lib/bundles'

// Component displaying all 7 bundle purchase options
// Can be imported into dashboard for testing or as a pricing display
export default function AllBundlesSection() {
  return (
    <div style={{
      fontFamily: 'var(--font-dm-sans)',
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '2rem',
        color: '#C9A84C',
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        Purchase Bundles
      </h2>

      {/* Multi-Credit Accept/Decline Bundles */}
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '24px',
        }}>
          Accept/Decline Bundles
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          <BundleCard bundle={BUNDLES.STANDARD_3_PACK} />
          <BundleCard bundle={BUNDLES.RAT_RATE_3_PACK} />
          <BundleCard bundle={BUNDLES.STANDARD_5_PACK} />
          <BundleCard bundle={BUNDLES.RAT_RATE_5_PACK} />
        </div>
      </section>

      {/* Bonus Bundles */}
      <section style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '24px',
        }}>
          Accept/Decline + Bonus
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          <BundleCard bundle={BUNDLES.ACCEPT_DECLINE_BONUS_STANDARD} />
          <BundleCard bundle={BUNDLES.ACCEPT_DECLINE_BONUS_RAT_RATE} />
        </div>
      </section>

      {/* Counter Offer Bundles */}
      <section>
        <h3 style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.875rem',
          color: '#C9A84C',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '24px',
        }}>
          Counter Offer
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          <BundleCard bundle={BUNDLES.COUNTER_OFFER_STANDARD} />
          <BundleCard bundle={BUNDLES.COUNTER_OFFER_RAT_RATE} />
        </div>
      </section>
    </div>
  )
}

function BundleCard({ bundle }: { bundle: typeof BUNDLES.STANDARD_3_PACK }) {
  return (
    <div style={{
      backgroundColor: '#1a1714',
      border: '1px solid #2a261e',
      borderRadius: '8px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div>
        <h4 style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#F2EDE4',
          marginBottom: '8px',
        }}>
          {bundle.name}
        </h4>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          marginBottom: '12px',
        }}>
          {bundle.description}
        </p>
        <div style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '0.75rem',
          color: '#6b6457',
        }}>
          {bundle.credits} {bundle.credits === 1 ? 'credit' : 'credits'} • {bundle.serviceType.replace('_', ' ')}
        </div>
      </div>
      <BundlePurchaseButton
        bundleType={bundle.bundleType}
        serviceType={bundle.serviceType}
        price={bundle.price}
        name={bundle.name}
        description={bundle.description}
        buttonText={bundle.buttonText}
      />
    </div>
  )
}
