'use client'

import { useId } from 'react'
import type { Language, Award, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface AwardsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function createNew(): Award {
  return { id: crypto.randomUUID(), name: '', giver: '', date: '' }
}

export function Awards({ formData, onChange, language }: AwardsProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.awards

  const update = (id: string, field: keyof Award, value: string) => {
    onChange({ awards: entries.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  const addEntry = () => onChange({ awards: [...entries, createNew()] })
  const removeEntry = (id: string) => onChange({ awards: entries.filter(e => e.id !== id) })

  return (
    <div className="space-y-6">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">#{idx + 1}</h3>
            <button onClick={() => removeEntry(entry.id)} className="text-red-500 text-sm min-h-[44px] px-2">{t.awards.removeEntry}</button>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${uid}-name-${idx}`}>{t.awards.name}</label>
            <input id={`${uid}-name-${idx}`} type="text" className={inputClass} placeholder={t.awards.namePlaceholder} value={entry.name} onChange={e => update(entry.id, 'name', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${uid}-giver-${idx}`}>{t.awards.giver}</label>
              <input id={`${uid}-giver-${idx}`} type="text" className={inputClass} placeholder={t.awards.giverPlaceholder} value={entry.giver} onChange={e => update(entry.id, 'giver', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${uid}-date-${idx}`}>{t.awards.date}</label>
              <input id={`${uid}-date-${idx}`} type="text" className={inputClass} placeholder="MM/YYYY" value={entry.date} onChange={e => update(entry.id, 'date', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
        {t.awards.addEntry}
      </button>
    </div>
  )
}
