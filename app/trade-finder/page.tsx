import NavBar from '@/app/landing/NavBar'
import TradeFinderSection from '@/app/landing/TradeFinderSection'

export default function TradeFinderPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A07' }}>
      <NavBar />
      {/* Add top padding to account for fixed navbar */}
      <div style={{ paddingTop: '80px' }}>
        <TradeFinderSection />
      </div>
    </div>
  )
}
