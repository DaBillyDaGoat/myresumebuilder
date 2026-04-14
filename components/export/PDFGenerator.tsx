'use client'

import { useState } from 'react'
import type { Language } from '@/types'
import { getPDFFilename, getNameParts } from '@/lib/resume-logic'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface PDFGeneratorProps {
  fullName: string
  language: Language
  onExport?: () => void
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function PDFGenerator({ fullName, language, onExport }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const t = language === 'es' ? esStrings : enStrings

  const handleDownload = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const element = document.getElementById('resume-pdf-target')
      if (!element) {
        setError('Resume not found — please go back to the preview.')
        return
      }

      const html2pdf = (await import('html2pdf.js')).default
      const { firstName, lastName } = getNameParts(fullName)
      const filename = getPDFFilename(lastName, firstName)

      const opt = {
        margin: 0,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
      }

      onExport?.()
      if (isIOS()) {
        // iOS Safari blocks programmatic blob downloads — open as data URI in new tab
        // so the user can tap Share > Save to Files
        const dataUri: string = await html2pdf().set(opt).from(element).output('datauristring')
        const newTab = window.open()
        if (newTab) {
          newTab.document.write(
            `<html><head><title>${filename}</title></head>` +
            `<body style="margin:0;background:#525659;display:flex;align-items:center;justify-content:center;min-height:100vh;">` +
            `<iframe src="${dataUri}" style="width:100%;height:100vh;border:none;" title="Resume PDF"></iframe>` +
            `</body></html>`
          )
          newTab.document.close()
        } else {
          // Pop-up blocked — fall back to data URI anchor
          const a = document.createElement('a')
          a.href = dataUri
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } else {
        await html2pdf().set(opt).from(element).save()
      }
    } catch (err) {
      console.error('PDF generation error:', err)
      setError(
        language === 'es'
          ? 'Error al generar el PDF. Por favor intente de nuevo.'
          : 'PDF generation failed. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-2">
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
      {isIOS() && !isGenerating && (
        <p className="text-xs text-gray-500 text-center">
          {language === 'es'
            ? 'En iOS: el PDF se abrirá en una nueva pestaña. Toca Compartir → Guardar en Archivos.'
            : 'On iOS: PDF opens in a new tab. Tap Share → Save to Files.'}
        </p>
      )}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  )
}
