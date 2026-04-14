'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Language, FormData, GeneratedResume } from '@/types'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { StepWrapper } from '@/components/questionnaire/StepWrapper'
import { ContactInfo } from '@/components/questionnaire/ContactInfo'
import { WorkExperience } from '@/components/questionnaire/WorkExperience'
import { Education } from '@/components/questionnaire/Education'
import { VolunteerWork } from '@/components/questionnaire/VolunteerWork'
import { Certifications } from '@/components/questionnaire/Certifications'
import { Skills } from '@/components/questionnaire/Skills'
import { Military } from '@/components/questionnaire/Military'
import { Training } from '@/components/questionnaire/Training'
import { Awards } from '@/components/questionnaire/Awards'
import { EmploymentGaps } from '@/components/questionnaire/EmploymentGaps'
import { Accomplishments } from '@/components/questionnaire/Accomplishments'
import { Interests } from '@/components/questionnaire/Interests'
import { References } from '@/components/questionnaire/References'
import { SummaryBuilder } from '@/components/questionnaire/SummaryBuilder'
import { Availability } from '@/components/questionnaire/Availability'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { ResumeTemplate } from '@/components/resume/ResumeTemplate'
import { PDFGenerator } from '@/components/export/PDFGenerator'
import { EmailForm } from '@/components/export/EmailForm'
import { getDefaultSectionOrder } from '@/lib/resume-logic'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

const initialFormData: FormData = {
  contact: { fullName: '', legalName: '', phone: '', email: '', addressOption: 'city-state', addressFull: '', cityState: '' },
  work: [],
  education: [],
  volunteer: [],
  certifications: [],
  skills: { computer: [], communication: [], physical: [], interpersonal: [], other: '' },
  military: null,
  training: [],
  awards: [],
  employmentGaps: [],
  accomplishments: [],
  interests: '',
  references: { type: 'request', list: [] },
  summary: { targetRole: '', strengths: '' },
  availability: { schedule: 'open', transportation: [], willingToRelocate: 'yes' },
}

const TOTAL_STEPS = 15

