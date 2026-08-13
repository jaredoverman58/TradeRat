// CSV Export Utility Functions

/**
 * Converts an array of objects to CSV format
 */
export function arrayToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV rows
  const csvRows = [
    // Header row
    headers.map(escapeCSVValue).join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => escapeCSVValue(row[header])).join(',')
    )
  ]

  return csvRows.join('\n')
}

/**
 * Escapes a value for CSV format (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return ''

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Triggers a browser download of CSV data
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Formats a date to YYYY-MM-DD format for filenames
 */
export function getDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
