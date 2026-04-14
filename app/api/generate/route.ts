import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildResumePrompt, buildAnnotationPrompt } from '@/lib/prompts'

// In-memory fallback rate limiter (resets on cold start)
const inMemoryMap = new Map<string, { count: number; resetAt: number }>()

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Try Upstash Ratelimit if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import('@upstash/redis')
      const { Ratelimit } = await import('@upstash/ratelimit')
      const redis = new Redis({ url: redisUrl, token: redisToken })
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        prefix: 'rl:generate',
      })
      const { success, reset } = await ratelimit.limit(ip)
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return { allowed: success, retryAfter: success ? undefined : retryAfter }
    } catch (err) {
      console.warn('Upstash rate limit check failed, falling back to in-memory:', err)
    }
  } else {
    console.warn('UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory rate limiter (resets on cold start)')
  }

  // In-memory fallback
  const now = Date.now()
  const entry = inMemoryMap.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 10) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }
    entry.count++
  } else {
    inMemoryMap.set(ip, { count: 1, resetAt: now + 3_600_000 })
  }
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const { allowed, retryAfter } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: retryAfter ?? 3600 },
      { status: 429 }
    )
  }

  let body: { formData?: unknown; language?: string; callType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { formData, language, callType } = body

  if (!formData || !language || !callType) {
    return NextResponse.json({ error: 'Missing required fields: formData, language, callType' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'AI service not configured. Please set ANTHROPIC_API_KEY.' }, { status: 503 })
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = callType === 'resume'
    ? buildResumePrompt(language as string)
    : buildAnnotationPrompt(language as string)

  const userMessage = callType === 'resume'
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
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 })
    }

    // Strip markdown fences if present
    let text = content.text.trim()
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'AI generation failed', details: message }, { status: 500 })
  }
}
