'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { GeneratedResume, Language, FormData } from '@/types'
import { StickyNote } from './StickyNote'
import { SectionReorder } from './SectionReorder'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface ResumePreviewProps {
  resume: GeneratedResume
  formData: FormData
  sectionOrder: string[]
  annotations: Record<string, string>
  annotationsLoading?: boolean
  language: Language
  onReorder: (newOrder: string[]) => void
  onFinalize: () => void
  onResumeChange?: (updater: (prev: GeneratedResume) => GeneratedResume) => void
}

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

// Inline-editable text element. Uses contentEditable.
// Does NOT re-render on every parent re-render (only on value change from outside editing).
function EditText({
  value,
  style,
  tag = 'span',
  onCommit,
}: {
  value: string
  style?: React.CSSProperties
  tag?: 'span' | 'p' | 'li'
  onCommit?: (v: string) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const isEditing = useRef(false)

  // Sync value to DOM only when not actively editing
  useEffect(() => {
    if (ref.current && !isEditing.current) {
      if (ref.current.textContent !== value) {
        ref.current.textContent = value
      }
    }
  }, [value])

  const Tag = tag as React.ElementType

  return (
    <Tag
      ref={ref}
      contentEditable={!!onCommit}
      suppressContentEditableWarning
      style={{
        ...style,
        cursor: onCommit ? 'text' : 'default',
        borderRadius: '2px',
        transition: 'background 0.1s',
      }}
      className={onCommit ? 'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none' : undefined}
      onFocus={() => { isEditing.current = true }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        isEditing.current = false
        if (onCommit) {
          const newVal = e.currentTarget.textContent || ''
          if (newVal !== value) onCommit(newVal)
        }
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && tag !== 'li') {
          e.preventDefault()
          ;(e.target as HTMLElement).blur()
        }
      }}
    />
  )
}

