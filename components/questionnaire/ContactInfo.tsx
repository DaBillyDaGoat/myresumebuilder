'use client'

import { useState } from 'react'
import type { Language, ContactInfo as ContactInfoType, FormData } from '@/types'
import { StateSelect } from '@/components/ui/StateSelect'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface ContactInfoProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
  showErrors?: boolean
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const inputErrorClass = 'w-full border border-red-400 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function parseCityState(val: string): { city: string; state: string } {
  const parts = (val || '').split(', ')
  return { city: parts[0] || '', state: parts[1] || '' }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactInfo({ formData, onChange, language, showErrors = false }: ContactInfoProps) {
  const t = language === 'es' ? esStrings : enStrings
  const c = formData.contact
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const cityState = parseCityState(c.cityState || '')
  const [city, setCity] = useState(cityState.city)
  const [stateCode, setStateCode] = useState(cityState.state)

  const update = (field: keyof ContactInfoType, value: string) => {
    onChange({ contact: { ...c, [field]: value } })
  }

  const updateCityState = (newCity: string, newState: string) => {
    const combined = newCity + (newState ? ', ' + newState : '')
    onChange({ contact: { ...c, cityState: combined } })
  }

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const errors = {
    fullName: (!c.fullName.trim()) ? (language === 'es' ? 'El nombre es requerido' : 'Name is required') : '',
    phone: (!c.phone.trim()) ? (language === 'es' ? 'El teléfono es requerido' : 'Phone number is required') : '',
    email: (!c.email.trim())
      ? (language === 'es' ? 'El correo es requerido' : 'Email is required')
      : !validateEmail(c.email)
        ? (language === 'es' ? 'Correo electrónico inválido' : 'Enter a valid email address')
        : '',
  }

  const showErr = (field: keyof typeof errors) =>
    errors[field] && (showErrors || touched[field])

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>{t.contact.fullName} *</label>
        <input
          type="text"
          className={showErr('fullName') ? inputErrorClass : inputClass}
          placeholder={t.contact.fullNamePlaceholder}
          value={c.fullName}
          onChange={e => update('fullName', e.target.value)}
          onBlur={() => touch('fullName')}
          autoComplete="name"
        />
        {showErr('fullName') && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
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
          className={showErr('phone') ? inputErrorClass : inputClass}
          placeholder={t.contact.phonePlaceholder}
          value={c.phone}
          onChange={e => update('phone', e.target.value)}
          onBlur={() => touch('phone')}
          autoComplete="tel"
          inputMode="tel"
        />
        {showErr('phone') && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className={labelClass}>{t.contact.email} *</label>
        <input
          type="email"
          className={showErr('email') ? inputErrorClass : inputClass}
          placeholder={t.contact.emailPlaceholder}
          value={c.email}
          onChange={e => update('email', e.target.value)}
          onBlur={() => touch('email')}
          autoComplete="email"
          inputMode="email"
        />
        {showErr('email') && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                className={inputClass}
                placeholder={language === 'es' ? 'Ciudad' : 'City'}
                value={city}
                onChange={e => {
                  setCity(e.target.value)
                  updateCityState(e.target.value, stateCode)
                }}
                autoComplete="address-level2"
              />
            </div>
            <div>
              <StateSelect
                value={stateCode}
                onChange={val => {
                  setStateCode(val)
                  updateCityState(city, val)
                }}
                placeholder={language === 'es' ? 'Estado' : 'State'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
