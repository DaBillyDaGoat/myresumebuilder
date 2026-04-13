'use client'

import type { Language, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface AvailabilityProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const TRANSPORT_OPTIONS = ['car', 'transit', 'bicycle', 'needAssistance'] as const

export function Availability({ formData, onChange, language }: AvailabilityProps) {
  const t = language === 'es' ? esStrings : enStrings
  const a = formData.availability

  const scheduleOptions = t.availability.scheduleOptions as Record<string, string>
  const transportLabels = t.availability.transportationOptions as Record<string, string>
  const relocateOptions = t.availability.relocateOptions as Record<string, string>

  const toggleTransport = (key: string) => {
    const current = a.transportation || []
    const updated = current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key]
    onChange({ availability: { ...a, transportation: updated } })
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
        🔒 {t.availability.private}
      </p>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{t.availability.schedule}</p>
        <div className="space-y-2">
          {(['open', 'weekdays', 'weekends', 'flexible'] as const).map(option => (
            <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="radio"
                name="schedule"
                value={option}
                checked={a.schedule === option}
                onChange={() => onChange({ availability: { ...a, schedule: option } })}
                className="w-4 h-4 text-[#0A66C2]"
              />
              <span className="text-base font-medium text-gray-800">{scheduleOptions[option]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{t.availability.transportation}</p>
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORT_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="checkbox"
                checked={(a.transportation || []).includes(option)}
                onChange={() => toggleTransport(option)}
                className="w-5 h-5 text-[#0A66C2] rounded"
              />
              <span className="text-sm font-medium text-gray-800">{transportLabels[option]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{t.availability.relocate}</p>
        <div className="space-y-2">
          {(['yes', 'no', 'local'] as const).map(option => (
            <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
              <input
                type="radio"
                name="relocate"
                value={option}
                checked={a.willingToRelocate === option}
                onChange={() => onChange({ availability: { ...a, willingToRelocate: option } })}
                className="w-4 h-4 text-[#0A66C2]"
              />
              <span className="text-base font-medium text-gray-800">{relocateOptions[option]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