export function ResumePreview({
  resume,
  formData,
  sectionOrder,
  annotations,
  annotationsLoading = false,
  language,
  onReorder,
  onFinalize,
  onResumeChange,
}: ResumePreviewProps) {
  const t = language === 'es' ? esStrings : enStrings
  const [dismissedNotes, setDismissedNotes] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const resumeRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const [resumeHeight, setResumeHeight] = useState(1056)

  const RESUME_WIDTH = 816 // 8.5in * 96dpi

  // Responsive scaling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setPreviewScale(w < RESUME_WIDTH ? w / RESUME_WIDTH : 1)
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Track resume height for container sizing
  useEffect(() => {
    const el = resumeRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setResumeHeight(entry.contentRect.height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const dismissNote = (id: string) => setDismissedNotes(prev => new Set([...prev, id]))

  const orderedAnnotations = sectionOrder
    .filter(id => !dismissedNotes.has(id))
    .map((id, idx) => ({ id, text: annotations[id] || null, badgeNumber: idx + 1, loading: annotationsLoading && !annotations[id] }))
    .filter(a => a.text || a.loading)

  const edit = useCallback((updater: (prev: GeneratedResume) => GeneratedResume) => {
    onResumeChange?.(updater)
  }, [onResumeChange])

  const contact = formData.contact
  const contactLine = [
    contact.phone,
    contact.email,
    contact.addressOption === 'full' ? contact.addressFull :
    contact.addressOption === 'city-state' ? contact.cityState : null,
  ].filter(Boolean).join(' | ')

  const { sections } = resume

  const headerStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: '#1A1A1A',
    borderBottom: '1px solid #D0D0D0',
    paddingBottom: '3px',
    marginBottom: '6px',
    marginTop: '12px',
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        if (!resume.summary) return null
        return (
          <div key="summary" className="mb-4">
            <h2 style={headerStyle}>{language === 'es' ? 'Resumen Profesional' : 'Professional Summary'}</h2>
            <EditText
              value={resume.summary}
              style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', display: 'block' }}
              tag="p"
              onCommit={v => edit(r => ({ ...r, summary: v }))}
            />
          </div>
        )

      case 'work':
        if (!sections.work || sections.work.length === 0) return null
        return (
          <div key="work">
            <h2 style={headerStyle}>{language === 'es' ? 'Experiencia Laboral' : 'Work Experience'}</h2>
            {sections.work.map((job, jobIdx) => (
              <div key={jobIdx} className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <EditText
                    value={job.title}
                    style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, work: r.sections.work?.map((j, i) => i === jobIdx ? { ...j, title: v } : j) } }))}
                  />
                  <EditText
                    value={job.dates}
                    style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, work: r.sections.work?.map((j, i) => i === jobIdx ? { ...j, dates: v } : j) } }))}
                  />
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>
                  <EditText
                    value={job.employer + (job.cityState ? `, ${job.cityState}` : '')}
                    style={{ fontSize: '13px', fontStyle: 'italic', color: '#555' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, work: r.sections.work?.map((j, i) => i === jobIdx ? { ...j, employer: v } : j) } }))}
                  />
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  {job.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                    <EditText
                      key={bIdx}
                      value={bullet}
                      tag="li"
                      style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px' }}
                      onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, work: r.sections.work?.map((j, ji) => ji === jobIdx ? { ...j, bullets: j.bullets.map((b, bi) => bi === bIdx ? v : b) } : j) } }))}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )

      case 'education':
        if (!sections.education || sections.education.length === 0) return null
        return (
          <div key="education">
            <h2 style={headerStyle}>{language === 'es' ? 'Educación' : 'Education'}</h2>
            {sections.education.map((edu, eduIdx) => (
              <div key={eduIdx} className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <EditText
                    value={edu.degree}
                    style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, education: r.sections.education?.map((e, i) => i === eduIdx ? { ...e, degree: v } : e) } }))}
                  />
                  <EditText
                    value={edu.dates}
                    style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, education: r.sections.education?.map((e, i) => i === eduIdx ? { ...e, dates: v } : e) } }))}
                  />
                </div>
                <EditText
                  value={edu.school + (edu.cityState ? `, ${edu.cityState}` : '')}
                  style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', display: 'block' }}
                  onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, education: r.sections.education?.map((e, i) => i === eduIdx ? { ...e, school: v } : e) } }))}
                />
                {edu.notes && (
                  <EditText
                    value={edu.notes}
                    style={{ fontSize: '12px', color: '#555', marginTop: '2px', display: 'block' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, education: r.sections.education?.map((e, i) => i === eduIdx ? { ...e, notes: v } : e) } }))}
                  />
                )}
              </div>
            ))}
          </div>
        )

      case 'certifications':
        if (!sections.certifications || sections.certifications.length === 0) return null
        return (
          <div key="certifications">
            <h2 style={headerStyle}>{language === 'es' ? 'Certificaciones' : 'Certifications'}</h2>
            {sections.certifications.map((cert, certIdx) => (
              <div key={certIdx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <EditText
                  value={cert.name + (cert.issuer ? ` — ${cert.issuer}` : '')}
                  style={{ fontSize: '12.5px', color: '#333' }}
                  onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, certifications: r.sections.certifications?.map((c, i) => i === certIdx ? { ...c, name: v } : c) } }))}
                />
                {cert.date && (
                  <EditText
                    value={cert.date}
                    style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}
                    onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, certifications: r.sections.certifications?.map((c, i) => i === certIdx ? { ...c, date: v } : c) } }))}
                  />
                )}
              </div>
            ))}
          </div>
        )

      case 'skills':
        if (!sections.skills?.text) return null
        return (
          <div key="skills">
            <h2 style={headerStyle}>{language === 'es' ? 'Habilidades' : 'Skills'}</h2>
            <EditText
              value={sections.skills.text}
              style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', display: 'block' }}
              tag="p"
              onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, skills: { text: v } } }))}
            />
          </div>
        )

      case 'volunteer':
        if (!sections.volunteer || sections.volunteer.length === 0) return null
        return (
          <div key="volunteer">
            <h2 style={headerStyle}>{language === 'es' ? 'Trabajo Voluntario' : 'Volunteer Work'}</h2>
            {sections.volunteer.map((v, vIdx) => (
              <div key={vIdx} className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <EditText value={v.role} style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }} onCommit={val => edit(r => ({ ...r, sections: { ...r.sections, volunteer: r.sections.volunteer?.map((x, i) => i === vIdx ? { ...x, role: val } : x) } }))} />
                  <EditText value={v.dates} style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }} onCommit={val => edit(r => ({ ...r, sections: { ...r.sections, volunteer: r.sections.volunteer?.map((x, i) => i === vIdx ? { ...x, dates: val } : x) } }))} />
                </div>
                <EditText value={v.org} style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px', display: 'block' }} onCommit={val => edit(r => ({ ...r, sections: { ...r.sections, volunteer: r.sections.volunteer?.map((x, i) => i === vIdx ? { ...x, org: val } : x) } }))} />
                {v.bullets && v.bullets.length > 0 && (
                  <ul style={{ paddingLeft: '18px', margin: 0 }}>
                    {v.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                      <EditText key={bIdx} value={bullet} tag="li" style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px' }} onCommit={val => edit(r => ({ ...r, sections: { ...r.sections, volunteer: r.sections.volunteer?.map((x, xi) => xi === vIdx ? { ...x, bullets: x.bullets.map((b, bi) => bi === bIdx ? val : b) } : x) } }))} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )

      case 'training':
        if (!sections.training || sections.training.length === 0) return null
        return (
          <div key="training">
            <h2 style={headerStyle}>{language === 'es' ? 'Capacitación' : 'Training & Courses'}</h2>
            {sections.training.map((tr, trIdx) => (
              <div key={trIdx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <EditText value={tr.program + (tr.provider ? ` — ${tr.provider}` : '')} style={{ fontSize: '12.5px', color: '#333' }} onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, training: r.sections.training?.map((x, i) => i === trIdx ? { ...x, program: v } : x) } }))} />
                {tr.date && <EditText value={tr.date} style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }} onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, training: r.sections.training?.map((x, i) => i === trIdx ? { ...x, date: v } : x) } }))} />}
              </div>
            ))}
          </div>
        )

      case 'awards':
        if (!sections.awards || sections.awards.length === 0) return null
        return (
          <div key="awards">
            <h2 style={headerStyle}>{language === 'es' ? 'Premios y Reconocimientos' : 'Awards & Recognition'}</h2>
            {sections.awards.map((aw, awIdx) => (
              <div key={awIdx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <EditText value={aw.name + (aw.giver ? ` — ${aw.giver}` : '')} style={{ fontSize: '12.5px', color: '#333' }} onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, awards: r.sections.awards?.map((x, i) => i === awIdx ? { ...x, name: v } : x) } }))} />
                {aw.date && <EditText value={aw.date} style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }} onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, awards: r.sections.awards?.map((x, i) => i === awIdx ? { ...x, date: v } : x) } }))} />}
              </div>
            ))}
          </div>
        )

      case 'interests':
        if (!sections.interests) return null
        return (
          <div key="interests">
            <h2 style={headerStyle}>{language === 'es' ? 'Intereses' : 'Interests'}</h2>
            <EditText value={sections.interests} style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', display: 'block' }} tag="p" onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, interests: v } }))} />
          </div>
        )

      case 'references':
        return (
          <div key="references">
            <h2 style={headerStyle}>{language === 'es' ? 'Referencias' : 'References'}</h2>
            <EditText value={sections.references || 'Available upon request'} style={{ fontSize: '12.5px', color: '#333', display: 'block' }} tag="p" onCommit={v => edit(r => ({ ...r, sections: { ...r.sections, references: v } }))} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.preview.title}</h1>
        <p className="text-gray-600 mt-1">{t.preview.subtitle}</p>
        {onResumeChange && (
          <p className="text-xs text-[#0A66C2] mt-1">
            {language === 'es' ? '✏️ Toca cualquier texto para editarlo' : '✏️ Tap any text to edit it'}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <SectionReorder sectionOrder={sectionOrder} onReorder={onReorder} language={language} />

          {/* Sticky notes */}
          {(orderedAnnotations.length > 0 || annotationsLoading) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {t.preview.annotations}
              </h3>
              {annotationsLoading && orderedAnnotations.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  {language === 'es' ? 'Generando consejos...' : 'Generating tips...'}
                </div>
              ) : (
                orderedAnnotations.map(({ id, text, badgeNumber }) => text ? (
                  <StickyNote
                    key={id}
                    text={text}
                    sectionTitle={language === 'es' ? SECTION_LABELS[id]?.es || id : SECTION_LABELS[id]?.en || id}
                    badgeNumber={badgeNumber}
                    onDismiss={() => dismissNote(id)}
                  />
                ) : null)
              )}
            </div>
          )}

          <button onClick={onFinalize} className="w-full lg:hidden bg-[#0A66C2] text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 min-h-[44px]">
            {t.preview.finalize}
          </button>
        </div>

        {/* Resume preview with responsive scaling */}
        <div className="flex-1 min-w-0">
          {/* Scaling container */}
          <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{
              height: `${Math.round(resumeHeight * previewScale)}px`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${RESUME_WIDTH}px`,
                transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
                transformOrigin: 'top left',
              }}>
                <div
                  ref={resumeRef}
                  id="resume-pdf-target"
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    width: '8.5in',
                    minHeight: '11in',
                    backgroundColor: 'white',
                    padding: '0.6in',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}
                >
                  {/* Name */}
                  <div className="mb-3">
                    <h1 style={{ fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'underline', textDecorationColor: 'black', textDecorationThickness: '2.5px', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {contact.fullName || 'YOUR NAME'}
                    </h1>
                    <p style={{ fontSize: '13px', color: '#555' }}>{contactLine}</p>
                  </div>

                  {sectionOrder.map(id => renderSection(id))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center mt-6">
            <button onClick={onFinalize} className="bg-[#0A66C2] text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 min-h-[44px] text-lg">
              {t.preview.finalize}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
