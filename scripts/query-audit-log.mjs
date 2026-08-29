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

async function queryAuditLog() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .in('action', ['all_submissions_deleted', 'submission_deleted', 'test_submissions_bulk_deleted'])
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error querying audit_log:', error)
    process.exit(1)
  }

  console.log('\n=== Recent Deletion Audit Logs (5 most recent) ===\n')

  if (data.length === 0) {
    console.log('No deletion entries found in audit_log.')
  } else {
    data.forEach((entry, index) => {
      console.log(`\n--- Entry ${index + 1} ---`)
      console.log(`ID: ${entry.id}`)
      console.log(`Action: ${entry.action}`)
      console.log(`User ID: ${entry.user_id}`)
      console.log(`Submission ID: ${entry.submission_id}`)
      console.log(`Created At: ${entry.created_at}`)
      console.log(`Details:`)
      console.log(JSON.stringify(entry.details, null, 2))
    })
  }

  console.log('\n')
}

queryAuditLog()
