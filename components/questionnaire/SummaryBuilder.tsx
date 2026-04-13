'use client'

import type { Language, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface SummaryBuilderProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[120px] resize-y'

export function SummaryBuilder({ formData, onChange, language }: SummaryBuilderProps) {
  const t = language === 'es' ? esStrings : enStrings
  const s = formData.summary

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.summary.targetRole}</label>
        <textarea
          className={inputClass}
          placeholder={t.summary.targetRolePlaceholder}
          value={s.targetRole}
          onChange={e => onChange({ summary: { ...s, targetRole: e.target.value } })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.summary.strengths}</label>
        <textarea
          className={inputClass}
          placeholder={t.summary.strengthsPlaceholder}
          value={s.strengths}
          onChange={e => onChange({ summary: { ...s, strengths: e.target.value } })}
        />
      </div>
    </div>
  )
}
