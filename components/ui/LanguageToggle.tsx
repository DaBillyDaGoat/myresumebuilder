'use client'

import type { Language } from '@/types'

interface LanguageToggleProps {
  language: Language
  onChange: (lang: Language) => void
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all min-h-[36px] ${
          language === 'en'
            ? 'bg-[#0A66C2] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => onChange('es')}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all min-h-[36px] ${
          language === 'es'
            ? 'bg-[#0A66C2] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  )
}
