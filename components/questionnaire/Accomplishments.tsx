'use client'

import type { Language, Accomplishment, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface AccomplishmentsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const ACCOMPLISHMENT_KEYS = [
  'trained',
  'extraResponsibilities',
  'solvedProblem',
  'filledIn',
  'positiveFeedback',
  'improvedProcess',
  'hitTarget',
  'attendance',
] as const

type AccKey = typeof ACCOMPLISHMENT_KEYS[number]

export function Accomplishments({ formData, onChange, language }: AccomplishmentsProps) {
  const t = language === 'es' ? esStrings : enStrings
  const accomplishments = formData.accomplishments

  const getItem = (key: string): Accomplishment => {
    return accomplishments.find(a => a.id === key) || {
      id: key,
      label: key,
      value: false,
      detail: '',
    }
  }

  const updateItem = (key: string, field: 'value' | 'detail', val: boolean | string) => {
    const existing = getItem(key)
    const updated = { ...existing, [field]: val }
    const rest = accomplishments.filter(a => a.id !== key)
    onChange({ accomplishments: [...rest, updated] })
  }

  const questions = t.accomplishments.questions as Record<AccKey, string>

  return (
    <div className="space-y-4">
      {ACCOMPLISHMENT_KEYS.map(key => {
        const item = getItem(key)
        return (
          <div key={key} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-gray-800 leading-relaxed flex-1">{questions[key]}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => updateItem(key, 'value', true)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold min-h-[44px] transition-all ${
                    item.value ? 'bg-[#0A66C2] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.accomplishments.yes}
                </button>
                <button
                  onClick={() => updateItem(key, 'value', false)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold min-h-[44px] transition-all ${
                    !item.value ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.accomplishments.no}
                </button>
              </div>
            </div>

            {item.value && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.accomplishments.detail}</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[80px] resize-y"
                  placeholder={t.accomplishments.detailPlaceholder}
                  value={item.detail || ''}
                  onChange={e => updateItem(key, 'detail', e.target.value)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
