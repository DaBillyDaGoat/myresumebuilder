'use client'

import { useState } from 'react'
import type { Language, FormData } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface SkillsProps {
  formData: FormData
  onChange: (updates: Partial<FormData>) => void
  language: Language
}

const COMPUTER_SKILLS = ['MS Word', 'MS Excel', 'Google Docs', 'Email', 'Social Media', 'POS Systems', 'Data Entry', 'Tech Troubleshooting', 'Fast Typing']
const COMMUNICATION_SKILLS = ['Bilingual', 'Customer Service', 'Phone/Email Communication', 'Public Speaking', 'Professional Writing']
const PHYSICAL_SKILLS = ['Heavy Lifting 50+lbs', 'Equipment Operation', 'Hand/Power Tools', 'Cleaning/Sanitation', 'Commercial Driving', 'Food Prep/Cooking']
const INTERPERSONAL_SKILLS = ['Teamwork', 'Leadership', 'Conflict Resolution', 'Training Others', 'Time Management', 'Multitasking', 'Reliability/Dependability']

export function Skills({ formData, onChange, language }: SkillsProps) {
  const t = language === 'es' ? esStrings : enStrings
  const [showBilingual, setShowBilingual] = useState(formData.skills.communication.includes('Bilingual'))

  const skills = formData.skills

  const toggle = (category: 'computer' | 'communication' | 'physical' | 'interpersonal', skill: string) => {
    const current = skills[category] || []
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill]

    if (category === 'communication' && skill === 'Bilingual') {
      setShowBilingual(!current.includes('Bilingual'))
    }

    onChange({ skills: { ...skills, [category]: updated } })
  }

  const renderCategory = (
    title: string,
    category: 'computer' | 'communication' | 'physical' | 'interpersonal',
    items: string[]
  ) => (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(skill => (
          <label key={skill} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 min-h-[44px]">
            <input
              type="checkbox"
              checked={(skills[category] || []).includes(skill)}
              onChange={() => toggle(category, skill)}
              className="w-5 h-5 text-[#0A66C2] rounded flex-shrink-0"
            />
            <span className="text-sm font-medium text-gray-800">{skill}</span>
          </label>
        ))}
      </div>

      {category === 'communication' && showBilingual && (
        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.skills.bilingualLanguage}</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]"
            placeholder={t.skills.bilingualPlaceholder}
            value={skills.bilingualLanguage || ''}
            onChange={e => onChange({ skills: { ...skills, bilingualLanguage: e.target.value } })}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {renderCategory(t.skills.computer, 'computer', COMPUTER_SKILLS)}
      {renderCategory(t.skills.communication, 'communication', COMMUNICATION_SKILLS)}
      {renderCategory(t.skills.physical, 'physical', PHYSICAL_SKILLS)}
      {renderCategory(t.skills.interpersonal, 'interpersonal', INTERPERSONAL_SKILLS)}

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">{t.skills.other}</h3>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[100px] resize-y"
          placeholder={t.skills.otherPlaceholder}
          value={skills.other || ''}
          onChange={e => onChange({ skills: { ...skills, other: e.target.value } })}
        />
      </div>
    </div>
  )
}
