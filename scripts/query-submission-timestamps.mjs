import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const NUCLEAR_DELETE_TIMESTAMP = '2026-08-29T15:20:23.000Z'

async function querySubmissionTimestamps() {
  console.log('\n=== Submission Timestamp Analysis ===\n')
  console.log(`Nuclear Delete Timestamp: ${NUCLEAR_DELETE_TIMESTAMP}\n`)

  // Get 5 most recent submissions
  console.log('Query 1: SELECT id, created_at FROM submissions ORDER BY created_at DESC LIMIT 5;\n')
  const { data: newest, error: error1 } = await supabase
    .from('submissions')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error1) {
    console.error('Error querying newest submissions:', error1)
  } else {
    console.log('5 Most Recent Submissions (newest first):')
    newest.forEach((row, index) => {
      const createdAt = row.created_at
      const isAfter = new Date(createdAt) > new Date(NUCLEAR_DELETE_TIMESTAMP)
      console.log(`  ${index + 1}. ID: ${row.id.substring(0, 8)}... | Created: ${createdAt} ${isAfter ? '✓ AFTER delete' : '✗ BEFORE delete'}`)
    })
  }

  console.log('\n')

  // Get 5 oldest submissions
  console.log('Query 2: SELECT id, created_at FROM submissions ORDER BY created_at ASC LIMIT 5;\n')
  const { data: oldest, error: error2 } = await supabase
    .from('submissions')
    .select('id, created_at')
    .order('created_at', { ascending: true })
    .limit(5)

  if (error2) {
    console.error('Error querying oldest submissions:', error2)
  } else {
    console.log('5 Oldest Submissions (oldest first):')
    oldest.forEach((row, index) => {
      const createdAt = row.created_at
      const isAfter = new Date(createdAt) > new Date(NUCLEAR_DELETE_TIMESTAMP)
      console.log(`  ${index + 1}. ID: ${row.id.substring(0, 8)}... | Created: ${createdAt} ${isAfter ? '✓ AFTER delete' : '✗ BEFORE delete'}`)
    })
  }

  console.log('\n')

  // Summary
  const allAfterDelete = [...(newest || []), ...(oldest || [])].every(
    row => new Date(row.created_at) > new Date(NUCLEAR_DELETE_TIMESTAMP)
  )

  console.log('=== Summary ===')
  if (allAfterDelete) {
    console.log('✓ ALL sampled submissions were created AFTER the nuclear delete.')
    console.log('✓ This confirms the deletion worked correctly.')
  } else {
    console.log('✗ Some submissions exist from BEFORE the nuclear delete.')
    console.log('✗ The deletion may not have completed successfully.')
  }
  console.log('\n')
}

querySubmissionTimestamps()
