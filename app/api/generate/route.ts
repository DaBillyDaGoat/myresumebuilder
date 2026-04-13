import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildResumePrompt, buildAnnotationPrompt } from '@/lib/prompts'

// Simple in-memory rate limit
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  // Rate limiting: 10 requests per IP per hour
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (limit && now < limit.resetAt) {
    if (limit.count >= 10) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    limit.count++
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
  }

  let body: { formData?: unknown; language?: string; callType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { formData, language, callType } = body

  if (!formData || !language || !callType) {
    return NextResponse.json({ error: 'Invalid payload: missing formData, language, or callType' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt =
    callType === 'resume'
      ? buildResumePrompt(language as string)
      : buildAnnotationPrompt(language as string)

  const userMessage =
    callType === 'resume'
      ? `Generate a professional resume from this information:\n${JSON.stringify(formData, null, 2)}`
      : `Generate educational annotations for this resume:\n${JSON.stringify(formData, null, 2)}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from AI' }, { status: 500 })
    }

    // Strip markdown code fences if present
    let rawText = content.text.trim()
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    try {
      const parsed = JSON.parse(rawText)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: rawText },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'AI generation failed', details: message }, { status: 500 })
  }
}
