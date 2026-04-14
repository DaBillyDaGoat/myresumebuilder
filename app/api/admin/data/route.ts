import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { password?: string; action?: string; id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Verify admin password
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  if (body.password !== adminPassword) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  // Single resume detail
  if (body.action === 'detail' && body.id) {
    const { data, error } = await admin.from('resumes').select('*').eq('id', body.id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ resume: data })
  }

  // Bulk metrics data
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const [allRes, monthRes, recentRes, metricsRes, dailyRes] = await Promise.all([
      admin.from('resumes').select('language, completion_time_seconds, export_method, raw_data, section_order').limit(1000),
      admin.from('resumes').select('id').gte('created_at', startOfMonth),
      admin.from('resumes').select('id, created_at, first_name, last_name, language, export_method, completion_time_seconds').order('created_at', { ascending: false }).limit(50),
      admin.from('usage_metrics').select('event_type, session_id, step_number, section_id').limit(5000),
      admin.from('resumes').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at'),
    ])

    return NextResponse.json({
      all: allRes.data || [],
      monthCount: (monthRes.data || []).length,
      recent: recentRes.data || [],
      events: metricsRes.data || [],
      daily: dailyRes.data || [],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Data fetch failed', details: message }, { status: 500 })
  }
}
