'use client'

import { useId } from 'react'
import type { Language, TrainingEntry, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface TrainingProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function createNew(): TrainingEntry {
  return { id: crypto.randomUUID(), program: '', provider: '', date: '', notes: '' }
}

export function Training({ formData, onChange, language }: TrainingProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.training

  const update = (id: string, field: keyof TrainingEntry, value: string) => {
    onChange({ training: entries.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  const addEntry = () => onChange({ training: [...entries, createNew()] })
  const removeEntry = (id: string) => onChange({ training: entries.filter(e => e.id !== id) })

  return (
    <div className="space-y-6">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">#{idx + 1}</h3>
            <button onClick={() => removeEntry(entry.id)} className="text-red-500 text-sm min-h-[44px] px-2">{t.training.removeEntry}</button>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${uid}-prog-${idx}`}>{t.training.program}</label>
            <input id={`${uid}-prog-${idx}`} type="text" className={inputClass} placeholder={t.training.programPlaceholder} value={entry.program} onChange={e => update(entry.id, 'program', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${uid}-prov-${idx}`}>{t.training.provider}</label>
              <input id={`${uid}-prov-${idx}`} type="text" className={inputClass} placeholder={t.training.providerPlaceholder} value={entry.provider} onChange={e => update(entry.id, 'provider', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${uid}-date-${idx}`}>{t.training.date}</label>
              <input id={`${uid}-date-${idx}`} type="text" className={inputClass} placeholder="MM/YYYY" value={entry.date} onChange={e => update(entry.id, 'date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${uid}-notes-${idx}`}>{t.training.notes}</label>
            <textarea id={`${uid}-notes-${idx}`} className={`${inputClass} min-h-[80px] resize-y`} placeholder={t.training.notesPlaceholder} value={entry.notes} onChange={e => update(entry.id, 'notes', e.target.value)} />
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
        {t.training.addEntry}
      </button>
    </div>
  )
}
