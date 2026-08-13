'use client'

import { arrayToCSV, downloadCSV, getDateString } from '@/lib/csvExport'

type BundleWithEmail = {
  purchased_at: string
  user_email: string
  bundle_type: string
  amount: number
  status: string
}

export default function PaymentsExportButton({ bundles }: { bundles: BundleWithEmail[] }) {
  const handleExport = () => {
    const csvData = bundles.map(bundle => ({
      'Purchase Date': new Date(bundle.purchased_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'User Email': bundle.user_email,
      'Bundle Type': bundle.bundle_type,
      'Amount': `$${bundle.amount.toFixed(2)}`,
      'Status': bundle.status,
    }))

    const csvContent = arrayToCSV(csvData)
    const filename = `payments-export-${getDateString()}.csv`
    downloadCSV(csvContent, filename)
  }

  return (
    <button
      onClick={handleExport}
      disabled={bundles.length === 0}
      style={{
        fontFamily: 'var(--font-dm-sans)',
        padding: '12px 24px',
        backgroundColor: bundles.length === 0 ? '#2a261e' : '#C9A84C',
        color: bundles.length === 0 ? '#6b6457' : '#0C0A07',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.875rem',
        border: 'none',
        cursor: bundles.length === 0 ? 'not-allowed' : 'pointer',
      }}
    >
      Export CSV
    </button>
  )
}
