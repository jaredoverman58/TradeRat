import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const expertId = formData.get('expert_id') as string

    if (!audioFile || !expertId) {
      return NextResponse.json(
        { error: 'Missing audio file or expert_id' },
        { status: 400 }
      )
    }

    // Verify the expert_id belongs to the logged-in user
    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id')
      .eq('id', expertId)
      .eq('user_id', user.id)
      .single()

    if (expertError || !expert) {
      return NextResponse.json(
        { error: 'Unauthorized: expert does not match user' },
        { status: 403 }
      )
    }

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    })

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
    })
  } catch (err) {
    console.error('Error transcribing audio:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
