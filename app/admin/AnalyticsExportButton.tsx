'use client'

import { arrayToCSV, downloadCSV, getDateString } from '@/lib/csvExport'

type RatingData = {
  thumbs_up: boolean
  created_at: string
}

type ResponseTimeData = {
  service_type: string
  created_at: string
  delivered_at: string | null
  response_time_hours: number
}

type AnalyticsExportData = {
  ratings: RatingData[]
  responseTimes: ResponseTimeData[]
  averageResponseTime: number
  thumbsUpPercentage: number
}

export default function AnalyticsExportButton({ data }: { data: AnalyticsExportData }) {
  const handleExport = () => {
    // Combine ratings and response time data into separate sections
    const ratingsCsvData = data.ratings.map(rating => ({
      'Date': new Date(rating.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'Rating': rating.thumbs_up ? 'Thumbs Up' : 'Thumbs Down',
    }))

    const responseTimesCsvData = data.responseTimes.map(item => ({
      'Service Type': item.service_type,
      'Submitted Date': new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'Delivered Date': item.delivered_at
        ? new Date(item.delivered_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A',
      'Response Time (Hours)': item.response_time_hours.toFixed(1),
    }))

    // Create summary data
    const summaryData = [
      {
        'Metric': 'Average Response Time',
        'Value': `${data.averageResponseTime.toFixed(1)} hours`,
      },
      {
        'Metric': 'Thumbs Up Percentage',
        'Value': `${data.thumbsUpPercentage.toFixed(1)}%`,
      },
      {
        'Metric': 'Total Ratings',
        'Value': data.ratings.length.toString(),
      },
      {
        'Metric': 'Total Completed Submissions',
        'Value': data.responseTimes.length.toString(),
      },
    ]

    // Combine all sections into one CSV with headers
    const summarySection = 'SUMMARY\n' + arrayToCSV(summaryData)
    const ratingsSection = '\n\nRATINGS\n' + arrayToCSV(ratingsCsvData)
    const responseTimesSection = '\n\nRESPONSE TIMES\n' + arrayToCSV(responseTimesCsvData)

    const csvContent = summarySection + ratingsSection + responseTimesSection
    const filename = `analytics-export-${getDateString()}.csv`
    downloadCSV(csvContent, filename)
  }

  return (
    <button
      onClick={handleExport}
      style={{
        fontFamily: 'var(--font-dm-sans)',
        padding: '12px 24px',
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
      Export CSV
    </button>
  )
}
