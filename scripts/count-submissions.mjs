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

async function countSubmissions() {
  console.log('\n=== Direct Database Query ===\n')
  console.log('SELECT COUNT(*) FROM submissions;\n')

  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting submissions:', error)
    process.exit(1)
  }

  console.log(`Current row count in submissions table: ${count}`)
  console.log('\n')
}

countSubmissions()
