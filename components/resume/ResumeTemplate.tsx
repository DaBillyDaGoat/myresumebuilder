'use client'

import type { GeneratedResume } from '@/types'

interface ContactInfo {
  fullName?: string
  phone?: string
  email?: string
  addressOption?: string
  addressFull?: string
  cityState?: string
}

interface ResumeTemplateProps {
  resume: GeneratedResume
  sectionOrder: string[]
  contact?: ContactInfo
  isEditing?: boolean
  onEdit?: (sectionId: string, field: string, value: string) => void
}

// ResumeTemplate renders the full PDF-targetable resume div.
// Pass `contact` to include the name/contact header (required for PDF export from step 18).
export function ResumeTemplate({ resume, sectionOrder, contact }: ResumeTemplateProps) {
  const contactLine = contact ? [
    contact.phone,
    contact.email,
    contact.addressOption === 'full' ? contact.addressFull :
    contact.addressOption === 'city-state' ? contact.cityState : null,
  ].filter(Boolean).join(' | ') : ''
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Resumen Profesional' : 'Professional Summary'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{resume.summary}</p>
          </div>
        )

      case 'work':
        if (!sections.work || sections.work.length === 0) return null
        return (
          <div key="work">
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Experiencia Laboral' : 'Work Experience'}</h2>
            {sections.work.map((job, idx) => (
              <div key={idx} className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{job.title}</span>
                  <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{job.dates}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>
                  {job.employer}{job.cityState ? `, ${job.cityState}` : ''}
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  {job.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                    <li key={bIdx} style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px', listStyleType: 'disc' }}>{bullet}</li>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Educación' : 'Education'}</h2>
            {sections.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Certificaciones' : 'Certifications'}</h2>
            {sections.certifications.map((cert, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Habilidades' : 'Skills'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{sections.skills.text}</p>
          </div>
        )

      case 'volunteer':
        if (!sections.volunteer || sections.volunteer.length === 0) return null
        return (
          <div key="volunteer">
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Trabajo Voluntario' : 'Volunteer Work'}</h2>
            {sections.volunteer.map((v, idx) => (
              <div key={idx} className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{v.role}</span>
                  <span style={{ fontSize: '12px', color: '#777', whiteSpace: 'nowrap', marginLeft: '8px' }}>{v.dates}</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>{v.org}</div>
                {v.bullets && v.bullets.length > 0 && (
                  <ul style={{ paddingLeft: '18px', margin: 0 }}>
                    {v.bullets.filter(b => b.trim()).map((bullet, bIdx) => (
                      <li key={bIdx} style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6', marginBottom: '3px', listStyleType: 'disc' }}>{bullet}</li>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Capacitación' : 'Training & Courses'}</h2>
            {sections.training.map((tr, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Premios y Reconocimientos' : 'Awards & Recognition'}</h2>
            {sections.awards.map((aw, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Intereses' : 'Interests'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.6' }}>{sections.interests}</p>
          </div>
        )

      case 'references':
        return (
          <div key="references">
            <h2 style={headerStyle}>{resume.language === 'es' ? 'Referencias' : 'References'}</h2>
            <p style={{ fontSize: '12.5px', color: '#333' }}>{sections.references || 'Available upon request'}</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      id="resume-pdf-target"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        width: '8.5in',
        minHeight: '11in',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '0.6in',
        boxSizing: 'border-box',
      }}
    >
      {contact?.fullName && (
        <div style={{ marginBottom: '12px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'underline', textDecorationColor: 'black', textDecorationThickness: '2.5px', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {contact.fullName}
          </h1>
          {contactLine && <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{contactLine}</p>}
        </div>
      )}
      {sectionOrder.map(id => renderSection(id))}
    </div>
  )
}
