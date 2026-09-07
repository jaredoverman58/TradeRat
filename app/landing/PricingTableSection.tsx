import styles from './PricingTableSection.module.css'

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
          <div className={`${styles.pricingGrid} ${styles.pricingGridHeader}`}>
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
            <div className={styles.mobileHideHeader} style={{
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
            <div className={styles.mobileHideHeader} style={{
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
              <span style={{ display: 'none' }}>Rat Rate</span>
              <span style={{ display: 'inline' }}>Rat</span>
            </div>
          </div>

          {/* Rows */}
          {content.services.map((service, index) => {
            const isLast = index === content.services.length - 1
            const rowClasses = [
              styles.pricingGrid,
              isLast ? styles.pricingGridRowLast : styles.pricingGridRow,
              service.is_popular ? styles.pricingGridRowPopular : ''
            ].filter(Boolean).join(' ')

            return (
              <div key={index} className={rowClasses}>
                <div style={{
                  padding: '20px 24px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.875rem',
                  color: '#F2EDE4',
                }}>
                  <div>{service.name}</div>
                  {service.is_popular && (
                    <div style={{
                      marginTop: '4px',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.75rem',
                      color: '#C9A84C',
                      fontStyle: 'italic',
                    }}>
                      Decline gets a counter. Accept gets an edge.
                    </div>
                  )}
                </div>
                <div
                  className={styles.mobilePriceCell}
                  data-label="Standard:"
                  style={{
                    padding: '20px 24px',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.875rem',
                    color: '#F2EDE4',
                    fontWeight: 600,
                    textAlign: 'center',
                    borderLeft: '1px solid #2a261e',
                  }}
                >
                  {service.standard_price}
                </div>
                <div
                  className={styles.mobilePriceCell}
                  data-label="Rat Rate:"
                  style={{
                    padding: '20px 24px',
                    fontFamily: 'var(--font-dm-mono)',
                    fontSize: '0.875rem',
                    color: '#C9A84C',
                    fontWeight: 600,
                    textAlign: 'center',
                    borderLeft: '1px solid #2a261e',
                  }}
                >
                  {service.rat_rate_price}
                </div>
              </div>
            )
          })}
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
