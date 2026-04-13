'use client'

import { useState, Suspense } from 'react'
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
import { PDFGenerator } from '@/components/export/PDFGenerator'
import { EmailForm } from '@/components/export/EmailForm'
import { getDefaultSectionOrder } from '@/lib/resume-logic'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

const initialFormData: FormData = {
  contact: {
    fullName: '',
    legalName: '',
    phone: '',
    email: '',
    addressOption: 'city-state',
    addressFull: '',
    cityState: '',
  },
  work: [],
  education: [],
  volunteer: [],
  certifications: [],
  skills: {
    computer: [],
    communication: [],
    physical: [],
    interpersonal: [],
    other: '',
  },
  military: null,
  training: [],
  awards: [],
  employmentGaps: [],
  accomplishments: [],
  interests: '',
  references: {
    type: 'request',
    list: [],
  },
  summary: {
    targetRole: '',
    strengths: '',
  },
  availability: {
    schedule: 'open',
    transportation: [],
    willingToRelocate: 'yes',
  },
}

const TOTAL_STEPS = 15

function BuilderContent() {
  const searchParams = useSearchParams()
  const [language, setLanguage] = useState<Language>((searchParams.get('lang') as Language) || 'en')
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null)
  const [annotations, setAnnotations] = useState<Record<string, string>>({})
  const [sectionOrder, setSectionOrder] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [startTime] = useState(Date.now())

  const t = language === 'es' ? esStrings : enStrings
  const steps = t.steps as Record<string, { title: string; description: string }>

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const goNext = () => setCurrentStep(prev => prev + 1)
  const goBack = () => setCurrentStep(prev => Math.max(0, prev - 1))
  const goSkip = () => setCurrentStep(prev => prev + 1)

  // Step 0: Intro screen
  // Steps 1-15: questionnaire
  // Step 16: generating
  // Step 17: preview
  // Step 18: export

  const handleFinishQuestionnaire = async () => {
    setCurrentStep(16)
    setIsGenerating(true)
    setGenerateError('')

    try {
      // Call 1: Generate resume
      const resumeRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, language, callType: 'resume' }),
      })

      if (!resumeRes.ok) {
        const err = await resumeRes.json()
        throw new Error(err.error || 'Generation failed')
      }

      const resumeData = await resumeRes.json()
      const generated: GeneratedResume = { ...resumeData, language }
      setGeneratedResume(generated)

      // Set section order from AI or default
      const order = resumeData.sectionOrder || getDefaultSectionOrder(formData)
      setSectionOrder(order)

      // Call 2: Generate annotations
      try {
        const annotRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData: resumeData, language, callType: 'annotations' }),
        })
        if (annotRes.ok) {
          const annotData = await annotRes.json()
          setAnnotations(annotData)
        }
      } catch {
        // Annotations are optional — continue without them
      }

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
        }),
      }).catch(() => {/* non-critical */})

      setCurrentStep(17)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.generateFailed
      setGenerateError(message)
      setIsGenerating(false)
      // Go back to last step on error
      setCurrentStep(15)
    } finally {
      setIsGenerating(false)
    }
  }

  const commonProps = { formData, onChange: updateFormData, language }

  const renderStep = (step: number) => {
    if (step === 0) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{steps['0'].title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">{steps['0'].description}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 mb-8 text-left space-y-3">
            {[
              language === 'es' ? '15 pasos rápidos — puedes saltar lo que no aplica' : '15 quick steps — skip anything that doesn\'t apply',
              language === 'es' ? 'La IA usa SOLO lo que escribes — nada inventado' : 'AI uses ONLY what you write — nothing made up',
              language === 'es' ? 'Descarga tu currículum como PDF cuando termines' : 'Download your resume as a PDF when done',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-[#0A66C2] text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-full sm:w-auto bg-[#0A66C2] text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-blue-700 transition-colors min-h-[56px]"
          >
            {language === 'es' ? 'Empezar →' : 'Get Started →'}
          </button>
        </div>
      )
    }

    const stepInfo = steps[String(step)]
    if (!stepInfo) return null

    const stepProps = {
      title: stepInfo.title,
      description: stepInfo.description,
      onBack: goBack,
      onNext: step === TOTAL_STEPS ? handleFinishQuestionnaire : goNext,
      language,
      currentStep: step,
      totalSteps: TOTAL_STEPS,
      isLastStep: step === TOTAL_STEPS,
    }

    const skippableSteps = [4, 7, 8, 9, 10, 12]
    const isSkippable = skippableSteps.includes(step)

    const wrapperProps = {
      ...stepProps,
      ...(isSkippable ? { onSkip: goSkip, skippable: true } : {}),
    }

    switch (step) {
      case 1:
        return <StepWrapper {...wrapperProps}><ContactInfo {...commonProps} /></StepWrapper>
      case 2:
        return <StepWrapper {...wrapperProps}><WorkExperience {...commonProps} /></StepWrapper>
      case 3:
        return <StepWrapper {...wrapperProps}><Education {...commonProps} /></StepWrapper>
      case 4:
        return <StepWrapper {...wrapperProps}><VolunteerWork {...commonProps} /></StepWrapper>
      case 5:
        return <StepWrapper {...wrapperProps}><Certifications {...commonProps} /></StepWrapper>
      case 6:
        return <StepWrapper {...wrapperProps}><Skills {...commonProps} /></StepWrapper>
      case 7:
        return <StepWrapper {...wrapperProps}><Military {...commonProps} /></StepWrapper>
      case 8:
        return <StepWrapper {...wrapperProps}><Training {...commonProps} /></StepWrapper>
      case 9:
        return <StepWrapper {...wrapperProps}><Awards {...commonProps} /></StepWrapper>
      case 10:
        return <StepWrapper {...wrapperProps}><EmploymentGaps {...commonProps} /></StepWrapper>
      case 11:
        return <StepWrapper {...wrapperProps}><Accomplishments {...commonProps} /></StepWrapper>
      case 12:
        return <StepWrapper {...wrapperProps}><Interests {...commonProps} /></StepWrapper>
      case 13:
        return <StepWrapper {...wrapperProps}><References {...commonProps} /></StepWrapper>
      case 14:
        return <StepWrapper {...wrapperProps}><SummaryBuilder {...commonProps} /></StepWrapper>
      case 15:
        return <StepWrapper {...wrapperProps}><Availability {...commonProps} /></StepWrapper>
      default:
        return null
    }
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
              <button
                onClick={() => setCurrentStep(15)}
                className="mt-3 text-[#0A66C2] font-semibold text-sm underline"
              >
                {language === 'es' ? 'Volver e intentar de nuevo' : 'Go back and try again'}
              </button>
            </div>
          )}

          <div className="mt-8 space-y-3 text-sm text-gray-500">
            {[t.processing.step1, t.processing.step2, t.processing.step3, t.processing.step4].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-[#0A66C2] animate-pulse' : 'bg-gray-300'}`} />
                <span>{step}</span>
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
          language={language}
          onReorder={setSectionOrder}
          onFinalize={() => setCurrentStep(18)}
        />
      </div>
    )
  }

  if (currentStep === 18 && generatedResume) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            <PDFGenerator fullName={formData.contact.fullName} language={language} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t.export.emailTitle}</span>
              </div>
            </div>

            <EmailForm fullName={formData.contact.fullName} language={language} />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentStep(17)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 min-h-[44px]"
            >
              {language === 'es' ? '← Volver a Vista Previa' : '← Back to Preview'}
            </button>
            <button
              onClick={() => {
                setCurrentStep(0)
                setFormData(initialFormData)
                setGeneratedResume(null)
                setAnnotations({})
                setSectionOrder([])
              }}
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

      <main>
        {renderStep(currentStep)}
      </main>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A66C2] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}
