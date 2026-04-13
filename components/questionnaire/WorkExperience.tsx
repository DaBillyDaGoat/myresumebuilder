'use client'

import { useId } from 'react'
import type { Language, WorkEntry, FormData } from '@/types'
import { StateSelect } from '@/components/ui/StateSelect'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface WorkExperienceProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function createNewEntry(): WorkEntry {
  return {
    id: crypto.randomUUID(),
    title: '',
    employer: '',
    cityState: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }
}

function parseCityState(val: string): { city: string; state: string } {
  const parts = (val || '').split(', ')
  return { city: parts[0] || '', state: parts[1] || '' }
}

export function WorkExperience({ formData, onChange, language }: WorkExperienceProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.work.length > 0 ? formData.work : [createNewEntry()]

  const update = (id: string, field: keyof WorkEntry, value: string | boolean) => {
    const updated = entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    onChange({ work: updated })
  }

  const updateCityState = (id: string, city: string, state: string) => {
    const combined = city + (state ? ', ' + state : '')
    const updated = entries.map(e => e.id === id ? { ...e, cityState: combined } : e)
    onChange({ work: updated })
  }

  const addEntry = () => {
    onChange({ work: [...entries, createNewEntry()] })
  }

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return
    onChange({ work: entries.filter(e => e.id !== id) })
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, idx) => {
        const { city, state } = parseCityState(entry.cityState)
        return (
          <div key={entry.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {language === 'es' ? 'Trabajo' : 'Job'} #{idx + 1}
              </h3>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-500 hover:text-red-700 text-sm min-h-[44px] px-2"
                >
                  {t.work.removeJob}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`${uid}-title-${idx}`}>{t.work.jobTitle}</label>
                <input
                  id={`${uid}-title-${idx}`}
                  type="text"
                  className={inputClass}
                  placeholder={t.work.jobTitlePlaceholder}
                  value={entry.title}
                  onChange={e => update(entry.id, 'title', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`${uid}-employer-${idx}`}>{t.work.employer}</label>
                <input
                  id={`${uid}-employer-${idx}`}
                  type="text"
                  className={inputClass}
                  placeholder={t.work.employerPlaceholder}
                  value={entry.employer}
                  onChange={e => update(entry.id, 'employer', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{language === 'es' ? 'Ciudad y Estado' : 'City & State'}</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className={inputClass}
                  placeholder={language === 'es' ? 'Ciudad' : 'City'}
                  value={city}
                  onChange={e => updateCityState(entry.id, e.target.value, state)}
                  autoComplete="address-level2"
                />
                <StateSelect
                  value={state}
                  onChange={val => updateCityState(entry.id, city, val)}
                  placeholder={language === 'es' ? 'Estado' : 'State'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor={`${uid}-start-${idx}`}>{t.work.startDate}</label>
                <input
                  id={`${uid}-start-${idx}`}
                  type="text"
                  className={inputClass}
                  placeholder="MM/YYYY"
                  value={entry.startDate}
                  onChange={e => update(entry.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`${uid}-end-${idx}`}>{t.work.endDate}</label>
                <input
                  id={`${uid}-end-${idx}`}
                  type="text"
                  className={inputClass}
                  placeholder="MM/YYYY"
                  value={entry.endDate}
                  onChange={e => update(entry.id, 'endDate', e.target.value)}
                  disabled={entry.current}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={e => update(entry.id, 'current', e.target.checked)}
                className="w-5 h-5 text-[#0A66C2] rounded"
              />
              <span className="text-base text-gray-700">{t.work.current}</span>
            </label>

            <div>
              <label className={labelClass} htmlFor={`${uid}-desc-${idx}`}>{t.work.description}</label>
              <textarea
                id={`${uid}-desc-${idx}`}
                className={`${inputClass} min-h-[160px] resize-y`}
                placeholder={t.work.descriptionPlaceholder}
                value={entry.description}
                onChange={e => update(entry.id, 'description', e.target.value)}
              />
            </div>
          </div>
        )
      })}

      <button
        onClick={addEntry}
        className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]"
      >
        {t.work.addJob}
      </button>
    </div>
  )
}
