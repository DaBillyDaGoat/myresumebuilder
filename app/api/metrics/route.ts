import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ skipped: true })

  let body: {
    event_type?: string
    session_id?: string
    step_number?: number
    language?: string
    section_id?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event_type, session_id, step_number, language, section_id } = body

  if (!event_type) {
    return NextResponse.json({ error: 'event_type required' }, { status: 400 })
  }

  try {
    await supabase.from('usage_metrics').insert({
      event_type,
      session_id,
      step_number,
      language,
      section_id,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Metrics write error:', err)
    return NextResponse.json({ ok: false })
  }
}
