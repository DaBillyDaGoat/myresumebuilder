'use client'

import { useState } from 'react'
import type { Language, Certification, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface CertificationsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const CERT_NAMES = [
  'Food Handler',
  'CPR/First Aid',
  'OSHA 10',
  'OSHA 30',
  'Forklift Operator',
  "Driver's License",
  'CDL',
  'Security Guard License',
  'Notary Public',
  'CompTIA A+',
  'Cosmetology License',
  'CNA',
  'Other',
]

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

export function Certifications({ formData, onChange, language }: CertificationsProps) {
  const t = language === 'es' ? esStrings : enStrings
  const [otherText, setOtherText] = useState('')

  // Ensure all cert names are in the list
  const allCerts: Certification[] = CERT_NAMES.map(name => {
    const existing = formData.certifications.find(c => c.name === name)
    return existing || {
      id: name,
      name,
      issuer: '',
      expiration: '',
      status: 'Active' as const,
      selected: false,
    }
  })

  const toggleCert = (name: string) => {
    const updated = allCerts.map(c => c.name === name ? { ...c, selected: !c.selected } : c)
    onChange({ certifications: updated })
  }

  const updateCert = (name: string, field: keyof Certification, value: string) => {
    const updated = allCerts.map(c => c.name === name ? { ...c, [field]: value } : c)
    onChange({ certifications: updated })
  }

  const selectedCerts = allCerts.filter(c => c.selected)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{t.certifications.title}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CERT_NAMES.map(name => {
          const cert = allCerts.find(c => c.name === name)!
          return (
            <label key={name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="checkbox"
                checked={cert.selected}
                onChange={() => toggleCert(name)}
                className="w-5 h-5 text-[#0A66C2] rounded flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-800">{name}</span>
            </label>
          )
        })}
      </div>

      {/* Expanded details for selected certs */}
      {selectedCerts.length > 0 && (
        <div className="mt-6 space-y-6">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            {language === 'es' ? 'Detalles de certificaciones seleccionadas' : 'Details for selected certifications'}
          </h3>
          {selectedCerts.map(cert => (
            <div key={cert.name} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-blue-50">
              <h4 className="font-semibold text-[#0A66C2]">{cert.name}</h4>

              {cert.name === 'Other' && (
                <div>
                  <label className={labelClass}>{language === 'es' ? 'Nombre de la certificación' : 'Certification name'}</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={language === 'es' ? 'Escribe el nombre' : 'Enter name'}
                    value={otherText}
                    onChange={e => setOtherText(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t.certifications.issuer}</label>
                  <input type="text" className={inputClass} placeholder={t.certifications.issuerPlaceholder} value={cert.issuer} onChange={e => updateCert(cert.name, 'issuer', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>{t.certifications.expiration}</label>
                  <input type="text" className={inputClass} placeholder={t.certifications.expirationPlaceholder} value={cert.expiration} onChange={e => updateCert(cert.name, 'expiration', e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.certifications.status}</label>
                <div className="flex gap-3">
                  {(['Active', 'Expired', 'In Progress'] as const).map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                      <input type="radio" name={`status-${cert.name}`} value={status} checked={cert.status === status} onChange={() => updateCert(cert.name, 'status', status)} className="w-4 h-4 text-[#0A66C2]" />
                      <span className="text-sm">{status === 'Active' ? t.certifications.active : status === 'Expired' ? t.certifications.expired : t.certifications.inProgress}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
