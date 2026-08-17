// Quick script to check the most recent audio transcript
const { createClient } = require('@supabase/supabase-js')

// Read from environment (assuming they're already set)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkTranscript() {
  const { data, error } = await supabase
    .from('responses')
    .select('id, submission_id, audio_url, audio_transcript, sent_at')
    .not('audio_url', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching response:', error)
    return
  }

  console.log('\n=== MOST RECENT AUDIO RESPONSE ===')
  console.log('Response ID:', data.id)
  console.log('Submission ID:', data.submission_id)
  console.log('Audio URL:', data.audio_url)
  console.log('Sent At:', data.sent_at)
  console.log('\n--- TRANSCRIPT ---')
  console.log(data.audio_transcript || '(null - transcription may have failed)')
  console.log('\nTranscript Length:', data.audio_transcript?.length || 0, 'characters')
  console.log('==================\n')
}

checkTranscript()
