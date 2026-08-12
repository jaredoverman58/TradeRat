type PricingService = {
  name: string
  standard_price: string
  rat_rate_price: string
  is_popular?: boolean
}

type PricingTableContent = {
  label: string
  services: PricingService[]
  note: string
  disclaimer: string
}

export default function PricingTableSection({ content }: { content: PricingTableContent }) {
  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#C9A84C',
          marginBottom: '48px',
        }}>
          {content.label}
        </div>

        {/* Pricing Table */}
        <div style={{
          border: '1px solid #2a261e',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            borderBottom: '1px solid #2a261e',
            backgroundColor: '#1a1710',
          }}>
            <div style={{
              padding: '16px 24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
              fontWeight: 600,
            }}>
              Service
            </div>
            <div style={{
              padding: '16px 24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
              fontWeight: 600,
              textAlign: 'center',
              borderLeft: '1px solid #2a261e',
            }}>
              Standard
            </div>
            <div style={{
              padding: '16px 24px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#6b6457',
              fontWeight: 600,
              textAlign: 'center',
              borderLeft: '1px solid #2a261e',
            }}>
              Rat Rate
            </div>
          </div>

          {/* Rows */}
          {content.services.map((service, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                borderBottom: index < content.services.length - 1 ? '1px solid #2a261e' : 'none',
                backgroundColor: service.is_popular ? '#1a1710' : 'transparent',
              }}
            >
              <div style={{
                padding: '20px 24px',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                display: 'flex',
                alignItems: 'center',
              }}>
                {service.name}
                {service.is_popular && (
                  <span style={{
                    marginLeft: '12px',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#C9A84C',
                    fontWeight: 600,
                  }}>
                    Most Popular
                  </span>
                )}
              </div>
              <div style={{
                padding: '20px 24px',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.875rem',
                color: '#F2EDE4',
                fontWeight: 600,
                textAlign: 'center',
                borderLeft: '1px solid #2a261e',
              }}>
                {service.standard_price}
              </div>
              <div style={{
                padding: '20px 24px',
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '0.875rem',
                color: '#C9A84C',
                fontWeight: 600,
                textAlign: 'center',
                borderLeft: '1px solid #2a261e',
              }}>
                {service.rat_rate_price}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.875rem',
          color: '#6b6457',
          fontStyle: 'italic',
          marginTop: '24px',
          marginBottom: '48px',
        }}>
          {content.note}
        </p>

        {/* Disclaimer */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.75rem',
          color: '#6b6457',
          lineHeight: 1.6,
        }}>
          {content.disclaimer}
        </p>
      </div>
    </section>
  )
}
