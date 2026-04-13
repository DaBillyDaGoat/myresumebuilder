'use client'

import { useState } from 'react'
import type { Language } from '@/types'
import { getPDFFilename, getNameParts } from '@/lib/resume-logic'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface PDFGeneratorProps {
  fullName: string
  language: Language
}

export function PDFGenerator({ fullName, language }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const t = language === 'es' ? esStrings : enStrings

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const element = document.getElementById('resume-pdf-target')
      if (!element) {
        console.error('Resume element not found')
        return
      }

      // Dynamic import for client-only library
      const html2pdf = (await import('html2pdf.js')).default

      const { firstName, lastName } = getNameParts(fullName)
      const filename = getPDFFilename(lastName, firstName)

      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="w-full bg-[#0A66C2] text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 min-h-[56px] text-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {isGenerating ? (
        <>
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {language === 'es' ? 'Generando PDF...' : 'Generating PDF...'}
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t.export.downloadPDF}
        </>
      )}
    </button>
  )
}
