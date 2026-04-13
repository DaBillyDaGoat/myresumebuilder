'use client'

import type { Language } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface SkipButtonProps {
  onSkip: () => void
  language: Language
}

export function SkipButton({ onSkip, language }: SkipButtonProps) {
  const t = language === 'es' ? esStrings : enStrings
  return (
    <button
      onClick={onSkip}
      className="text-gray-500 hover:text-gray-700 text-sm underline underline-offset-2 min-h-[44px] px-2 transition-colors"
    >
      {t.nav.skip}
    </button>
  )
}
