'use client'

import type { Language, ContactInfo as ContactInfoType, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface ContactInfoProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

export function ContactInfo({ formData, onChange, language }: ContactInfoProps) {
  const t = language === 'es' ? esStrings : enStrings
  const c = formData.contact

  const update = (field: keyof ContactInfoType, value: string) => {
    onChange({ contact: { ...c, [field]: value } })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>{t.contact.fullName} *</label>
        <input
          type="text"
          className={inputClass}
          placeholder={t.contact.fullNamePlaceholder}
          value={c.fullName}
          onChange={e => update('fullName', e.target.value)}
          autoComplete="name"
        />
      </div>

      <div>
        <label className={labelClass}>{t.contact.legalName}</label>
        <input
          type="text"
          className={inputClass}
          placeholder={t.contact.fullNamePlaceholder}
          value={c.legalName || ''}
          onChange={e => update('legalName', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">{t.contact.legalNameHelper}</p>
      </div>

      <div>
        <label className={labelClass}>{t.contact.phone} *</label>
        <input
          type="tel"
          className={inputClass}
          placeholder={t.contact.phonePlaceholder}
          value={c.phone}
          onChange={e => update('phone', e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div>
        <label className={labelClass}>{t.contact.email} *</label>
        <input
          type="email"
          className={inputClass}
          placeholder={t.contact.emailPlaceholder}
          value={c.email}
          onChange={e => update('email', e.target.value)}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div>
        <label className={labelClass}>{t.contact.addressOption}</label>
        <div className="space-y-2">
          {(['full', 'city-state', 'none'] as const).map((option) => (
            <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="radio"
                name="addressOption"
                value={option}
                checked={c.addressOption === option}
                onChange={() => update('addressOption', option)}
                className="w-4 h-4 text-[#0A66C2]"
              />
              <span className="text-base">
                {option === 'full' ? t.contact.addressFull :
                 option === 'city-state' ? t.contact.addressCityState :
                 t.contact.addressNone}
              </span>
            </label>
          ))}
        </div>
      </div>

      {c.addressOption === 'full' && (
        <div>
          <label className={labelClass}>{t.contact.fullAddress}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t.contact.fullAddressPlaceholder}
            value={c.addressFull || ''}
            onChange={e => update('addressFull', e.target.value)}
            autoComplete="street-address"
          />
        </div>
      )}

      {c.addressOption === 'city-state' && (
        <div>
          <label className={labelClass}>{t.contact.cityState}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t.contact.cityStatePlaceholder}
            value={c.cityState || ''}
            onChange={e => update('cityState', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
