import Link from 'next/link'

type ServiceCard = {
  title: string
  description: string
  price: string
}

type ServicesContent = {
  label: string
  cards: ServiceCard[]
  cta_text: string
  cta_link: string
}

export default function ServicesSection({ content }: { content: ServicesContent }) {
  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid #2a261e',
    }}>
      <div style={{
        maxWidth: '1200px',
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginBottom: '64px',
        }}>
          {content.cards.map((card, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #2a261e',
                padding: '32px 24px',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F2EDE4',
                marginBottom: '16px',
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.875rem',
                color: '#6b6457',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}>
                {card.description}
              </p>
              <div style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#C9A84C',
              }}>
                {card.price}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
        }}>
          <Link
            href={content.cta_link}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              padding: '16px 40px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#C9A84C',
              color: '#0C0A07',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.875rem',
            }}
          >
            {content.cta_text}
          </Link>
        </div>
      </div>
    </section>
  )
}