function BuilderContent() {
  const searchParams = useSearchParams()
  const [language, setLanguage] = useState<Language>((searchParams.get('lang') as Language) || 'en')
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null)
  const [annotations, setAnnotations] = useState<Record<string, string>>({})
  const [annotationsLoading, setAnnotationsLoading] = useState(false)
  const [sectionOrder, setSectionOrder] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [startTime] = useState(Date.now())
  const [showContactErrors, setShowContactErrors] = useState(false)
  const [showWorkErrors, setShowWorkErrors] = useState(false)
  const [sessionRestored, setSessionRestored] = useState(false)
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  )

  const t = language === 'es' ? esStrings : enStrings
  const steps = t.steps as Record<string, { title: string; description: string }>

  // Fire-and-forget event logging
  const logEvent = useCallback((eventType: string, stepNumber?: number, sectionId?: string) => {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, session_id: sessionId, step_number: stepNumber, language, section_id: sectionId }),
    }).catch(() => {})
  }, [sessionId, language])

  // Log session start once on mount
  useEffect(() => {
    logEvent('session_start')
  }, [logEvent])

  // Restore state from sessionStorage on mount (handles iOS bfcache full unmount)
  useEffect(() => {
    if (generatedResume) { setSessionRestored(true); return }
    try {
      const saved = sessionStorage.getItem('mrb_resume')
      if (!saved) { setSessionRestored(true); return }
      const parsed = JSON.parse(saved)
      if (parsed.generatedResume && parsed.sectionOrder) {
        setGeneratedResume(parsed.generatedResume)
        setSectionOrder(parsed.sectionOrder)
        if (parsed.language) setLanguage(parsed.language)
        if (parsed.contact) {
          setFormData(prev => ({ ...prev, contact: { ...prev.contact, ...parsed.contact } }))
        }
        setCurrentStep(18)
      }
    } catch { /* ignore parse errors */ }
    setSessionRestored(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-hydrate from sessionStorage on bfcache restore (iOS Safari)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      if (generatedResume) return
      try {
        const saved = sessionStorage.getItem('mrb_resume')
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (parsed.generatedResume && parsed.sectionOrder) {
          setGeneratedResume(parsed.generatedResume)
          setSectionOrder(parsed.sectionOrder)
          if (parsed.language) setLanguage(parsed.language)
          if (parsed.contact) {
            setFormData(prev => ({ ...prev, contact: { ...prev.contact, ...parsed.contact } }))
          }
          setCurrentStep(18)
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [generatedResume])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateContact = (): boolean => {
    const { fullName, phone, email } = formData.contact
    return !!(fullName.trim() && phone.trim() && email.includes('@'))
  }

  const validateWork = (): boolean => {
    if (formData.work.length === 0) return true // skip-able, no entries = valid
    return formData.work.some(w => w.title.trim() && w.employer.trim())
  }

  const goNext = () => {
    if (currentStep === 1) {
      if (!validateContact()) {
        setShowContactErrors(true)
        return
      }
      setShowContactErrors(false)
    }
    if (currentStep === 2) {
      if (!validateWork()) {
        setShowWorkErrors(true)
        return
      }
      setShowWorkErrors(false)
    }
    logEvent('step_complete', currentStep)
    setCurrentStep(prev => prev + 1)
  }

  const goBack = () => setCurrentStep(prev => Math.max(0, prev - 1))
  const goSkip = () => {
    logEvent('step_complete', currentStep)
    setCurrentStep(prev => prev + 1)
  }

  const handleFinishQuestionnaire = async () => {
    logEvent('step_complete', 15)
    setCurrentStep(16)
    setIsGenerating(true)
    setGenerateError('')

    try {
      const resumeRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, language, callType: 'resume' }),
      })

      if (!resumeRes.ok) {
        const err = await resumeRes.json()
        if (err.error === 'rate_limited') {
          const wait = err.retryAfter ? ` Please wait ${Math.ceil(err.retryAfter / 60)} minute(s).` : ''
          throw new Error(t.errors.rateLimited + wait)
        }
        throw new Error(err.error || t.errors.generateFailed)
      }

      const resumeData = await resumeRes.json()
      const generated: GeneratedResume = { ...resumeData, language }
      setGeneratedResume(generated)

      const order = resumeData.sectionOrder || getDefaultSectionOrder(formData)
      setSectionOrder(order)

      // Persist to sessionStorage — survives iOS bfcache restores; clears on tab close
      try {
        sessionStorage.setItem('mrb_resume', JSON.stringify({
          generatedResume: generated,
          sectionOrder: order,
          contact: formData.contact,
          language,
        }))
      } catch { /* private mode or storage full — non-fatal */ }

      logEvent('resume_generated')

      // Save to Supabase (non-blocking)
      const completionTime = Math.round((Date.now() - startTime) / 1000)
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.contact.fullName.split(' ')[0],
          lastName: formData.contact.fullName.split(' ').slice(1).join(' '),
          language,
          completionTimeSeconds: completionTime,
          sectionOrder: order,
          rawData: formData,
          generatedResume: generated,
          sessionId,
        }),
      }).catch(() => {})

      // Move to preview first, then fire Call 2 (annotations) in the background
      setCurrentStep(17)
      setAnnotationsLoading(true)

      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: resumeData, language, callType: 'annotations' }),
      })
        .then(async res => {
          if (res.ok) {
            const data = await res.json()
            setAnnotations(data)
          }
        })
        .catch(() => {})
        .finally(() => setAnnotationsLoading(false))

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.generateFailed
      setGenerateError(message)
      setIsGenerating(false)
      setCurrentStep(15)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResumeChange = useCallback((updater: (prev: GeneratedResume) => GeneratedResume) => {
    setGeneratedResume(prev => prev ? updater(prev) : prev)
  }, [])

  const handleReorder = useCallback((newOrder: string[]) => {
    setSectionOrder(newOrder)
    logEvent('section_reordered')
  }, [logEvent])

  const commonProps = { formData, onChange: updateFormData, language }

  const renderStep = (step: number) => {
    if (step === 0) {
      const walkthrough = language === 'es' ? [
        { icon: '📝', title: 'Cuéntanos sobre ti', body: 'Te haremos preguntas sobre tu trabajo, educación, habilidades y logros. No hay respuestas incorrectas.' },
        { icon: '⏱️', title: 'Solo 15–20 minutos', body: 'Puedes saltar cualquier sección que no aplique. Ve a tu propio ritmo.' },
        { icon: '🤖', title: 'La IA crea tu currículum', body: 'Nuestra IA convierte tus respuestas en lenguaje profesional — sin inventar nada, solo puliendo lo que escribiste.' },
        { icon: '✏️', title: 'Edita todo antes de descargar', body: 'Revisa tu currículum, mueve secciones, edita el texto y descárgalo como PDF.' },
      ] : [
        { icon: '📝', title: 'Tell us about yourself', body: "We'll ask about your work, education, skills, and accomplishments. There are no wrong answers." },
        { icon: '⏱️', title: 'About 15–20 minutes', body: "You can skip any section that doesn't apply. Go at your own pace." },
        { icon: '🤖', title: 'AI builds your resume', body: "Our AI turns your answers into professional language — it never makes things up, only polishes what you wrote." },
        { icon: '✏️', title: 'Edit everything before you download', body: 'Review your resume, rearrange sections, edit any text, then download as a PDF.' },
      ]

      return (
        <div className="max-w-xl mx-auto px-5 py-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0A66C2] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'es' ? '¡Vamos a crear tu currículum!' : "Let's build your resume!"}
            </h1>
            <p className="text-gray-500 text-base">
              {language === 'es' ? 'Gratis · Profesional · Sin necesidad de cuenta' : 'Free · Professional · No account needed'}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {walkthrough.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">{item.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-8 flex gap-3 items-start">
            <span className="text-green-600 text-lg flex-shrink-0 mt-0.5">✓</span>
            <p className="text-green-800 text-sm leading-relaxed">
              {language === 'es'
                ? 'No te preocupes si tienes poca experiencia — estamos aquí para presentar lo que tienes de la mejor manera posible.'
                : "Don't worry if you have limited experience — we're here to present what you have in the best possible light."}
            </p>
          </div>

          <button onClick={goNext} className="w-full bg-[#0A66C2] text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-blue-700 transition-colors min-h-[56px]">
            {language === 'es' ? '¡Empecemos! →' : "Let's Start →"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            {language === 'es' ? 'Gratis · Sin cuenta · Sin límite de tiempo' : 'Free · No account · No time limit'}
          </p>
        </div>
      )
    }

    const stepInfo = steps[String(step)]
    if (!stepInfo) return null

    const skippableSteps = [4, 7, 8, 9, 10, 12]
    const isSkippable = skippableSteps.includes(step)

    const wrapperProps = {
      title: stepInfo.title,
      description: stepInfo.description,
      onBack: goBack,
      onNext: step === TOTAL_STEPS ? handleFinishQuestionnaire : goNext,
      language,
      currentStep: step,
      totalSteps: TOTAL_STEPS,
      isLastStep: step === TOTAL_STEPS,
      ...(isSkippable ? { onSkip: goSkip, skippable: true } : {}),
    }

    switch (step) {
      case 1: return <StepWrapper {...wrapperProps}><ContactInfo {...commonProps} showErrors={showContactErrors} /></StepWrapper>
      case 2: return <StepWrapper {...wrapperProps}><WorkExperience {...commonProps} showErrors={showWorkErrors} /></StepWrapper>
      case 3: return <StepWrapper {...wrapperProps}><Education {...commonProps} /></StepWrapper>
      case 4: return <StepWrapper {...wrapperProps}><VolunteerWork {...commonProps} /></StepWrapper>
      case 5: return <StepWrapper {...wrapperProps}><Certifications {...commonProps} /></StepWrapper>
      case 6: return <StepWrapper {...wrapperProps}><Skills {...commonProps} /></StepWrapper>
      case 7: return <StepWrapper {...wrapperProps}><Military {...commonProps} /></StepWrapper>
      case 8: return <StepWrapper {...wrapperProps}><Training {...commonProps} /></StepWrapper>
      case 9: return <StepWrapper {...wrapperProps}><Awards {...commonProps} /></StepWrapper>
      case 10: return <StepWrapper {...wrapperProps}><EmploymentGaps {...commonProps} /></StepWrapper>
      case 11: return <StepWrapper {...wrapperProps}><Accomplishments {...commonProps} /></StepWrapper>
      case 12: return <StepWrapper {...wrapperProps}><Interests {...commonProps} /></StepWrapper>
      case 13: return <StepWrapper {...wrapperProps}><References {...commonProps} /></StepWrapper>
      case 14: return <StepWrapper {...wrapperProps}><SummaryBuilder {...commonProps} /></StepWrapper>
      case 15: return <StepWrapper {...wrapperProps}><Availability {...commonProps} /></StepWrapper>
      default: return null
    }
  }

  // Wait for sessionStorage check to complete before rendering step 0
  if (!sessionRestored) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0A66C2] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (currentStep === 16) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-[#0A66C2] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.processing.title}</h2>
            <p className="text-gray-600 leading-relaxed">{t.processing.subtitle}</p>
          </div>
          {generateError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{generateError}</p>
              <button onClick={() => setCurrentStep(15)} className="mt-3 text-[#0A66C2] font-semibold text-sm underline">
                {language === 'es' ? 'Volver e intentar de nuevo' : 'Go back and try again'}
              </button>
            </div>
          )}
          <div className="mt-8 space-y-3 text-sm text-gray-500">
            {[t.processing.step1, t.processing.step2, t.processing.step3, t.processing.step4].map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-[#0A66C2] animate-pulse' : 'bg-gray-300'}`} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 17 && generatedResume) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="text-lg font-bold text-[#0A66C2]">MyResumeBuilder</div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </header>
        <ResumePreview
          resume={generatedResume}
          formData={formData}
          sectionOrder={sectionOrder}
          annotations={annotations}
          annotationsLoading={annotationsLoading}
          language={language}
          onReorder={handleReorder}
          onFinalize={() => setCurrentStep(18)}
          onResumeChange={handleResumeChange}
        />
      </div>
    )
  }

  if (currentStep === 18 && generatedResume) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hidden resume DOM node — keeps #resume-pdf-target in DOM for html2pdf on iOS */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
          <ResumeTemplate resume={generatedResume} sectionOrder={sectionOrder} contact={formData.contact} />
        </div>

        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-bold text-[#0A66C2]">MyResumeBuilder</div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.export.title}</h1>
            <p className="text-gray-600">{t.export.subtitle}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <PDFGenerator
              fullName={formData.contact.fullName}
              language={language}
              onExport={() => logEvent('export_pdf')}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t.export.emailTitle}</span>
              </div>
            </div>

            <EmailForm
              fullName={formData.contact.fullName}
              language={language}
              onExport={() => logEvent('export_email')}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={() => setCurrentStep(17)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 min-h-[44px]">
              {language === 'es' ? '← Volver a Vista Previa' : '← Back to Preview'}
            </button>
            <button
              onClick={() => { try { sessionStorage.removeItem('mrb_resume') } catch { /* ignore */ } setCurrentStep(0); setFormData(initialFormData); setGeneratedResume(null); setAnnotations({}); setSectionOrder([]) }}
              className="flex-1 py-3 border border-gray-300 text-gray-500 font-semibold rounded-lg hover:bg-gray-50 min-h-[44px]"
            >
              {t.export.startOver}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="text-base font-bold text-[#0A66C2]">MyResumeBuilder</div>
        <LanguageToggle language={language} onChange={setLanguage} />
      </header>
      <main>{renderStep(currentStep)}</main>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0A66C2] border-t-transparent rounded-full animate-spin" /></div>}>
      <BuilderContent />
    </Suspense>
  )
}
