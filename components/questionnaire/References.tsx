'use client'

import { useId } from 'react'
import type { Language, Reference, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface ReferencesProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function createNew(): Reference {
  return { id: crypto.randomUUID(), name: '', titleRelationship: '', phone: '', email: '' }
}

export function References({ formData, onChange, language }: ReferencesProps) {
  const t = language === 'es' ? esStrings : enStrings
  const uid = useId()
  const refs = formData.references

  const updateType = (type: 'request' | 'include') => {
    onChange({ references: { ...refs, type } })
  }

  const updateRef = (id: string, field: keyof Reference, value: string) => {
    onChange({ references: { ...refs, list: refs.list.map(r => r.id === id ? { ...r, [field]: value } : r) } })
  }

  const addRef = () => {
    if (refs.list.length < 3) {
      onChange({ references: { ...refs, list: [...refs.list, createNew()] } })
    }
  }

  const removeRef = (id: string) => {
    onChange({ references: { ...refs, list: refs.list.filter(r => r.id !== id) } })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{t.references.option}</p>
        <div className="space-y-2">
          {(['request', 'include'] as const).map(option => (
            <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="radio"
                name="refType"
                value={option}
                checked={refs.type === option}
                onChange={() => updateType(option)}
                className="w-4 h-4 text-[#0A66C2]"
              />
              <span className="text-base font-medium text-gray-800">
                {option === 'request' ? t.references.onRequest : t.references.include}
              </span>
            </label>
          ))}
        </div>
      </div>

      {refs.type === 'include' && (
        <div className="space-y-6">
          {refs.list.map((ref, idx) => (
            <div key={ref.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{language === 'es' ? 'Referencia' : 'Reference'} #{idx + 1}</h3>
                <button onClick={() => removeRef(ref.id)} className="text-red-500 text-sm min-h-[44px] px-2">{t.references.removeReference}</button>
              </div>
              <div>
                <label className={labelClass} htmlFor={`${uid}-name-${idx}`}>{t.references.name}</label>
                <input id={`${uid}-name-${idx}`} type="text" className={inputClass} placeholder={t.references.namePlaceholder} value={ref.name} onChange={e => updateRef(ref.id, 'name', e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`${uid}-title-${idx}`}>{t.references.titleRelationship}</label>
                <input id={`${uid}-title-${idx}`} type="text" className={inputClass} placeholder={t.references.titlePlaceholder} value={ref.titleRelationship} onChange={e => updateRef(ref.id, 'titleRelationship', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor={`${uid}-phone-${idx}`}>{t.references.phone}</label>
                  <input id={`${uid}-phone-${idx}`} type="tel" className={inputClass} placeholder={t.references.phonePlaceholder} value={ref.phone} onChange={e => updateRef(ref.id, 'phone', e.target.value)} inputMode="tel" />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${uid}-email-${idx}`}>{t.references.email}</label>
                  <input id={`${uid}-email-${idx}`} type="email" className={inputClass} placeholder={t.references.emailPlaceholder} value={ref.email} onChange={e => updateRef(ref.id, 'email', e.target.value)} inputMode="email" />
                </div>
              </div>
            </div>
          ))}

          {refs.list.length < 3 && (
            <button onClick={addRef} className="w-full py-3 border-2 border-dashed border-[#0A66C2] text-[#0A66C2] font-semibold rounded-xl hover:bg-blue-50 transition-colors min-h-[52px]">
              {t.references.addReference}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
