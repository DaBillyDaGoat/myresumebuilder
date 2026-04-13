'use client'

import { useId } from 'react'
import type { Language, VolunteerEntry, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface VolunteerWorkProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function createNew(): VolunteerEntry {
  return { id: crypto.randomUUID(), role: '', org: '', dates: '', description: '' }
}

export function VolunteerWork({ formData, onChange, language }: VolunteerWorkProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.volunteer

  const update = (id: string, field: keyof VolunteerEntry, value: string) => {
    onChange({ volunteer: entries.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  const addEntry = () => onChange({ volunteer: [...entries, createNew()] })

  const removeEntry = (id: string) => {
    onChange({ volunteer: entries.filter(e => e.id !== id) })
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">#{idx + 1}</h3>
            <button onClick={() => removeEntry(entry.id)} className="text-red-500 hover:text-red-700 text-sm min-h-[44px] px-2">
              {t.volunteer.removeEntry}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${uid}-role-${idx}`}>{t.volunteer.role}</label>
              <input id={`${uid}-role-${idx}`} type="text" className={inputClass} placeholder={t.volunteer.rolePlaceholder} value={entry.role} onChange={e => update(entry.id, 'role', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${uid}-org-${idx}`}>{t.volunteer.org}</label>
              <input id={`${uid}-org-${idx}`} type="text" className={inputClass} placeholder={t.volunteer.orgPlaceholder} value={entry.org} onChange={e => update(entry.id, 'org', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor={`${uid}-dates-${idx}`}>{t.volunteer.dates}</label>
            <input id={`${uid}-dates-${idx}`} type="text" className={inputClass} placeholder={t.volunteer.datesPlaceholder} value={entry.dates} onChange={e => update(entry.id, 'dates', e.target.value)} />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${uid}-desc-${idx}`}>{t.volunteer.description}</label>
            <textarea id={`${uid}-desc-${idx}`} className={`${inputClass} min-h-[100px] resize-y`} placeholder={t.volunteer.descriptionPlaceholder} value={entry.description} onChange={e => update(entry.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
        {t.volunteer.addEntry}
      </button>
    </div>
  )
}
