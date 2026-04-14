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

const DESCRIPTION_PROMPTS = {
  en: [
    'What did you actually do? (sorting, serving, teaching, building...)',
    'How many people did you help or work with?',
    'How often did you volunteer? (weekly, monthly, for an event)',
    'Did you take on any responsibilities or lead anything?',
  ],
  es: [
    '¿Qué hacías exactamente? (clasificar, servir, enseñar, construir...)',
    '¿A cuántas personas ayudaste o con quién trabajabas?',
    '¿Con qué frecuencia voluntariabas? (semanal, mensual, para un evento)',
    '¿Tuviste alguna responsabilidad o liderazgo?',
  ],
}

function createNew(): VolunteerEntry {
  return { id: crypto.randomUUID(), role: '', org: '', dates: '', description: '' }
}

export function VolunteerWork({ formData, onChange, language }: VolunteerWorkProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const entries = formData.volunteer
  const prompts = DESCRIPTION_PROMPTS[language]

  const update = (id: string, field: keyof VolunteerEntry, value: string) => {
    onChange({ volunteer: entries.map(e => e.id === id ? { ...e, [field]: value } : e) })
  }

  const addEntry = () => onChange({ volunteer: [...entries, createNew()] })
  const removeEntry = (id: string) => onChange({ volunteer: entries.filter(e => e.id !== id) })

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm mb-4">
            {language === 'es'
              ? 'Agrega trabajo voluntario que hayas realizado — servicio comunitario, iglesia, eventos, ayudar a vecinos.'
              : 'Add any unpaid work you\'ve done — community service, church, events, helping neighbors.'}
          </p>
        </div>
        <button onClick={addEntry} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
          {t.volunteer.addEntry}
        </button>
      </div>
    )
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
            <textarea
              id={`${uid}-desc-${idx}`}
              className={`${inputClass} min-h-[100px] resize-y`}
              placeholder={language === 'es' ? 'Describe tu trabajo voluntario...' : 'Describe your volunteer work...'}
              value={entry.description}
              onChange={e => update(entry.id, 'description', e.target.value)}
            />
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1.5">
                {language === 'es' ? '💡 Ideas para ayudarte:' : '💡 Details to include:'}
              </p>
              <ul className="space-y-1">
                {prompts.map((prompt, pi) => (
                  <li key={pi} className="text-xs text-blue-700 flex items-start gap-1.5">
                    <span className="text-blue-400 flex-shrink-0">•</span>
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
        {t.volunteer.addEntry}
      </button>
    </div>
  )
}
