import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  let body: {
    email?: string
    firstName?: string
    lastName?: string
    pdfBase64?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, firstName, lastName, pdfBase64 } = body

  if (!email) {
    return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const resend = new Resend(resendApiKey)

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Resume'
  const filename = `MyResumeBuilder_${lastName || 'Resume'}_${firstName || ''}_${new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '')}.pdf`

  type Attachment = { filename: string; content: string }
  const attachments: Attachment[] = []

  if (pdfBase64) {
    attachments.push({
      filename,
      content: pdfBase64,
    })
  }

  try {
    const { error } = await resend.emails.send({
      from: 'MyResumeBuilder <noreply@myresumebuilder.org>',
      to: email,
      subject: `Your Professional Resume — ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0A66C2; margin-bottom: 10px;">Your Resume is Ready!</h1>
          <p style="color: #333; font-size: 16px;">Hi ${firstName || 'there'},</p>
          <p style="color: #333; font-size: 16px;">
            Your professionally crafted resume is attached to this email as a PDF.
          </p>
          <p style="color: #333; font-size: 16px;">
            <strong>Tips for your job search:</strong>
          </p>
          <ul style="color: #333; font-size: 15px; line-height: 1.8;">
            <li>Tailor your resume for each job application</li>
            <li>Follow up after submitting applications</li>
            <li>Practice answering common interview questions</li>
            <li>Bring printed copies to interviews</li>
          </ul>
          <p style="color: #555; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            Built with <strong>MyResumeBuilder</strong> — free, bilingual, AI-assisted resume builder for everyone.
          </p>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Email send failed', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Email failed', details: message }, { status: 500 })
  }
}
