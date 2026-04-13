'use client'

import { ReactNode } from 'react'
import type { Language } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkipButton } from '@/components/ui/SkipButton'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface StepWrapperProps {
  title: string
  description: string
  children: ReactNode
  onBack: () => void
  onNext: () => void
  onSkip?: () => void
  skippable?: boolean
  language: Language
  currentStep: number
  totalSteps: number
  isLastStep?: boolean
}

export function StepWrapper({
  title,
  description,
  children,
  onBack,
  onNext,
  onSkip,
  skippable = false,
  language,
  currentStep,
  totalSteps,
  isLastStep = false,
}: StepWrapperProps) {
  const t = language === 'es' ? esStrings : enStrings

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Progress */}
      <div className="mb-6">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} language={language} />
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 text-base leading-relaxed">{description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 mb-8">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t.nav.back}
        </button>

        <div className="flex items-center gap-3">
          {skippable && onSkip && (
            <SkipButton onSkip={onSkip} language={language} />
          )}
          <button
            onClick={onNext}
            className="min-h-[44px] px-6 py-3 bg-[#0A66C2] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastStep ? t.nav.buildResume : t.nav.next}
          </button>
        </div>
      </div>
    </div>
  )
}
