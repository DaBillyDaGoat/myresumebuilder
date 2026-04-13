'use client'

import type { Language, FormData, MilitaryService as MilitaryServiceType } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface MilitaryProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

const defaultMilitary: MilitaryServiceType = {
  branch: '', startDate: '', endDate: '', rank: '', mos: '', dischargeStatus: '', notes: '',
}

export function Military({ formData, onChange, language }: MilitaryProps) {
  const t = language === 'es' ? esStrings : enStrings
  const mil = formData.military || defaultMilitary

  const update = (field: keyof MilitaryServiceType, value: string) => {
    onChange({ military: { ...mil, [field]: value } })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>{t.military.branch}</label>
        <select className={inputClass} value={mil.branch} onChange={e => update('branch', e.target.value)}>
          <option value="">{t.military.branchPlaceholder}</option>
          {(t.military.branches as string[]).map((b: string) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t.military.startDate}</label>
          <input type="text" className={inputClass} placeholder="MM/YYYY" value={mil.startDate} onChange={e => update('startDate', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>{t.military.endDate}</label>
          <input type="text" className={inputClass} placeholder="MM/YYYY" value={mil.endDate} onChange={e => update('endDate', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.military.rank}</label>
        <input type="text" className={inputClass} placeholder={t.military.rankPlaceholder} value={mil.rank} onChange={e => update('rank', e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>{t.military.mos}</label>
        <input type="text" className={inputClass} placeholder={t.military.mosPlaceholder} value={mil.mos} onChange={e => update('mos', e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>{t.military.dischargeStatus}</label>
        <input type="text" className={inputClass} placeholder={t.military.dischargePlaceholder} value={mil.dischargeStatus} onChange={e => update('dischargeStatus', e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>{t.military.notes}</label>
        <textarea className={`${inputClass} min-h-[100px] resize-y`} placeholder={t.military.notesPlaceholder} value={mil.notes} onChange={e => update('notes', e.target.value)} />
      </div>
    </div>
  )
}
