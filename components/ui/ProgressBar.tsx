'use client'

import type { Language } from '@/types'
import enStrings from '@/lib/i18n/en.json'
import esStrings from '@/lib/i18n/es.json'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  language: Language
}

export function ProgressBar({ currentStep, totalSteps, language }: ProgressBarProps) {
  const t = language === 'es' ? esStrings : enStrings
  const percent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-500">
          {t.progress.step} {currentStep} {t.progress.of} {totalSteps}
        </span>
        <span className="text-sm text-gray-500">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-[#0A66C2] h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
        />
      </div>
    </div>
  )
}
