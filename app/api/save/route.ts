import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: {
    firstName?: string
    lastName?: string
    language?: string
    exportMethod?: string
    completionTimeSeconds?: number
    sectionOrder?: string[]
    rawData?: unknown
    generatedResume?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!supabase) {
    // Supabase not configured — skip save gracefully
    return NextResponse.json({ id: null, skipped: true })
  }

  const {
    firstName,
    lastName,
    language,
    exportMethod,
    completionTimeSeconds,
    sectionOrder,
    rawData,
    generatedResume,
  } = body

  try {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        first_name: firstName,
        last_name: lastName,
        language: language || 'en',
        export_method: exportMethod,
        completion_time_seconds: completionTimeSeconds,
        section_order: sectionOrder,
        raw_data: rawData,
        generated_resume: generatedResume,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase save error:', error)
      return NextResponse.json({ error: 'Database save failed', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data?.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Save failed', details: message }, { status: 500 })
  }
}
