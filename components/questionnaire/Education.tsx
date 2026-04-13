'use client'

import { useId } from 'react'
import type { Language, EducationEntry, EducationType, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface EducationProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

const EDU_TYPES: EducationType[] = [
  'High School/GED',
  'Some College',
  "Associate's Degree",
  "Bachelor's Degree",
  'Trade/Vocational',
  'Other',
]

function createNewEntry(): EducationEntry {
  return {
    id: crypto.randomUUID(),
    type: 'High School/GED',
    school: '',
    cityState: '',
    completionDate: '',
    inProgress: false,
    field: '',
    notes: '',
  }
}

export function Education({ formData, onChange, language }: EducationProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.education.length > 0 ? formData.education : [createNewEntry()]

  const eduTypeLabels: Record<EducationType, string> = {
    'High School/GED': t.education.types.highSchool,
    'Some College': t.education.types.someCollege,
    "Associate's Degree": t.education.types.associates,
    "Bachelor's Degree": t.education.types.bachelors,
    'Trade/Vocational': t.education.types.trade,
    'Other': t.education.types.other,
  }

  const update = (id: string, field: keyof EducationEntry, value: string | boolean) => {
    const updated = entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    onChange({ education: updated })
  }

  const addEntry = () => {
    onChange({ education: [...entries, createNewEntry()] })
  }

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return
    onChange({ education: entries.filter(e => e.id !== id) })
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">
              {language === 'es' ? 'Educación' : 'Education'} #{idx + 1}
            </h3>
            {entries.length > 1 && (
              <button
                onClick={() => removeEntry(entry.id)}
                className="text-red-500 hover:text-red-700 text-sm min-h-[44px] px-2"
              >
                {t.education.removeEntry}
              </button>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor={`${uid}-type-${idx}`}>{t.education.type}</label>
            <select
              id={`${uid}-type-${idx}`}
              className={inputClass}
              value={entry.type}
              onChange={e => update(entry.id, 'type', e.target.value as EducationType)}
            >
              {EDU_TYPES.map(type => (
                <option key={type} value={type}>{eduTypeLabels[type]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${uid}-school-${idx}`}>{t.education.school}</label>
              <input
                id={`${uid}-school-${idx}`}
                type="text"
                className={inputClass}
                placeholder={t.education.schoolPlaceholder}
                value={entry.school}
                onChange={e => update(entry.id, 'school', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${uid}-city-${idx}`}>{t.education.cityState}</label>
              <input
                id={`${uid}-city-${idx}`}
                type="text"
                className={inputClass}
                placeholder="e.g. Houston, TX"
                value={entry.cityState}
                onChange={e => update(entry.id, 'cityState', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${uid}-date-${idx}`}>{t.education.completionDate}</label>
              <input
                id={`${uid}-date-${idx}`}
                type="text"
                className={inputClass}
                placeholder="MM/YYYY"
                value={entry.completionDate}
                onChange={e => update(entry.id, 'completionDate', e.target.value)}
                disabled={entry.inProgress}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={entry.inProgress}
                  onChange={e => update(entry.id, 'inProgress', e.target.checked)}
                  className="w-5 h-5 text-[#0A66C2] rounded"
                />
                <span className="text-base text-gray-700">{t.education.inProgress}</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor={`${uid}-field-${idx}`}>{t.education.field}</label>
            <input
              id={`${uid}-field-${idx}`}
              type="text"
              className={inputClass}
              placeholder={t.education.fieldPlaceholder}
              value={entry.field}
              onChange={e => update(entry.id, 'field', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${uid}-notes-${idx}`}>{t.education.notes}</label>
            <input
              id={`${uid}-notes-${idx}`}
              type="text"
              className={inputClass}
              placeholder={t.education.notesPlaceholder}
              value={entry.notes}
              onChange={e => update(entry.id, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]"
      >
        {t.education.addEntry}
      </button>
    </div>
  )
}
