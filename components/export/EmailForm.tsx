'use client'

import { useState } from 'react'
import type { Language } from '@/types'
import { getNameParts } from '@/lib/resume-logic'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface EmailFormProps {
  fullName: string
  language: Language
}

export function EmailForm({ fullName, language }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const t = language === 'es' ? esStrings : enStrings

  const handleSend = async () => {
    if (!email || !email.includes('@')) return

    setStatus('sending')
    try {
      const { firstName, lastName } = getNameParts(fullName)

      // Get PDF as base64 for email attachment
      let pdfBase64: string | undefined
      try {
        const element = document.getElementById('resume-pdf-target')
        if (element) {
          const html2pdf = (await import('html2pdf.js')).default
          pdfBase64 = await html2pdf()
            .set({
              margin: 0,
              filename: 'resume.pdf',
              image: { type: 'jpeg', quality: 0.95 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            })
            .from(element)
            .output('datauristring')

          // Strip the data URI prefix
          if (pdfBase64 && pdfBase64.includes(',')) {
            pdfBase64 = pdfBase64.split(',')[1]
          }
        }
      } catch (pdfError) {
        console.error('PDF generation for email failed:', pdfError)
        // Continue without attachment
      }

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, pdfBase64 }),
      })

      if (!res.ok) throw new Error('Email send failed')

      setStatus('success')
    } catch (err) {
      console.error('Email error:', err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <span className="text-green-600 text-2xl">✓</span>
        <p className="text-green-800 font-medium">{t.export.emailSuccess}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{t.export.emailLabel}</label>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t.export.emailPlaceholder}
          className="flex-1 border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]"
          inputMode="email"
          autoComplete="email"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={status === 'sending' || !email}
          className="bg-gray-800 text-white font-semibold px-5 py-3 rounded-lg hover:bg-gray-900 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {status === 'sending'
            ? (language === 'es' ? 'Enviando...' : 'Sending...')
            : t.export.sendEmail}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">{t.export.emailError}</p>
      )}
    </div>
  )
}
