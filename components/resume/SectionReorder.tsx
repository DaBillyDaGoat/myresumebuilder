'use client'

import type { Language } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface SectionReorderProps {
  sectionOrder: string[]
  onReorder: (newOrder: string[]) => void
  language: Language
}

const LOCKED_TOP = ['summary']
const LOCKED_BOTTOM = ['references']

const SECTION_LABELS: Record<string, { en: string; es: string }> = {
  summary: { en: 'Professional Summary', es: 'Resumen Profesional' },
  work: { en: 'Work Experience', es: 'Experiencia Laboral' },
  education: { en: 'Education', es: 'Educación' },
  certifications: { en: 'Certifications', es: 'Certificaciones' },
  skills: { en: 'Skills', es: 'Habilidades' },
  volunteer: { en: 'Volunteer Work', es: 'Trabajo Voluntario' },
  training: { en: 'Training & Courses', es: 'Capacitación' },
  awards: { en: 'Awards & Recognition', es: 'Premios' },
  interests: { en: 'Interests', es: 'Intereses' },
  references: { en: 'References', es: 'Referencias' },
}

export function SectionReorder({ sectionOrder, onReorder, language }: SectionReorderProps) {
  const t = language === 'es' ? esStrings : enStrings

  const moveUp = (index: number) => {
    const section = sectionOrder[index]
    if (LOCKED_TOP.includes(section) || index === 0) return

    const movableOrder = sectionOrder.filter(s => !LOCKED_TOP.includes(s) && !LOCKED_BOTTOM.includes(s))
    const movableIdx = movableOrder.indexOf(section)
    if (movableIdx <= 0) return

    const newMovable = [...movableOrder]
    ;[newMovable[movableIdx - 1], newMovable[movableIdx]] = [newMovable[movableIdx], newMovable[movableIdx - 1]]

    const newOrder = [
      ...LOCKED_TOP.filter(s => sectionOrder.includes(s)),
      ...newMovable,
      ...LOCKED_BOTTOM.filter(s => sectionOrder.includes(s)),
    ]
    onReorder(newOrder)
  }

  const moveDown = (index: number) => {
    const section = sectionOrder[index]
    if (LOCKED_BOTTOM.includes(section) || index === sectionOrder.length - 1) return

    const movableOrder = sectionOrder.filter(s => !LOCKED_TOP.includes(s) && !LOCKED_BOTTOM.includes(s))
    const movableIdx = movableOrder.indexOf(section)
    if (movableIdx < 0 || movableIdx >= movableOrder.length - 1) return

    const newMovable = [...movableOrder]
    ;[newMovable[movableIdx], newMovable[movableIdx + 1]] = [newMovable[movableIdx + 1], newMovable[movableIdx]]

    const newOrder = [
      ...LOCKED_TOP.filter(s => sectionOrder.includes(s)),
      ...newMovable,
      ...LOCKED_BOTTOM.filter(s => sectionOrder.includes(s)),
    ]
    onReorder(newOrder)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{t.preview.sectionOrder}</h3>
      <div className="space-y-1">
        {sectionOrder.map((section, idx) => {
          const isLocked = LOCKED_TOP.includes(section) || LOCKED_BOTTOM.includes(section)
          const label = language === 'es'
            ? SECTION_LABELS[section]?.es || section
            : SECTION_LABELS[section]?.en || section

          return (
            <div key={section} className={`flex items-center justify-between gap-2 p-2 rounded-lg ${isLocked ? 'bg-gray-50' : 'bg-white border border-gray-100 hover:border-gray-200'}`}>
              <span className="text-sm text-gray-700 flex-1">{label}</span>
              {isLocked ? (
                <span className="text-xs text-gray-400 italic">{t.preview.locked}</span>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(idx)}
                    className="text-gray-400 hover:text-gray-700 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center rounded"
                    aria-label={t.preview.moveUp}
                    disabled={idx === 0 || LOCKED_TOP.includes(sectionOrder[idx - 1])}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    className="text-gray-400 hover:text-gray-700 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center rounded"
                    aria-label={t.preview.moveDown}
                    disabled={idx === sectionOrder.length - 1 || LOCKED_BOTTOM.includes(sectionOrder[idx + 1])}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
