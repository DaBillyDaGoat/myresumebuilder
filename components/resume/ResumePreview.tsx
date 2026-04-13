'use client'

import { useState } from 'react'
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
  language: Language
  onReorder: (newOrder: string[]) => void
  onFinalize: () => void
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

export function ResumePreview({ resume, formData, sectionOrder, annotations, language, onReorder, onFinalize }: ResumePreviewProps) {
  const t = language === 'es' ? esStrings : enStrings
  const [dismissedNotes, setDismissedNotes] = useState<Set<string>>(new Set())

  const dismissNote = (id: string) => setDismissedNotes(prev => new Set([...prev, id]))

  const visibleAnnotations = Object.entries(annotations).filter(([id]) => !dismissedNotes.has(id))

  const contact = formData.contact
  const contactLine = [
    contact.phone,
    contact.email,
    contact.addressOption === 'full' ? contact.addressFull :
    contact.addressOption === 'city-state' ? contact.cityState : null,
  ].filter(Boolean).join(' | ')

  const { sections } = resume

  const renderSection = (sectionId: string) => {
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

    switch (sectionId) {
      case 'summary':
        if (!resume.summary) return null
        return (
          <div key="summary" className="mb-4">
            <h2 style={headerStyle}>{language === 'es' ? 'Resumen Profesional' : 'Professional Summary'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{resume.summary}</p>
          </div>
        )

      case 'work':
        if (!sections.work || sections.work.length === 0) return null
        return (
          <div key="work">
            <h2 style={headerStyle}>{language === 'es' ? 'Experiencia Laboral' : 'Work Experience'}</h2>
            {sections.work.map((job, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{job.title}</span>
                  <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{job.dates}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>
                  {job.employer}{job.cityState ? `, ${job.cityState}` : ''}
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  {job.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                    <li key={bIdx} style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px' }}>{bullet}</li>
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
            {sections.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{edu.degree}</span>
                  <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.dates}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555' }}>
                  {edu.school}{edu.cityState ? `, ${edu.cityState}` : ''}
                </div>
                {edu.notes && <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{edu.notes}</div>}
              </div>
            ))}
          </div>
        )

      case 'certifications':
        if (!sections.certifications || sections.certifications.length === 0) return null
        return (
          <div key="certifications">
            <h2 style={headerStyle}>{language === 'es' ? 'Certificaciones' : 'Certifications'}</h2>
            {sections.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-start mb-1">
                <span style={{ fontSize: '12.5px', color: '#333' }}>{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                {cert.date && <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{cert.date}</span>}
              </div>
            ))}
          </div>
        )

      case 'skills':
        if (!sections.skills?.text) return null
        return (
          <div key="skills">
            <h2 style={headerStyle}>{language === 'es' ? 'Habilidades' : 'Skills'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{sections.skills.text}</p>
          </div>
        )

      case 'volunteer':
        if (!sections.volunteer || sections.volunteer.length === 0) return null
        return (
          <div key="volunteer">
            <h2 style={headerStyle}>{language === 'es' ? 'Trabajo Voluntario' : 'Volunteer Work'}</h2>
            {sections.volunteer.map((v, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{v.role}</span>
                  <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{v.dates}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>{v.org}</div>
                {v.bullets && (
                  <ul style={{ paddingLeft: '18px', margin: 0 }}>
                    {v.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                      <li key={bIdx} style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px' }}>{bullet}</li>
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
            {sections.training.map((tr, idx) => (
              <div key={idx} className="flex justify-between items-start mb-1">
                <span style={{ fontSize: '12.5px', color: '#333' }}>{tr.program}{tr.provider ? ` — ${tr.provider}` : ''}</span>
                {tr.date && <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{tr.date}</span>}
              </div>
            ))}
          </div>
        )

      case 'awards':
        if (!sections.awards || sections.awards.length === 0) return null
        return (
          <div key="awards">
            <h2 style={headerStyle}>{language === 'es' ? 'Premios y Reconocimientos' : 'Awards & Recognition'}</h2>
            {sections.awards.map((aw, idx) => (
              <div key={idx} className="flex justify-between items-start mb-1">
                <span style={{ fontSize: '12.5px', color: '#333' }}>{aw.name}{aw.giver ? ` — ${aw.giver}` : ''}</span>
                {aw.date && <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{aw.date}</span>}
              </div>
            ))}
          </div>
        )

      case 'interests':
        if (!sections.interests) return null
        return (
          <div key="interests">
            <h2 style={headerStyle}>{language === 'es' ? 'Intereses' : 'Interests'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{sections.interests}</p>
          </div>
        )

      case 'references':
        return (
          <div key="references">
            <h2 style={headerStyle}>{language === 'es' ? 'Referencias' : 'References'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333' }}>{sections.references || 'Available upon request'}</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.preview.title}</h1>
        <p className="text-gray-600 mt-1">{t.preview.subtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar: tips and section reorder */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Section reorder */}
          <SectionReorder sectionOrder={sectionOrder} onReorder={onReorder} language={language} />

          {/* Sticky notes */}
          {visibleAnnotations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t.preview.annotations}</h3>
              {visibleAnnotations.map(([id, text]) => (
                <StickyNote
                  key={id}
                  text={text}
                  sectionTitle={language === 'es' ? SECTION_LABELS[id]?.es || id : SECTION_LABELS[id]?.en || id}
                  onDismiss={() => dismissNote(id)}
                />
              ))}
            </div>
          )}

          {/* Finalize button (mobile) */}
          <button
            onClick={onFinalize}
            className="w-full lg:hidden bg-[#0A66C2] text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 min-h-[44px]"
          >
            {t.preview.finalize}
          </button>
        </div>

        {/* Resume preview */}
        <div className="flex-1">
          <div className="overflow-x-auto">
            <div
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
              {/* Name header */}
              <div className="mb-3">
                <h1 style={{ fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'underline', textDecorationColor: 'black', textDecorationThickness: '2.5px', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {contact.fullName || 'YOUR NAME'}
                </h1>
                <p style={{ fontSize: '13px', color: '#555' }}>{contactLine}</p>
              </div>

              {/* Sections in order */}
              {sectionOrder.map(id => renderSection(id))}
            </div>
          </div>

          {/* Finalize button (desktop) */}
          <div className="hidden lg:flex justify-center mt-6">
            <button
              onClick={onFinalize}
              className="bg-[#0A66C2] text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 min-h-[44px] text-lg"
            >
              {t.preview.finalize}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
