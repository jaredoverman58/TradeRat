'use client'

interface BuyConfirmationModalProps {
  variant: 'landing' | 'pricing'
  serviceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
  tier: 'standard' | 'rat'
  price: number
  credits?: number
  name?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function BuyConfirmationModal({
  variant,
  serviceType,
  tier,
  price,
  credits,
  name,
  onConfirm,
  onCancel,
}: BuyConfirmationModalProps) {
  // Service name mapping (fallback if no name prop provided)
  const serviceNames = {
    accept_decline: 'Accept/Decline',
    counter_offer: 'Counter Offer',
    bundle: 'Accept/Decline + Bonus',
    trade_finder: 'Trade Finder',
  }

  const serviceName = name || serviceNames[serviceType]

  // Turnaround language (verbatim) - service-aware for guarantee time
  const getTurnaroundText = () => {
    const baseText = "The Rat works while your league sleeps — most active 10 PM to 5 AM Mountain Time. Standard experts are available throughout the day and evening. We know your trade window won't wait — we always aim to respond as quickly as possible, often within a few hours. Response times may vary — but your analysis is always guaranteed within "

    if (serviceType === 'trade_finder') {
      return baseText + "48 hours."
    }
    return baseText + "24 hours."
  }

  const turnaroundText = getTurnaroundText()

  // Bullet content by service type
  const getBullets = () => {
    const tierBullet = tier === 'rat'
      ? 'Reviewed personally by The Rat'
      : 'Reviewed personally by one of our trade experts'

    switch (serviceType) {
      case 'accept_decline':
        return [
          tierBullet,
          'Clear Accept/Decline verdict on your trade offer',
          'Reasoning behind the analysis',
          'Written and/or audio response you can reference anytime',
        ]

      case 'counter_offer':
        return [
          tierBullet,
          'A built counter offer designed to close, not just a suggestion',
          'Full reasoning on why this counter makes sense for both sides',
          'Opponent roster factored into the ask',
        ]

      case 'bundle':
        return [
          tierBullet,
          'Clear Accept/Decline verdict on your trade offer',
          'Decline? You get a built counter offer. Accept? You get negotiation tips and insight into your next move.',
          'Full written and/or audio analysis',
        ]

      case 'trade_finder':
        return [
          tierBullet,
          'Every roster in your league analyzed, not just the trade in front of you',
          'Your single best available move identified',
          'Up to 2 backup trade options, in case your first target says no',
          'Reasoning behind your top target, so you have what you need to help pitch and close the deal',
          'Most responses within 8 hours — guaranteed within 48',
        ]

      default:
        return []
    }
  }

  // Trade Finder extra paragraph (landing variant only) - tier-aware
  const getTradeFinderParagraph = () => {
    if (tier === 'rat') {
      return "Upload all rosters → The Rat analyzes everything → your best move plus up to 2 backup options → reasoning you can use to pitch and close → most responses within 8 hours, guaranteed within 48"
    }
    return "Upload all rosters → Your assigned expert analyzes everything → your best move plus up to 2 backup options → reasoning you can use to pitch and close → most responses within 8 hours, guaranteed within 48"
  }

  const tradeFinderParagraph = getTradeFinderParagraph()

  const bullets = getBullets()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#1a1816',
          border: '1px solid #2a261e',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Service Name */}
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#F2EDE4',
            marginBottom: '8px',
          }}
        >
          {serviceName}
        </h2>

        {/* Price and Credits combined */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#C9A84C',
            }}
          >
            ${price.toFixed(2)}
            {credits && credits > 1 && (
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  color: '#6b6457',
                  marginLeft: '12px',
                }}
              >
                • {credits} credits
              </span>
            )}
          </div>
        </div>

        {/* Landing variant: Full bullets */}
        {variant === 'landing' && (
          <>
            <div
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#F2EDE4',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              What&apos;s Included:
            </div>

            <ul
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                lineHeight: 1.7,
                marginBottom: '24px',
                paddingLeft: '20px',
                listStyleType: 'disc',
              }}
            >
              {/* Trade Finder: show only first 5 bullets (6th is covered by extra paragraph) */}
              {(serviceType === 'trade_finder' ? bullets.slice(0, 5) : bullets).map((bullet, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {bullet}
                </li>
              ))}
            </ul>

            {/* Trade Finder extra paragraph (landing variant only) */}
            {serviceType === 'trade_finder' && (
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#F2EDE4',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                }}
              >
                {tradeFinderParagraph}
              </p>
            )}
          </>
        )}

        {/* Pricing variant: Trade Finder gets 4th bullet only */}
        {variant === 'pricing' && serviceType === 'trade_finder' && (
          <div
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              color: '#F2EDE4',
              lineHeight: 1.7,
              marginBottom: '24px',
              paddingLeft: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: '#C9A84C', marginRight: '12px', flexShrink: 0 }}>•</span>
              <span>{bullets[5]}</span>
            </div>
          </div>
        )}

        {/* Turnaround language (shared in both variants) */}
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.875rem',
            color: '#6b6457',
            lineHeight: 1.7,
            marginBottom: '32px',
            fontStyle: 'italic',
          }}
        >
          {turnaroundText}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Continue to Checkout
          </button>

          <button
            onClick={onCancel}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              backgroundColor: 'transparent',
              color: '#F2EDE4',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
              border: '1px solid #2a261e',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
