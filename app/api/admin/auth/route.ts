import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ ok: false, error: 'Admin not configured' }, { status: 503 })
  }

  if (password === adminPassword) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
