'use client'

import type { Language, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface InterestsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

export function Interests({ formData, onChange, language }: InterestsProps) {
  const t = language === 'es' ? esStrings : enStrings

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{t.interests.label}</label>
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[140px] resize-y"
        placeholder={t.interests.placeholder}
        value={formData.interests}
        onChange={e => onChange({ interests: e.target.value })}
      />
      <p className="text-sm text-gray-500">{t.interests.helper}</p>
    </div>
  )
}
