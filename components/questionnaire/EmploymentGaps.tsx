'use client'

import type { Language, EmploymentGap, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface EmploymentGapsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

const GAP_REASONS = [
  { key: 'caregiving', en: 'Caregiving for family member', es: 'Cuidado de un familiar' },
  { key: 'health', en: 'Health / medical reasons', es: 'Razones de salud / médicas' },
  { key: 'school', en: 'Returning to school', es: 'Regresar a la escuela' },
  { key: 'searching', en: 'Job searching', es: 'Búsqueda de empleo' },
  { key: 'relocation', en: 'Relocation', es: 'Reubicación' },
  { key: 'personal', en: 'Personal reasons', es: 'Razones personales' },
]

export function EmploymentGaps({ formData, onChange, language }: EmploymentGapsProps) {
  const t = language === 'es' ? esStrings : enStrings
  const gaps = formData.employmentGaps

  const toggleReason = (reason: string) => {
    const exists = gaps.find(g => g.reason === reason)
    if (exists) {
      onChange({ employmentGaps: gaps.filter(g => g.reason !== reason) })
    } else {
      const newGap: EmploymentGap = {
        id: crypto.randomUUID(),
        reason,
        startDate: '',
        endDate: '',
        notes: '',
      }
      onChange({ employmentGaps: [...gaps, newGap] })
    }
  }

  const updateGap = (id: string, field: keyof EmploymentGap, value: string) => {
    onChange({ employmentGaps: gaps.map(g => g.id === id ? { ...g, [field]: value } : g) })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{t.gaps.title}</p>

      <div className="space-y-2">
        {GAP_REASONS.map(({ key, en, es }) => {
          const label = language === 'es' ? es : en
          const gap = gaps.find(g => g.reason === key)
          const selected = !!gap

          return (
            <div key={key}>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleReason(key)}
                  className="w-5 h-5 text-[#0A66C2] rounded flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </label>

              {selected && gap && (
                <div className="ml-8 mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>{t.gaps.startDate}</label>
                      <input type="text" className={inputClass} placeholder="MM/YYYY" value={gap.startDate} onChange={e => updateGap(gap.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>{t.gaps.endDate}</label>
                      <input type="text" className={inputClass} placeholder="MM/YYYY" value={gap.endDate} onChange={e => updateGap(gap.id, 'endDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t.gaps.notes}</label>
                    <input type="text" className={inputClass} placeholder="" value={gap.notes} onChange={e => updateGap(gap.id, 'notes', e.target.value)} />
                    <p className="text-xs text-gray-500 mt-1">{t.gaps.notesHelper}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
